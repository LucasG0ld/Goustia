-- P40-P44 : navigation hebdomadaire, fiche recette et interactions.

alter table public.recipe_versions
  add column tips text[] not null default '{}',
  add column variants text[] not null default '{}',
  add column storage_instructions text,
  add column reheating_instructions text;

create table public.recipe_equipment_requirements (
  recipe_version_id uuid not null
    references public.recipe_versions (id) on delete cascade,
  equipment_id uuid not null references public.equipment (id) on delete restrict,
  optional boolean not null default false,
  notes text check (notes is null or char_length(trim(notes)) between 1 and 300),
  primary key (recipe_version_id, equipment_id)
);

create table public.recipe_substitutions (
  recipe_version_id uuid not null
    references public.recipe_versions (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  substitute_ingredient_id uuid not null
    references public.ingredients (id) on delete restrict,
  note text check (note is null or char_length(trim(note)) between 1 and 300),
  primary key (recipe_version_id, ingredient_id, substitute_ingredient_id),
  check (ingredient_id <> substitute_ingredient_id)
);

alter table public.recipe_reactions
  add column reason_detail text check (
    reason_detail is null or char_length(trim(reason_detail)) between 1 and 500
  );

create type public.recipe_action_kind as enum (
  'like', 'dislike', 'clear_reaction', 'favorite', 'unfavorite',
  'cooked', 'shopping', 'report'
);

create table public.recipe_action_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  action public.recipe_action_kind not null,
  surface text not null check (surface in ('home', 'planning', 'recipe')),
  reason_category public.dislike_reason,
  idempotency_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (
    timezone('utc', now()) + interval '90 days'
  ),
  unique (user_id, idempotency_key),
  check (expires_at > created_at)
);

create table public.cooking_sessions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_version_id uuid not null
    references public.recipe_versions (id) on delete cascade,
  requested_servings smallint not null check (requested_servings between 1 and 8),
  checked_steps smallint[] not null default '{}',
  timer_ends_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, recipe_version_id)
);

alter table public.recipe_swaps
  add column preserve_calories boolean not null default false,
  add column preserve_protein boolean not null default false,
  add column preserve_budget boolean not null default false,
  add column preserve_duration boolean not null default false,
  add column quota_counted boolean not null default false;

alter table public.recipe_equipment_requirements enable row level security;
alter table public.recipe_substitutions enable row level security;
alter table public.recipe_action_events enable row level security;
alter table public.cooking_sessions enable row level security;

create policy "visible recipe equipment is readable"
on public.recipe_equipment_requirements for select
to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_version_id
      and app_private.is_recipe_visible(rv.recipe_id)
  )
);

create policy "visible recipe substitutions are readable"
on public.recipe_substitutions for select
to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_version_id
      and app_private.is_recipe_visible(rv.recipe_id)
  )
);

create policy "users read own recipe action events"
on public.recipe_action_events for select
to authenticated using (user_id = auth.uid());

create policy "users insert own recipe action events"
on public.recipe_action_events for insert
to authenticated with check (user_id = auth.uid());

create policy "users manage own cooking sessions"
on public.cooking_sessions for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index recipe_action_events_expiry_idx
  on public.recipe_action_events (expires_at);
create index recipe_swaps_meal_created_idx
  on public.recipe_swaps (planned_meal_id, requested_at desc);

insert into public.data_retention_policies (
  data_category, retention_days, rationale
)
values (
  'recipe_action_events',
  90,
  'Mesure produit fermée sans texte libre ni donnée de santé.'
)
on conflict (data_category) do update
set retention_days = excluded.retention_days,
    rationale = excluded.rationale,
    updated_at = timezone('utc', now());

