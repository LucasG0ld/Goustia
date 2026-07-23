create type public.preference_interaction_kind as enum (
  'like', 'favorite', 'cooked', 'dislike', 'swap', 'ignored'
);
create type public.learned_preference_subject_kind as enum (
  'ingredient', 'cuisine', 'duration', 'budget', 'dish_type'
);
create type public.preference_learning_status as enum (
  'pending', 'processed', 'failed'
);
create type public.planned_meal_mutation_kind as enum (
  'add', 'update', 'remove', 'regenerate'
);

create table public.preference_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete cascade,
  interaction_kind public.preference_interaction_kind not null,
  subject_kind public.learned_preference_subject_kind not null,
  subject_code text not null check (
    char_length(trim(subject_code)) between 1 and 160
  ),
  dislike_reason public.dislike_reason,
  weight numeric(6, 3) not null check (weight between -12 and 12),
  idempotency_key uuid not null,
  status public.preference_learning_status not null default 'pending',
  occurred_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  reverted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, idempotency_key),
  check (
    subject_kind <> 'ingredient'
    or subject_code !~* '^(allergy|allergen|allergie):'
  )
);

create table public.learned_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject_kind public.learned_preference_subject_kind not null,
  subject_code text not null check (
    char_length(trim(subject_code)) between 1 and 160
  ),
  score numeric(6, 2) not null default 0 check (score between -12 and 12),
  signal_count integer not null default 0 check (signal_count >= 0),
  corrected_score numeric(6, 2) check (corrected_score between -12 and 12),
  corrected_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, subject_kind, subject_code),
  check (
    subject_kind <> 'ingredient'
    or subject_code !~* '^(allergy|allergen|allergie):'
  )
);

comment on table public.preference_learning_events is
  'Historique pseudonymisé, traçable et réversible des signaux de préférence.';
comment on table public.learned_preferences is
  'Préférences déduites ; structurellement séparées des contraintes alimentaires.';

alter table public.meal_plans
  add column revision integer not null default 1 check (revision > 0);
alter table public.planned_meals
  add column revision integer not null default 1 check (revision > 0);

create table public.planned_meal_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  planned_meal_id uuid references public.planned_meals (id) on delete set null,
  kind public.planned_meal_mutation_kind not null,
  idempotency_key uuid not null,
  resulting_plan_revision integer not null check (resulting_plan_revision > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, idempotency_key)
);

create index preference_events_user_subject_idx
  on public.preference_learning_events (
    user_id, subject_kind, subject_code, occurred_at desc
  );
create index planned_meals_plan_order_idx
  on public.planned_meals (meal_plan_id, meal_date, meal_type);
create index planned_meal_mutations_plan_idx
  on public.planned_meal_mutations (meal_plan_id, created_at desc);

