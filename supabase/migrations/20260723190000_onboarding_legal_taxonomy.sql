-- P20-P24 : conformité documentaire, onboarding progressif et taxonomie v1.

create type public.legal_document_kind as enum (
  'privacy_policy',
  'terms',
  'legal_notice',
  'cookie_policy',
  'nutrition_disclaimer',
  'food_safety_notice'
);
create type public.onboarding_step_key as enum (
  'account',
  'food_safety',
  'goals',
  'initial_tastes',
  'first_generation'
);
create type public.onboarding_event_kind as enum (
  'viewed',
  'completed',
  'skipped',
  'abandoned'
);
create type public.preference_source as enum (
  'explicit',
  'interaction',
  'inferred'
);

create table public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  kind public.legal_document_kind not null,
  version text not null check (version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}-draft\.[0-9]+$'),
  title text not null check (char_length(trim(title)) between 3 and 160),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  is_current boolean not null default false,
  requires_acceptance boolean not null default false,
  published_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (kind, version)
);
create unique index legal_document_current_kind_idx
  on public.legal_document_versions (kind)
  where is_current;

create table public.user_legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  document_version_id uuid not null references public.legal_document_versions (id) on delete restrict,
  source text not null check (source in ('signup', 'settings', 'migration')),
  accepted_at timestamptz not null default timezone('utc', now()),
  withdrawn_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (subject_hash, document_version_id)
);

create table public.onboarding_steps (
  user_id uuid not null references public.profiles (id) on delete cascade,
  step public.onboarding_step_key not null,
  completed_at timestamptz,
  skipped_at timestamptz,
  data_version smallint not null default 1 check (data_version > 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, step),
  check (num_nonnulls(completed_at, skipped_at) <= 1),
  check (step not in ('account', 'food_safety', 'goals') or skipped_at is null)
);

create table public.onboarding_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  step public.onboarding_step_key not null,
  event public.onboarding_event_kind not null,
  duration_bucket text check (
    duration_bucket is null
    or duration_bucket in ('under_30s', '30s_2m', '2m_5m', 'over_5m')
  ),
  occurred_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '90 days')
);

create table public.onboarding_dishes (
  id uuid primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_fr text not null,
  description_fr text not null,
  cuisine_code text not null,
  is_active boolean not null default true,
  display_order smallint not null unique
);

create table public.onboarding_dish_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  dish_id uuid not null references public.onboarding_dishes (id) on delete restrict,
  signal public.preference_signal not null check (signal = 'liked'),
  learned_from public.preference_source not null default 'explicit',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, dish_id)
);

create table public.user_ingredient_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  signal public.preference_signal not null,
  learned_from public.preference_source not null default 'explicit',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, ingredient_id)
);

create table public.contextual_question_state (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_key text not null check (question_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  ask_count smallint not null default 0 check (ask_count between 0 and 20),
  last_asked_at timestamptz,
  answered_at timestamptz,
  snoozed_until timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, question_key)
);

alter table public.profiles
add column food_safety_confirmed_at timestamptz;

alter table public.user_equipment
add column learned_from public.preference_source not null default 'explicit';
alter table public.duration_preferences
add column learned_from public.preference_source not null default 'explicit';
alter table public.budget_preferences
add column learned_from public.preference_source not null default 'explicit';

create unique index user_constraint_ingredient_unique_idx
  on public.user_food_constraints (user_id, ingredient_id)
  where ingredient_id is not null;
create unique index user_constraint_allergen_unique_idx
  on public.user_food_constraints (user_id, allergen_id)
  where allergen_id is not null;

create table public.taxonomy_versions (
  id uuid primary key,
  version text not null unique,
  locale text not null default 'fr-FR' check (locale = 'fr-FR'),
  source_name text not null,
  source_url text not null,
  source_checked_at date not null,
  imported_at timestamptz not null default timezone('utc', now()),
  is_current boolean not null default false
);
create unique index taxonomy_versions_current_idx
  on public.taxonomy_versions (is_current)
  where is_current;