create or replace function public.complete_recipe_swap(
  p_planned_meal_id uuid,
  p_from_recipe_version_id uuid,
  p_to_recipe_version_id uuid,
  p_request_summary text,
  p_preserve_calories boolean,
  p_preserve_protein boolean,
  p_preserve_budget boolean,
  p_preserve_duration boolean,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  meal_row public.planned_meals%rowtype;
  existing_swap public.recipe_swaps%rowtype;
  quota_row public.usage_quotas%rowtype;
  window_start_value timestamptz := date_trunc('day', timezone('utc', now()));
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_from_recipe_version_id = p_to_recipe_version_id
     or char_length(coalesce(p_request_summary, '')) > 500 then
    raise exception 'invalid swap' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(actor::text || ':' || p_idempotency_key::text, 0)
  );
  select * into existing_swap
  from public.recipe_swaps
  where user_id = actor and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'recipeVersionId', existing_swap.to_recipe_version_id,
      'replayed', true
    );
  end if;

  select * into meal_row
  from public.planned_meals
  where id = p_planned_meal_id and user_id = actor
  for update;
  if not found then
    raise exception 'planned meal not found' using errcode = 'P0002';
  end if;
  if meal_row.recipe_version_id <> p_from_recipe_version_id then
    raise exception 'planned meal changed' using errcode = '40001';
  end if;
  if not exists (
    select 1 from public.recipe_versions rv
    where rv.id = p_to_recipe_version_id
      and rv.validation_status = 'validated'
      and rv.publication_status <> 'archived'
      and app_private.is_recipe_visible(rv.recipe_id)
  ) then
    raise exception 'target recipe unavailable' using errcode = '42501';
  end if;

  insert into public.usage_quotas (
    user_id, quota_key, window_start, window_end, used_count, limit_count
  )
  values (
    actor, 'recipe_swap', window_start_value,
    window_start_value + interval '1 day', 0, 5
  )
  on conflict (user_id, quota_key, window_start) do nothing;

  select * into quota_row
  from public.usage_quotas
  where user_id = actor
    and quota_key = 'recipe_swap'
    and window_start = window_start_value
  for update;
  if quota_row.used_count >= quota_row.limit_count then
    raise exception 'swap quota exceeded' using errcode = 'P0001';
  end if;

  update public.planned_meals
  set recipe_version_id = p_to_recipe_version_id,
      revision = revision + 1,
      updated_at = timezone('utc', now())
  where id = meal_row.id;
  update public.meal_plans
  set revision = revision + 1,
      updated_at = timezone('utc', now())
  where id = meal_row.meal_plan_id and user_id = actor;
  update public.usage_quotas
  set used_count = used_count + 1,
      updated_at = timezone('utc', now())
  where user_id = actor
    and quota_key = 'recipe_swap'
    and window_start = window_start_value;
  insert into public.recipe_swaps (
    user_id, planned_meal_id, from_recipe_version_id, to_recipe_version_id,
    status, request_summary, idempotency_key, completed_at,
    preserve_calories, preserve_protein, preserve_budget, preserve_duration,
    quota_counted
  )
  values (
    actor, p_planned_meal_id, p_from_recipe_version_id,
    p_to_recipe_version_id, 'completed', nullif(trim(p_request_summary), ''),
    p_idempotency_key, timezone('utc', now()), p_preserve_calories,
    p_preserve_protein, p_preserve_budget, p_preserve_duration, true
  );
  insert into public.preference_learning_events (
    user_id, recipe_id, interaction_kind, subject_kind, subject_code,
    weight, idempotency_key
  )
  select
    actor, rv.recipe_id, 'swap', 'dish_type',
    'recipe:' || rv.recipe_id::text, -1.5, p_idempotency_key
  from public.recipe_versions rv
  where rv.id = p_from_recipe_version_id
  on conflict (user_id, idempotency_key) do nothing;
  return jsonb_build_object(
    'recipeVersionId', p_to_recipe_version_id,
    'replayed', false
  );
end;
$$;

revoke all on function public.complete_recipe_swap(
  uuid, uuid, uuid, text, boolean, boolean, boolean, boolean, uuid
) from public;
grant execute on function public.complete_recipe_swap(
  uuid, uuid, uuid, text, boolean, boolean, boolean, boolean, uuid
) to authenticated;

create or replace function public.copy_meal_plan_week(
  p_source_week_start date,
  p_target_week_start date,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  source_plan_id uuid;
  target_plan_id uuid;
  copied_count integer;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if extract(isodow from p_source_week_start) <> 1
     or extract(isodow from p_target_week_start) <> 1
     or p_source_week_start = p_target_week_start then
    raise exception 'invalid planning weeks' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(actor::text || ':' || p_target_week_start::text, 0)
  );
  select id into source_plan_id
  from public.meal_plans
  where user_id = actor and week_start = p_source_week_start;
  if source_plan_id is null or not exists (
    select 1 from public.planned_meals
    where meal_plan_id = source_plan_id and user_id = actor
  ) then
    raise exception 'source week empty' using errcode = 'P0002';
  end if;

  insert into public.meal_plans (user_id, week_start, idempotency_key)
  values (actor, p_target_week_start, p_idempotency_key)
  on conflict (user_id, week_start) do nothing;
  select id into target_plan_id
  from public.meal_plans
  where user_id = actor and week_start = p_target_week_start
  for update;
  if exists (
    select 1 from public.planned_meals
    where meal_plan_id = target_plan_id and user_id = actor
  ) then
    return jsonb_build_object(
      'id', target_plan_id, 'copiedCount', 0, 'replayed', true
    );
  end if;

  insert into public.planned_meals (
    meal_plan_id, user_id, recipe_version_id, meal_date, meal_type,
    servings, is_locked
  )
  select
    target_plan_id, actor, recipe_version_id,
    p_target_week_start + (meal_date - p_source_week_start),
    meal_type, servings, is_locked
  from public.planned_meals
  where meal_plan_id = source_plan_id and user_id = actor;
  get diagnostics copied_count = row_count;
  return jsonb_build_object(
    'id', target_plan_id, 'copiedCount', copied_count, 'replayed', false
  );
end;
$$;

revoke all on function public.copy_meal_plan_week(date, date, uuid) from public;
grant execute on function public.copy_meal_plan_week(date, date, uuid)
to authenticated;