create or replace function public.record_preference_learning_signal(
  p_recipe_id uuid,
  p_interaction_kind public.preference_interaction_kind,
  p_subject_kind public.learned_preference_subject_kind,
  p_subject_code text,
  p_dislike_reason public.dislike_reason,
  p_weight numeric,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  event_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if nullif(trim(p_subject_code), '') is null
     or char_length(trim(p_subject_code)) > 160
     or p_weight not between -12 and 12
     or (p_subject_kind = 'ingredient'
       and p_subject_code ~* '^(allergy|allergen|allergie):') then
    raise exception 'invalid preference signal' using errcode = '22023';
  end if;

  insert into public.preference_learning_events (
    user_id, recipe_id, interaction_kind, subject_kind, subject_code,
    dislike_reason, weight, idempotency_key
  )
  values (
    auth.uid(), p_recipe_id, p_interaction_kind, p_subject_kind,
    trim(p_subject_code), p_dislike_reason, p_weight, p_idempotency_key
  )
  on conflict (user_id, idempotency_key)
  do update set idempotency_key = excluded.idempotency_key
  returning id into event_id;
  return event_id;
end;
$$;

create or replace function public.correct_learned_preference(
  p_subject_kind public.learned_preference_subject_kind,
  p_subject_code text,
  p_corrected_score numeric
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_corrected_score is not null and p_corrected_score not between -12 and 12 then
    raise exception 'invalid corrected score' using errcode = '22023';
  end if;
  update public.learned_preferences
  set corrected_score = p_corrected_score,
      corrected_at = case
        when p_corrected_score is null then null
        else timezone('utc', now())
      end,
      updated_at = timezone('utc', now())
  where user_id = auth.uid()
    and subject_kind = p_subject_kind
    and subject_code = p_subject_code;
  return found;
end;
$$;

create or replace function public.revert_preference_learning_signal(
  p_event_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  update public.preference_learning_events
  set reverted_at = coalesce(reverted_at, timezone('utc', now())),
      status = 'pending',
      processed_at = null
  where id = p_event_id and user_id = auth.uid();
  return found;
end;
$$;

create or replace function public.apply_planned_meal_mutation(
  p_meal_plan_id uuid,
  p_kind public.planned_meal_mutation_kind,
  p_idempotency_key uuid,
  p_expected_plan_revision integer,
  p_planned_meal_id uuid default null,
  p_recipe_version_id uuid default null,
  p_meal_date date default null,
  p_meal_type public.meal_type default null,
  p_servings smallint default null,
  p_is_locked boolean default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  plan_row public.meal_plans%rowtype;
  meal_row public.planned_meals%rowtype;
  existing_revision integer;
  next_revision integer;
  result_meal_id uuid;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select resulting_plan_revision into existing_revision
  from public.planned_meal_mutations
  where user_id = actor and idempotency_key = p_idempotency_key;
  if existing_revision is not null then
    return jsonb_build_object(
      'planRevision', existing_revision,
      'plannedMealId', p_planned_meal_id,
      'replayed', true
    );
  end if;

  select * into plan_row
  from public.meal_plans
  where id = p_meal_plan_id and user_id = actor
  for update;
  if not found then
    raise exception 'meal plan not found' using errcode = 'P0002';
  end if;
  if plan_row.revision <> p_expected_plan_revision then
    raise exception 'MEAL_PLAN_CONFLICT' using errcode = '40001';
  end if;

  if p_kind = 'add' then
    if p_recipe_version_id is null or p_meal_date is null
       or p_meal_type is null or p_servings not between 1 and 8 then
      raise exception 'invalid add mutation' using errcode = '22023';
    end if;
    if p_meal_date < plan_row.week_start
       or p_meal_date > plan_row.week_start + 6 then
      raise exception 'meal outside plan week' using errcode = '22023';
    end if;
    if not exists (
      select 1
      from public.recipe_versions rv
      where rv.id = p_recipe_version_id
        and app_private.is_recipe_visible(rv.recipe_id)
    ) then
      raise exception 'recipe is not visible' using errcode = '42501';
    end if;
    insert into public.planned_meals (
      meal_plan_id, user_id, recipe_version_id, meal_date, meal_type,
      servings, is_locked
    )
    values (
      p_meal_plan_id, actor, p_recipe_version_id, p_meal_date, p_meal_type,
      p_servings, coalesce(p_is_locked, false)
    )
    returning id into result_meal_id;
  elsif p_kind = 'update' then
    select * into meal_row
    from public.planned_meals
    where id = p_planned_meal_id
      and meal_plan_id = p_meal_plan_id
      and user_id = actor
    for update;
    if not found then
      raise exception 'planned meal not found' using errcode = 'P0002';
    end if;
    if coalesce(p_meal_date, meal_row.meal_date) < plan_row.week_start
       or coalesce(p_meal_date, meal_row.meal_date) > plan_row.week_start + 6
       or coalesce(p_servings, meal_row.servings) not between 1 and 8 then
      raise exception 'invalid update mutation' using errcode = '22023';
    end if;
    update public.planned_meals
    set meal_date = coalesce(p_meal_date, meal_date),
        meal_type = coalesce(p_meal_type, meal_type),
        servings = coalesce(p_servings, servings),
        is_locked = coalesce(p_is_locked, is_locked),
        revision = revision + 1,
        updated_at = timezone('utc', now())
    where id = meal_row.id
    returning id into result_meal_id;
  elsif p_kind = 'remove' then
    delete from public.planned_meals
    where id = p_planned_meal_id
      and meal_plan_id = p_meal_plan_id
      and user_id = actor
    returning id into result_meal_id;
    if result_meal_id is null then
      raise exception 'planned meal not found' using errcode = 'P0002';
    end if;
  elsif p_kind = 'regenerate' then
    if not exists (
      select 1 from public.planned_meals
      where meal_plan_id = p_meal_plan_id and user_id = actor and not is_locked
    ) then
      raise exception 'no unlocked meals' using errcode = '22023';
    end if;
    update public.meal_plans set status = 'generating'
    where id = p_meal_plan_id;
  else
    raise exception 'unsupported mutation' using errcode = '22023';
  end if;

  next_revision := plan_row.revision + 1;
  update public.meal_plans
  set revision = next_revision, updated_at = timezone('utc', now())
  where id = p_meal_plan_id;
  insert into public.planned_meal_mutations (
    user_id, meal_plan_id, planned_meal_id, kind, idempotency_key,
    resulting_plan_revision
  )
  values (
    actor, p_meal_plan_id, result_meal_id, p_kind, p_idempotency_key,
    next_revision
  );
  return jsonb_build_object(
    'planRevision', next_revision,
    'plannedMealId', result_meal_id,
    'replayed', false
  );
exception
  when unique_violation then
    raise exception 'MEAL_SLOT_CONFLICT' using errcode = '23505';
end;
$$;

create or replace function public.complete_plan_regeneration(
  p_user_id uuid,
  p_meal_plan_id uuid,
  p_expected_plan_revision integer,
  p_recipe_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  plan_revision integer;
  unlocked_meal record;
  recipe_id_value uuid;
  recipe_version_id_value uuid;
  recipe_index integer := 1;
begin
  select revision into plan_revision
  from public.meal_plans
  where id = p_meal_plan_id
    and user_id = p_user_id
    and status = 'generating'
  for update;
  if plan_revision is null or plan_revision <> p_expected_plan_revision then
    raise exception 'MEAL_PLAN_CONFLICT' using errcode = '40001';
  end if;
  if cardinality(p_recipe_ids) < (
    select count(*) from public.planned_meals
    where meal_plan_id = p_meal_plan_id
      and user_id = p_user_id
      and not is_locked
  ) then
    raise exception 'not enough generated recipes' using errcode = '22023';
  end if;

  for unlocked_meal in
    select id from public.planned_meals
    where meal_plan_id = p_meal_plan_id
      and user_id = p_user_id
      and not is_locked
    order by meal_date, meal_type
    for update
  loop
    recipe_id_value := p_recipe_ids[recipe_index];
    select id into recipe_version_id_value
    from public.recipe_versions
    where recipe_id = recipe_id_value
      and validation_status = 'validated'
      and publication_status <> 'archived'
    order by version_number desc
    limit 1;
    if recipe_version_id_value is null then
      raise exception 'generated recipe is unavailable' using errcode = '22023';
    end if;
    update public.planned_meals
    set recipe_version_id = recipe_version_id_value,
        revision = revision + 1,
        updated_at = timezone('utc', now())
    where id = unlocked_meal.id;
    recipe_index := recipe_index + 1;
  end loop;

  update public.meal_plans
  set status = 'ready',
      revision = revision + 1,
      updated_at = timezone('utc', now())
  where id = p_meal_plan_id
  returning revision into plan_revision;
  return plan_revision;
end;
$$;

alter table public.preference_learning_events enable row level security;
alter table public.learned_preferences enable row level security;
alter table public.planned_meal_mutations enable row level security;

create policy "users read own preference events"
on public.preference_learning_events for select to authenticated
using (user_id = auth.uid());
create policy "users insert own preference events"
on public.preference_learning_events for insert to authenticated
with check (user_id = auth.uid());
create policy "users update own preference events"
on public.preference_learning_events for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own learned preferences"
on public.learned_preferences for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read own planning mutations"
on public.planned_meal_mutations for select to authenticated
using (user_id = auth.uid());
create policy "users insert own planning mutations"
on public.planned_meal_mutations for insert to authenticated
with check (user_id = auth.uid());

grant select, insert, update
on public.preference_learning_events to authenticated;
grant select, insert, update
on public.learned_preferences to authenticated;
grant select, insert
on public.planned_meal_mutations to authenticated;

revoke all on function public.record_preference_learning_signal(
  uuid, public.preference_interaction_kind,
  public.learned_preference_subject_kind, text, public.dislike_reason,
  numeric, uuid
) from public;
revoke all on function public.correct_learned_preference(
  public.learned_preference_subject_kind, text, numeric
) from public;
revoke all on function public.revert_preference_learning_signal(uuid)
from public;
revoke all on function public.apply_planned_meal_mutation(
  uuid, public.planned_meal_mutation_kind, uuid, integer, uuid, uuid, date,
  public.meal_type, smallint, boolean
) from public;
revoke all on function public.complete_plan_regeneration(
  uuid, uuid, integer, uuid[]
) from public;
grant execute on function public.record_preference_learning_signal(
  uuid, public.preference_interaction_kind,
  public.learned_preference_subject_kind, text, public.dislike_reason,
  numeric, uuid
) to authenticated;
grant execute on function public.correct_learned_preference(
  public.learned_preference_subject_kind, text, numeric
) to authenticated;
grant execute on function public.revert_preference_learning_signal(uuid)
to authenticated;
grant execute on function public.apply_planned_meal_mutation(
  uuid, public.planned_meal_mutation_kind, uuid, integer, uuid, uuid, date,
  public.meal_type, smallint, boolean
) to authenticated;
grant execute on function public.complete_plan_regeneration(
  uuid, uuid, integer, uuid[]
) to service_role;