insert into public.taxonomy_versions (
  id, version, source_name, source_url, source_checked_at, is_current
)
values (
  '81000000-0000-4000-8000-000000000001',
  'fr-benchmark-v1',
  'Règlement (UE) n° 1169/2011, annexe II et corpus benchmark Goustia',
  'https://eur-lex.europa.eu/eli/reg/2011/1169/oj?locale=fr',
  '2026-07-23',
  true
);

alter table public.ingredient_families
add column taxonomy_version_id uuid not null default '81000000-0000-4000-8000-000000000001'
references public.taxonomy_versions (id) on delete restrict;
alter table public.ingredients
add column taxonomy_version_id uuid not null default '81000000-0000-4000-8000-000000000001'
references public.taxonomy_versions (id) on delete restrict;
alter table public.ingredients
add column source_reference text;
alter table public.ingredient_synonyms
add column taxonomy_version_id uuid not null default '81000000-0000-4000-8000-000000000001'
references public.taxonomy_versions (id) on delete restrict;

create table public.ingredient_units (
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  unit text not null check (
    unit in (
      'g', 'kg', 'ml', 'l', 'piece', 'teaspoon', 'tablespoon',
      'pinch', 'bunch', 'slice', 'clove', 'to_taste'
    )
  ),
  is_preferred boolean not null default false,
  taxonomy_version_id uuid not null references public.taxonomy_versions (id) on delete restrict,
  primary key (ingredient_id, unit)
);

create table public.ingredient_corrections (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  requested_by uuid references auth.users (id) on delete set null,
  field_name text not null check (
    field_name in ('name_fr', 'family_id', 'contains_alcohol', 'is_active', 'source_reference')
  ),
  previous_value text,
  corrected_value text not null,
  rationale text not null check (char_length(trim(rationale)) between 10 and 1000),
  source_url text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.complete_food_safety_onboarding(
  p_constraints jsonb,
  p_no_constraints boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  item record;
  item_count integer;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_constraints) <> 'array' then
    raise exception 'constraints must be an array' using errcode = '22023';
  end if;

  item_count := jsonb_array_length(p_constraints);
  if item_count > 100 or (p_no_constraints and item_count <> 0)
     or (not p_no_constraints and item_count = 0) then
    raise exception 'inconsistent food safety submission' using errcode = '22023';
  end if;

  delete from public.user_food_constraints
  where user_id = current_user_id
    and kind in ('allergy', 'intolerance', 'strict_exclusion');

  for item in
    select *
    from jsonb_to_recordset(p_constraints)
      as x(target_type text, target_id uuid, kind text, severity text)
  loop
    if item.target_type not in ('ingredient', 'allergen')
       or item.kind not in ('allergy', 'intolerance', 'strict_exclusion')
       or item.severity not in ('none', 'mild', 'moderate', 'severe') then
      raise exception 'invalid food constraint' using errcode = '22023';
    end if;

    if item.target_type = 'ingredient' and not exists (
      select 1 from public.ingredients i where i.id = item.target_id and i.is_active
    ) then
      raise exception 'unknown ingredient' using errcode = '22023';
    end if;
    if item.target_type = 'allergen' and not exists (
      select 1 from public.allergens a where a.id = item.target_id
    ) then
      raise exception 'unknown allergen' using errcode = '22023';
    end if;

    insert into public.user_food_constraints (
      user_id, ingredient_id, allergen_id, kind, severity, is_absolute
    )
    values (
      current_user_id,
      case when item.target_type = 'ingredient' then item.target_id end,
      case when item.target_type = 'allergen' then item.target_id end,
      item.kind::public.food_constraint_kind,
      item.severity::public.constraint_severity,
      item.kind in ('allergy', 'strict_exclusion')
    );
  end loop;

  update public.profiles
  set
    onboarding_status = 'food_safety_completed',
    food_safety_confirmed_at = timezone('utc', now())
  where id = current_user_id;

  insert into public.onboarding_steps (user_id, step, completed_at)
  values (current_user_id, 'food_safety', timezone('utc', now()))
  on conflict (user_id, step)
  do update set
    completed_at = excluded.completed_at,
    skipped_at = null,
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.complete_goals_onboarding(
  p_nutrition_goal public.nutrition_goal,
  p_meals_per_week smallint,
  p_servings_per_meal smallint
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_meals_per_week not between 1 and 14
     or p_servings_per_meal not between 1 and 8 then
    raise exception 'invalid goals' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and food_safety_confirmed_at is not null
  ) then
    raise exception 'food safety step required' using errcode = '23514';
  end if;

  update public.profiles
  set
    nutrition_goal = p_nutrition_goal,
    meals_per_week = p_meals_per_week,
    servings_per_meal = p_servings_per_meal,
    onboarding_status = 'goals_completed'
  where id = auth.uid();

  insert into public.onboarding_steps (user_id, step, completed_at)
  values (auth.uid(), 'goals', timezone('utc', now()))
  on conflict (user_id, step)
  do update set completed_at = excluded.completed_at, updated_at = timezone('utc', now());
end;
$$;

create or replace function public.complete_tastes_and_request_plan(
  p_liked_dish_ids uuid[],
  p_skipped boolean,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  job_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if cardinality(p_liked_dish_ids) > 12
     or (p_skipped and cardinality(p_liked_dish_ids) > 0) then
    raise exception 'invalid taste selection' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = current_user_id
      and onboarding_status in ('goals_completed', 'initial_tastes_completed', 'completed')
      and food_safety_confirmed_at is not null
  ) then
    raise exception 'goals step required' using errcode = '23514';
  end if;

  delete from public.onboarding_dish_preferences where user_id = current_user_id;
  if not p_skipped then
    insert into public.onboarding_dish_preferences (user_id, dish_id, signal)
    select current_user_id, d.id, 'liked'
    from public.onboarding_dishes d
    where d.id = any(p_liked_dish_ids) and d.is_active;
    if (select count(*) from public.onboarding_dish_preferences where user_id = current_user_id)
       <> cardinality(p_liked_dish_ids) then
      raise exception 'unknown onboarding dish' using errcode = '22023';
    end if;
  end if;

  insert into public.onboarding_steps (user_id, step, completed_at, skipped_at)
  values (
    current_user_id,
    'initial_tastes',
    case when p_skipped then null else timezone('utc', now()) end,
    case when p_skipped then timezone('utc', now()) else null end
  )
  on conflict (user_id, step)
  do update set
    completed_at = excluded.completed_at,
    skipped_at = excluded.skipped_at,
    updated_at = timezone('utc', now());

  insert into public.ai_generation_jobs (
    user_id, kind, status, idempotency_key, provider, model,
    prompt_version, attempt_count, started_at, completed_at
  )
  values (
    current_user_id, 'meal_plan', 'succeeded', p_idempotency_key,
    'fake', 'deterministic-local-v1', 'onboarding-fake-v1', 1,
    timezone('utc', now()), timezone('utc', now())
  )
  on conflict (user_id, idempotency_key)
  do update set status = public.ai_generation_jobs.status
  returning id into job_id;

  update public.profiles
  set
    onboarding_status = 'completed',
    onboarding_completed_at = coalesce(onboarding_completed_at, timezone('utc', now()))
  where id = current_user_id;

  insert into public.onboarding_steps (user_id, step, completed_at)
  values (current_user_id, 'first_generation', timezone('utc', now()))
  on conflict (user_id, step) do nothing;

  return job_id;
end;
$$;

create or replace function public.save_progressive_profile(
  p_dietary_pattern public.dietary_pattern,
  p_cooking_skill public.cooking_skill,
  p_max_preparation_minutes smallint,
  p_budget_level public.budget_level,
  p_cuisine_codes text[],
  p_ingredient_preferences jsonb,
  p_equipment_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  preference record;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_max_preparation_minutes is not null
     and p_max_preparation_minutes not between 5 and 480 then
    raise exception 'invalid preparation duration' using errcode = '22023';
  end if;
  if cardinality(p_cuisine_codes) > 12
     or cardinality(p_equipment_ids) > 30
     or jsonb_typeof(p_ingredient_preferences) <> 'array'
     or jsonb_array_length(p_ingredient_preferences) > 50 then
    raise exception 'profile selection too large' using errcode = '22023';
  end if;

  insert into public.culinary_preferences (
    user_id, dietary_pattern, cooking_skill
  )
  values (current_user_id, p_dietary_pattern, p_cooking_skill)
  on conflict (user_id) do update
  set
    dietary_pattern = excluded.dietary_pattern,
    cooking_skill = excluded.cooking_skill,
    updated_at = timezone('utc', now());

  if p_max_preparation_minutes is null then
    delete from public.duration_preferences where user_id = current_user_id;
  else
    insert into public.duration_preferences (
      user_id, max_preparation_minutes, learned_from
    )
    values (current_user_id, p_max_preparation_minutes, 'explicit')
    on conflict (user_id) do update
    set
      max_preparation_minutes = excluded.max_preparation_minutes,
      learned_from = 'explicit',
      updated_at = timezone('utc', now());
  end if;

  if p_budget_level is null then
    delete from public.budget_preferences where user_id = current_user_id;
  else
    insert into public.budget_preferences (user_id, level, learned_from)
    values (current_user_id, p_budget_level, 'explicit')
    on conflict (user_id) do update
    set level = excluded.level, learned_from = 'explicit', updated_at = timezone('utc', now());
  end if;

  delete from public.cuisine_preferences where user_id = current_user_id;
  insert into public.cuisine_preferences (
    user_id, cuisine_code, signal, learned_from
  )
  select current_user_id, code, 'liked', 'explicit'
  from unnest(p_cuisine_codes) code
  where code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$';
  if (select count(*) from public.cuisine_preferences where user_id = current_user_id)
     <> cardinality(p_cuisine_codes) then
    raise exception 'invalid cuisine selection' using errcode = '22023';
  end if;

  delete from public.user_equipment where user_id = current_user_id;
  insert into public.user_equipment (
    user_id, equipment_id, available, learned_from
  )
  select current_user_id, e.id, true, 'explicit'
  from public.equipment e
  where e.id = any(p_equipment_ids);
  if (select count(*) from public.user_equipment where user_id = current_user_id)
     <> cardinality(p_equipment_ids) then
    raise exception 'invalid equipment selection' using errcode = '22023';
  end if;

  delete from public.user_ingredient_preferences where user_id = current_user_id;
  for preference in
    select *
    from jsonb_to_recordset(p_ingredient_preferences)
      as x(ingredient_id uuid, signal text)
  loop
    if preference.signal not in ('liked', 'disliked')
       or not exists (
         select 1 from public.ingredients
         where id = preference.ingredient_id and is_active
       ) then
      raise exception 'invalid ingredient preference' using errcode = '22023';
    end if;
    insert into public.user_ingredient_preferences (
      user_id, ingredient_id, signal, learned_from
    )
    values (
      current_user_id,
      preference.ingredient_id,
      preference.signal::public.preference_signal,
      'explicit'
    );
  end loop;
end;
$$;

create or replace function public.correct_ingredient(
  p_ingredient_id uuid,
  p_field_name text,
  p_corrected_value text,
  p_rationale text,
  p_source_url text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_value text;
begin
  if not app_private.is_admin() then
    raise exception 'administrator required' using errcode = '42501';
  end if;
  if p_field_name not in (
    'name_fr', 'family_id', 'contains_alcohol', 'is_active', 'source_reference'
  ) or char_length(trim(p_rationale)) not between 10 and 1000
     or p_source_url !~ '^https://.+' then
    raise exception 'invalid correction' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.ingredients where id = p_ingredient_id
  ) then
    raise exception 'unknown ingredient' using errcode = '22023';
  end if;

  execute format('select %I::text from public.ingredients where id = $1', p_field_name)
  into previous_value using p_ingredient_id;

  if p_field_name = 'family_id' then
    update public.ingredients set family_id = p_corrected_value::uuid where id = p_ingredient_id;
  elsif p_field_name = 'contains_alcohol' then
    update public.ingredients set contains_alcohol = p_corrected_value::boolean where id = p_ingredient_id;
  elsif p_field_name = 'is_active' then
    update public.ingredients set is_active = p_corrected_value::boolean where id = p_ingredient_id;
  elsif p_field_name = 'name_fr' then
    update public.ingredients set name_fr = trim(p_corrected_value) where id = p_ingredient_id;
  else
    update public.ingredients set source_reference = trim(p_corrected_value) where id = p_ingredient_id;
  end if;

  insert into public.ingredient_corrections (
    ingredient_id, requested_by, field_name, previous_value,
    corrected_value, rationale, source_url
  )
  values (
    p_ingredient_id, auth.uid(), p_field_name, previous_value,
    p_corrected_value, p_rationale, p_source_url
  );
end;
$$;

revoke all on function public.complete_food_safety_onboarding(jsonb, boolean) from public;
revoke all on function public.complete_goals_onboarding(
  public.nutrition_goal, smallint, smallint
) from public;
revoke all on function public.complete_tastes_and_request_plan(uuid[], boolean, uuid)
from public;
revoke all on function public.save_progressive_profile(
  public.dietary_pattern, public.cooking_skill, smallint, public.budget_level,
  text[], jsonb, uuid[]
) from public;
revoke all on function public.correct_ingredient(uuid, text, text, text, text)
from public;

grant execute on function public.complete_food_safety_onboarding(jsonb, boolean) to authenticated;
grant execute on function public.complete_goals_onboarding(
  public.nutrition_goal, smallint, smallint
) to authenticated;
grant execute on function public.complete_tastes_and_request_plan(uuid[], boolean, uuid)
to authenticated;
grant execute on function public.save_progressive_profile(
  public.dietary_pattern, public.cooking_skill, smallint, public.budget_level,
  text[], jsonb, uuid[]
) to authenticated;
grant execute on function public.correct_ingredient(uuid, text, text, text, text)
to authenticated;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  first_name_value text := trim(new.raw_user_meta_data ->> 'first_name');
  last_name_value text := trim(new.raw_user_meta_data ->> 'last_name');
  birth_date_value date;
  subject_hash_value text;
begin
  if first_name_value is null or first_name_value = ''
     or last_name_value is null or last_name_value = ''
     or new.raw_user_meta_data ->> 'birth_date' is null then
    return new;
  end if;
  begin
    birth_date_value := (new.raw_user_meta_data ->> 'birth_date')::date;
  exception when others then
    raise exception 'invalid signup metadata' using errcode = '22023';
  end;

  insert into public.profiles (id, first_name, last_name, birth_date)
  values (new.id, first_name_value, last_name_value, birth_date_value);
  insert into public.user_roles (user_id, role)
  values (new.id, 'user') on conflict do nothing;
  insert into public.onboarding_steps (user_id, step, completed_at)
  values (new.id, 'account', timezone('utc', now()));

  if coalesce((new.raw_user_meta_data ->> 'legal_acceptance')::boolean, false) then
    subject_hash_value := encode(extensions.digest(new.id::text, 'sha256'), 'hex');
    insert into public.user_legal_consents (
      user_id, subject_hash, document_version_id, source
    )
    select new.id, subject_hash_value, d.id, 'signup'
    from public.legal_document_versions d
    where d.is_current and d.requires_acceptance;
  end if;
  return new;
end;
$$;

create or replace function public.export_my_account()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'exportedAt', timezone('utc', now()),
    'profile', (select to_jsonb(p) - array['id'] from public.profiles p where p.id = auth.uid()),
    'foodConstraints', coalesce((
      select jsonb_agg(to_jsonb(c) - array['id', 'user_id'])
      from public.user_food_constraints c where c.user_id = auth.uid()
    ), '[]'::jsonb),
    'ingredientPreferences', coalesce((
      select jsonb_agg(to_jsonb(p) - array['user_id'])
      from public.user_ingredient_preferences p where p.user_id = auth.uid()
    ), '[]'::jsonb),
    'onboardingSteps', coalesce((
      select jsonb_agg(to_jsonb(s) - array['user_id'])
      from public.onboarding_steps s where s.user_id = auth.uid()
    ), '[]'::jsonb),
    'legalConsents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'document', d.kind,
        'version', d.version,
        'acceptedAt', c.accepted_at,
        'withdrawnAt', c.withdrawn_at
      ))
      from public.user_legal_consents c
      join public.legal_document_versions d on d.id = c.document_version_id
      where c.user_id = auth.uid()
    ), '[]'::jsonb),
    'mealPlans', coalesce((
      select jsonb_agg(to_jsonb(m) - array['user_id'])
      from public.meal_plans m where m.user_id = auth.uid()
    ), '[]'::jsonb),
    'reactions', coalesce((
      select jsonb_agg(to_jsonb(r) - array['id', 'user_id'])
      from public.recipe_reactions r where r.user_id = auth.uid()
    ), '[]'::jsonb),
    'favorites', coalesce((
      select jsonb_agg(to_jsonb(f) - array['user_id'])
      from public.favorite_recipes f where f.user_id = auth.uid()
    ), '[]'::jsonb),
    'shoppingLists', coalesce((
      select jsonb_agg(to_jsonb(s) - array['user_id'])
      from public.shopping_lists s where s.user_id = auth.uid()
    ), '[]'::jsonb)
  );
$$;

alter table public.legal_document_versions enable row level security;
alter table public.user_legal_consents enable row level security;
alter table public.onboarding_steps enable row level security;
alter table public.onboarding_events enable row level security;
alter table public.onboarding_dishes enable row level security;
alter table public.onboarding_dish_preferences enable row level security;
alter table public.user_ingredient_preferences enable row level security;
alter table public.contextual_question_state enable row level security;
alter table public.taxonomy_versions enable row level security;
alter table public.ingredient_units enable row level security;
alter table public.ingredient_corrections enable row level security;

create policy "legal documents are public"
on public.legal_document_versions for select to anon, authenticated using (true);
create policy "users read own legal consents"
on public.user_legal_consents for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users manage own onboarding steps"
on public.onboarding_steps for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users create own onboarding events"
on public.onboarding_events for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "users read own onboarding events"
on public.onboarding_events for select to authenticated
using ((select auth.uid()) = user_id);
create policy "onboarding dishes are readable"
on public.onboarding_dishes for select to authenticated using (is_active);
create policy "users manage own dish preferences"
on public.onboarding_dish_preferences for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own ingredient preferences"
on public.user_ingredient_preferences for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own contextual state"
on public.contextual_question_state for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "taxonomy versions are readable"
on public.taxonomy_versions for select to anon, authenticated using (true);
create policy "ingredient units are readable"
on public.ingredient_units for select to anon, authenticated using (true);
create policy "admins manage ingredient corrections"
on public.ingredient_corrections for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

revoke all on public.legal_document_versions, public.user_legal_consents,
  public.onboarding_steps, public.onboarding_events, public.onboarding_dishes,
  public.onboarding_dish_preferences, public.user_ingredient_preferences,
  public.contextual_question_state, public.taxonomy_versions,
  public.ingredient_units, public.ingredient_corrections
from anon, authenticated;
grant select on public.legal_document_versions, public.taxonomy_versions to anon, authenticated;
grant select on public.onboarding_dishes, public.ingredient_units to authenticated;
grant select, insert, update, delete on public.user_legal_consents,
  public.onboarding_steps, public.onboarding_events,
  public.onboarding_dish_preferences, public.user_ingredient_preferences,
  public.contextual_question_state, public.ingredient_corrections
to authenticated;
grant usage, select on sequence public.onboarding_events_id_seq to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

insert into public.legal_document_versions (
  id, kind, version, title, content_hash, is_current, requires_acceptance, published_at
)
values
  ('82000000-0000-4000-8000-000000000001', 'privacy_policy', '2026-07-23-draft.1', 'Politique de confidentialité', 'c52f6301eff6cfbb193742b6d34e27091494c9c4e0b60b253bdb33a4992ea863', true, true, '2026-07-23'),
  ('82000000-0000-4000-8000-000000000002', 'terms', '2026-07-23-draft.1', 'Conditions générales d’utilisation', '67e3f953015628ec674fc55d88785ce177f6c8fc034eda036d8771dc84547d88', true, true, '2026-07-23'),
  ('82000000-0000-4000-8000-000000000003', 'legal_notice', '2026-07-23-draft.1', 'Mentions légales', '26f89ac0567f089f04a0bf47afe2c3d5339bc7fba8827335425634bd4a397efb', true, false, '2026-07-23'),
  ('82000000-0000-4000-8000-000000000004', 'cookie_policy', '2026-07-23-draft.1', 'Politique relative aux traceurs', '34d5eb0539216ed363d1d6209c2cacaebaa016bb29d229beea6e5a8de5d3b13e', true, false, '2026-07-23'),
  ('82000000-0000-4000-8000-000000000005', 'nutrition_disclaimer', '2026-07-23-draft.1', 'Avertissement nutritionnel', '3487480fb78b43e5d10fcd8a34be2d363e6fb4fda6e8373521cfa6338a3c523d', true, false, '2026-07-23'),
  ('82000000-0000-4000-8000-000000000006', 'food_safety_notice', '2026-07-23-draft.1', 'Information de sécurité alimentaire', '3487480fb78b43e5d10fcd8a34be2d363e6fb4fda6e8373521cfa6338a3c523d', true, false, '2026-07-23');

insert into public.onboarding_dishes (
  id, slug, title_fr, description_fr, cuisine_code, display_order
)
values
  ('83000000-0000-4000-8000-000000000001', 'curry-legumes', 'Curry de légumes', 'Légumes, lait de coco et épices douces.', 'indian', 1),
  ('83000000-0000-4000-8000-000000000002', 'poulet-roti', 'Poulet rôti', 'Poulet, pommes de terre et herbes.', 'french', 2),
  ('83000000-0000-4000-8000-000000000003', 'pates-tomate', 'Pâtes à la tomate', 'Sauce tomate, basilic et parmesan.', 'italian', 3),
  ('83000000-0000-4000-8000-000000000004', 'tacos-haricots', 'Tacos aux haricots', 'Haricots, maïs et crudités.', 'mexican', 4),
  ('83000000-0000-4000-8000-000000000005', 'saumon-riz', 'Saumon et riz', 'Saumon, riz et légumes verts.', 'nordic', 5),
  ('83000000-0000-4000-8000-000000000006', 'couscous-legumes', 'Couscous de légumes', 'Semoule, pois chiches et légumes.', 'maghrebi', 6),
  ('83000000-0000-4000-8000-000000000007', 'wok-tofu', 'Wok de tofu', 'Tofu, nouilles et légumes croquants.', 'east_asian', 7),
  ('83000000-0000-4000-8000-000000000008', 'quiche-salade', 'Quiche et salade', 'Quiche aux légumes et salade verte.', 'french', 8);

insert into public.data_retention_policies (data_category, retention_days, rationale)
values
  ('onboarding_events', 90, 'Mesure agrégée de la friction sans contenu alimentaire.'),
  ('legal_consents', 2190, 'Preuve pseudonymisée des versions acceptées.')
on conflict (data_category) do update
set retention_days = excluded.retention_days, rationale = excluded.rationale;

comment on table public.user_ingredient_preferences is
  'Goûts corrigibles, toujours séparés des contraintes de sécurité alimentaire.';
comment on table public.user_legal_consents is
  'Preuve versionnée et pseudonymisée, à valider juridiquement avant production.';
