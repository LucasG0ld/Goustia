-- P15-P17 et fondations P19 : planning, opérations, administration et isolation.

create type public.app_role as enum ('user', 'admin');
create type public.meal_plan_status as enum (
  'draft',
  'generating',
  'ready',
  'archived'
);
create type public.meal_type as enum ('lunch', 'dinner');
create type public.recipe_reaction_kind as enum ('like', 'dislike');
create type public.dislike_reason as enum (
  'ingredient',
  'too_long',
  'too_complex',
  'too_expensive',
  'recently_eaten',
  'dish_type',
  'other'
);
create type public.swap_status as enum (
  'requested',
  'completed',
  'failed',
  'cancelled'
);
create type public.shopping_list_status as enum (
  'draft',
  'active',
  'completed',
  'archived'
);
create type public.ai_job_kind as enum (
  'meal_plan',
  'recipe',
  'recipe_swap',
  'recipe_image'
);
create type public.ai_job_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled'
);
create type public.report_kind as enum (
  'food_safety',
  'recipe_error',
  'image',
  'other'
);
create type public.report_status as enum (
  'open',
  'investigating',
  'resolved',
  'dismissed'
);
create type public.account_deletion_status as enum (
  'requested',
  'processing',
  'completed',
  'failed'
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role)
);

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

revoke all on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to authenticated;

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  status public.meal_plan_status not null default 'draft',
  idempotency_key uuid not null,
  generation_job_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id),
  unique (user_id, week_start),
  unique (user_id, idempotency_key)
);

create table public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null,
  user_id uuid not null,
  recipe_version_id uuid references public.recipe_versions (id) on delete restrict,
  meal_date date not null,
  meal_type public.meal_type not null,
  servings smallint not null check (servings between 1 and 8),
  is_locked boolean not null default false,
  cooked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (meal_plan_id, user_id)
    references public.meal_plans (id, user_id) on delete cascade,
  unique (id, user_id),
  unique (meal_plan_id, meal_date, meal_type)
);

create table public.recipe_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  reaction public.recipe_reaction_kind not null,
  reason public.dislike_reason,
  idempotency_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, recipe_id),
  unique (user_id, idempotency_key),
  check (
    (reaction = 'dislike')
    or reason is null
  )
);

create table public.recipe_reaction_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  reaction public.recipe_reaction_kind not null,
  reason public.dislike_reason,
  source text not null default 'explicit' check (
    source in ('explicit', 'onboarding', 'swap')
  ),
  idempotency_key uuid not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  unique (user_id, idempotency_key)
);

create table public.recipe_swaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  planned_meal_id uuid not null,
  from_recipe_version_id uuid not null references public.recipe_versions (id) on delete restrict,
  to_recipe_version_id uuid references public.recipe_versions (id) on delete restrict,
  status public.swap_status not null default 'requested',
  reason public.dislike_reason,
  request_summary text check (
    request_summary is null
    or char_length(trim(request_summary)) between 1 and 500
  ),
  idempotency_key uuid not null,
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  foreign key (planned_meal_id, user_id)
    references public.planned_meals (id, user_id) on delete cascade,
  unique (user_id, idempotency_key),
  check (
    status <> 'completed'
    or (to_recipe_version_id is not null and completed_at is not null)
  )
);

create table public.cooked_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  planned_meal_id uuid,
  recipe_version_id uuid not null references public.recipe_versions (id) on delete restrict,
  servings smallint not null check (servings between 1 and 8),
  cooked_at timestamptz not null default timezone('utc', now()),
  idempotency_key uuid not null,
  foreign key (planned_meal_id)
    references public.planned_meals (id) on delete set null,
  unique (user_id, idempotency_key),
  unique nulls not distinct (user_id, planned_meal_id)
);

create table public.favorite_recipes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, recipe_id)
);

create or replace function app_private.validate_planned_meal_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  plan_week_start date;
begin
  select week_start
  into plan_week_start
  from public.meal_plans
  where id = new.meal_plan_id
    and user_id = new.user_id;

  if plan_week_start is not null
     and (new.meal_date < plan_week_start or new.meal_date > plan_week_start + 6) then
    raise exception 'meal date must belong to the plan week' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function app_private.validate_planned_meal_date() from public;

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_plan_id uuid references public.meal_plans (id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  status public.shopping_list_status not null default 'draft',
  idempotency_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id),
  unique (user_id, idempotency_key)
);

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null,
  user_id uuid not null,
  ingredient_id uuid references public.ingredients (id) on delete restrict,
  manual_label text check (
    manual_label is null
    or char_length(trim(manual_label)) between 1 and 160
  ),
  quantity numeric(10, 3) check (quantity > 0),
  unit text check (
    unit is null
    or unit in (
      'g', 'kg', 'ml', 'l', 'piece', 'teaspoon', 'tablespoon',
      'pinch', 'bunch', 'slice', 'clove', 'to_taste'
    )
  ),
  aisle text check (aisle is null or char_length(trim(aisle)) between 1 and 100),
  checked_at timestamptz,
  source_recipe_version_id uuid references public.recipe_versions (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (shopping_list_id, user_id)
    references public.shopping_lists (id, user_id) on delete cascade,
  check (num_nonnulls(ingredient_id, manual_label) = 1)
);

create table public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  kind public.ai_job_kind not null,
  status public.ai_job_status not null default 'queued',
  idempotency_key uuid not null,
  provider text,
  model text,
  prompt_version text not null,
  attempt_count smallint not null default 0 check (attempt_count between 0 and 10),
  user_error_code text,
  user_error_message text check (
    user_error_message is null
    or char_length(trim(user_error_message)) between 1 and 300
  ),
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '30 days'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (user_id, idempotency_key),
  check (
    status not in ('succeeded', 'failed', 'cancelled')
    or completed_at is not null
  ),
  check (expires_at > created_at)
);

alter table public.meal_plans
add constraint meal_plans_generation_job_id_fkey
foreign key (generation_job_id)
references public.ai_generation_jobs (id)
on delete set null;

create table app_private.ai_generation_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.ai_generation_jobs (id) on delete cascade,
  attempt_number smallint not null check (attempt_number between 1 and 10),
  provider text not null,
  model text not null,
  duration_ms integer check (duration_ms >= 0),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  image_count smallint check (image_count >= 0),
  estimated_cost_usd numeric(12, 6) check (estimated_cost_usd >= 0),
  technical_error_code text,
  technical_error_detail text,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '14 days'),
  unique (job_id, attempt_number)
);

create table public.usage_quotas (
  user_id uuid not null references public.profiles (id) on delete cascade,
  quota_key text not null check (quota_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  window_start timestamptz not null,
  window_end timestamptz not null,
  used_count integer not null default 0 check (used_count >= 0),
  limit_count integer not null check (limit_count > 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, quota_key, window_start),
  check (window_end > window_start),
  check (used_count <= limit_count)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  recipe_id uuid references public.recipes (id) on delete set null,
  kind public.report_kind not null,
  status public.report_status not null default 'open',
  user_message text not null check (
    char_length(trim(user_message)) between 10 and 1000
  ),
  assigned_admin_id uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    status not in ('resolved', 'dismissed')
    or resolved_at is not null
  )
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users (id) on delete set null,
  action text not null check (action ~ '^[a-z0-9]+(?:\\.[a-z0-9_]+)+$'),
  target_type text not null,
  target_id text,
  correlation_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '365 days')
);

create table public.data_retention_policies (
  data_category text primary key,
  retention_days integer not null check (retention_days between 1 and 3650),
  rationale text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  idempotency_key uuid not null,
  status public.account_deletion_status not null default 'requested',
  requested_at timestamptz not null default timezone('utc', now()),
  scheduled_for timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  failure_code text,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '2190 days'),
  unique (subject_hash, idempotency_key),
  check (
    status <> 'completed'
    or completed_at is not null
  )
);

create table app_private.auth_rate_limits (
  action text not null,
  identifier_hash text not null check (identifier_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  attempt_count integer not null default 1 check (attempt_count > 0),
  expires_at timestamptz not null,
  primary key (action, identifier_hash, window_started_at)
);

create or replace function public.consume_auth_rate_limit(
  p_action text,
  p_identifier_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  current_count integer;
  action_limit integer;
  window_seconds integer;
begin
  select limits.max_attempts, limits.window_seconds
  into action_limit, window_seconds
  from (
    values
      ('signup'::text, 5, 900),
      ('signin'::text, 10, 900),
      ('password_reset'::text, 3, 3600)
  ) as limits(action, max_attempts, window_seconds)
  where limits.action = p_action;

  if action_limit is null or p_identifier_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid rate limit request' using errcode = '22023';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / window_seconds)
      * window_seconds
  );

  insert into app_private.auth_rate_limits (
    action,
    identifier_hash,
    window_started_at,
    expires_at
  )
  values (
    p_action,
    p_identifier_hash,
    current_window,
    current_window + make_interval(secs => window_seconds * 2)
  )
  on conflict (action, identifier_hash, window_started_at)
  do update set attempt_count = app_private.auth_rate_limits.attempt_count + 1
  returning attempt_count into current_count;

  return current_count <= action_limit;
end;
$$;

revoke all on function public.consume_auth_rate_limit(text, text)
from public;
grant execute on function public.consume_auth_rate_limit(text, text)
to anon, authenticated;

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
begin
  -- Les comptes techniques et les fixtures sans métadonnées restent gérés
  -- explicitement. Le parcours applicatif fournit toujours ces trois valeurs.
  if first_name_value is null
     or first_name_value = ''
     or last_name_value is null
     or last_name_value = ''
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
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

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

grant execute on function public.export_my_account() to authenticated;

create or replace function public.request_account_deletion(
  p_confirmation text,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_id uuid;
  hashed_subject text;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_confirmation <> 'SUPPRIMER' then
    raise exception 'invalid confirmation' using errcode = '22023';
  end if;

  hashed_subject := encode(extensions.digest(current_user_id::text, 'sha256'), 'hex');

  insert into public.account_deletion_requests (
    user_id,
    subject_hash,
    idempotency_key,
    status
  )
  values (
    current_user_id,
    hashed_subject,
    p_idempotency_key,
    'processing'
  )
  on conflict (subject_hash, idempotency_key)
  do update set status = public.account_deletion_requests.status
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.request_account_deletion(text, uuid) from public;
grant execute on function public.request_account_deletion(text, uuid)
to authenticated;

-- Index et unicité métier.

create index meal_plans_user_status_idx on public.meal_plans (user_id, status);
create index planned_meals_user_date_idx on public.planned_meals (user_id, meal_date);
create index planned_meals_recipe_idx on public.planned_meals (recipe_version_id);
create index reaction_events_user_date_idx
  on public.recipe_reaction_events (user_id, occurred_at desc);
create index recipe_swaps_user_date_idx
  on public.recipe_swaps (user_id, requested_at desc);
create index cooked_recipes_user_date_idx
  on public.cooked_recipes (user_id, cooked_at desc);
create index favorites_recipe_idx on public.favorite_recipes (recipe_id);
create index shopping_lists_user_status_idx
  on public.shopping_lists (user_id, status);
create index shopping_items_list_idx
  on public.shopping_list_items (shopping_list_id);
create unique index shopping_items_ingredient_unique_idx
  on public.shopping_list_items (shopping_list_id, ingredient_id)
  where ingredient_id is not null;
create unique index shopping_items_manual_unique_idx
  on public.shopping_list_items (
    shopping_list_id,
    public.normalize_search_term(manual_label)
  )
  where manual_label is not null;
create index ai_jobs_user_status_idx
  on public.ai_generation_jobs (user_id, status, created_at desc);
create index ai_jobs_expiry_idx on public.ai_generation_jobs (expires_at);
create index ai_attempts_expiry_idx
  on app_private.ai_generation_attempts (expires_at);
create index usage_quotas_window_idx
  on public.usage_quotas (user_id, window_end);
create index content_reports_status_idx
  on public.content_reports (status, created_at);
create index admin_audit_admin_date_idx
  on public.admin_audit_log (admin_user_id, occurred_at desc);
create index deletion_requests_user_idx
  on public.account_deletion_requests (user_id);
create index deletion_requests_expiry_idx
  on public.account_deletion_requests (expires_at);
create index auth_rate_limits_expiry_idx
  on app_private.auth_rate_limits (expires_at);

create trigger meal_plans_set_updated_at
before update on public.meal_plans
for each row execute function public.set_updated_at();
create trigger planned_meals_set_updated_at
before update on public.planned_meals
for each row execute function public.set_updated_at();
create trigger planned_meals_validate_date
before insert or update on public.planned_meals
for each row execute function app_private.validate_planned_meal_date();
create trigger recipe_reactions_set_updated_at
before update on public.recipe_reactions
for each row execute function public.set_updated_at();
create trigger shopping_lists_set_updated_at
before update on public.shopping_lists
for each row execute function public.set_updated_at();
create trigger shopping_list_items_set_updated_at
before update on public.shopping_list_items
for each row execute function public.set_updated_at();
create trigger ai_generation_jobs_set_updated_at
before update on public.ai_generation_jobs
for each row execute function public.set_updated_at();
create trigger content_reports_set_updated_at
before update on public.content_reports
for each row execute function public.set_updated_at();

-- RLS propriétaire et administration.

alter table public.user_roles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.planned_meals enable row level security;
alter table public.recipe_reactions enable row level security;
alter table public.recipe_reaction_events enable row level security;
alter table public.recipe_swaps enable row level security;
alter table public.cooked_recipes enable row level security;
alter table public.favorite_recipes enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.ai_generation_jobs enable row level security;
alter table public.usage_quotas enable row level security;
alter table public.content_reports enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.data_retention_policies enable row level security;
alter table public.account_deletion_requests enable row level security;

create policy "users read own roles"
on public.user_roles for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users manage own meal plans"
on public.meal_plans for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own planned meals"
on public.planned_meals for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own reactions"
on public.recipe_reactions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own reaction events"
on public.recipe_reaction_events for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own swaps"
on public.recipe_swaps for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own cooked recipes"
on public.cooked_recipes for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own favorites"
on public.favorite_recipes for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own shopping lists"
on public.shopping_lists for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own shopping items"
on public.shopping_list_items for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users read own AI jobs"
on public.ai_generation_jobs for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users read own quotas"
on public.usage_quotas for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users create reports"
on public.content_reports for insert to authenticated
with check ((select auth.uid()) = reporter_id);
create policy "users read own reports"
on public.content_reports for select to authenticated
using ((select auth.uid()) = reporter_id);
create policy "retention policies are readable"
on public.data_retention_policies for select to authenticated
using (true);
create policy "users read own deletion requests"
on public.account_deletion_requests for select to authenticated
using ((select auth.uid()) = user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'culinary_preferences', 'cuisine_preferences', 'equipment',
    'user_equipment', 'duration_preferences', 'budget_preferences',
    'ingredient_families', 'ingredients', 'ingredient_synonyms',
    'ingredient_relations', 'allergens', 'ingredient_allergens',
    'user_food_constraints', 'recipes', 'recipe_versions',
    'recipe_categories', 'recipe_category_assignments', 'recipe_tags',
    'recipe_tag_assignments', 'recipe_ingredients', 'recipe_steps',
    'recipe_nutrition', 'recipe_images', 'user_roles', 'meal_plans',
    'planned_meals', 'recipe_reactions', 'recipe_reaction_events',
    'recipe_swaps', 'cooked_recipes', 'favorite_recipes', 'shopping_lists',
    'shopping_list_items', 'ai_generation_jobs', 'usage_quotas',
    'content_reports', 'admin_audit_log', 'data_retention_policies',
    'account_deletion_requests'
  ]
  loop
    execute format(
      'create policy "administrators manage rows" on public.%I for all to authenticated using (app_private.is_admin()) with check (app_private.is_admin())',
      table_name
    );
  end loop;
end;
$$;

create or replace view public.admin_ai_attempts
as
select
  a.id,
  a.job_id,
  a.attempt_number,
  a.provider,
  a.model,
  a.duration_ms,
  a.input_tokens,
  a.output_tokens,
  a.image_count,
  a.estimated_cost_usd,
  a.technical_error_code,
  a.created_at
from app_private.ai_generation_attempts a
where app_private.is_admin();

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.admin_ai_attempts to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Storage : recettes gérées par le serveur, ressources utilisateur par dossier.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'recipe-images',
    'recipe-images',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'user-assets',
    'user-assets',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/json']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "users read own assets"
on storage.objects for select to authenticated
using (
  bucket_id = 'user-assets'
  and owner_id = (select auth.uid()::text)
);
create policy "users upload own assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'user-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
create policy "users update own assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'user-assets'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'user-assets'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
create policy "users delete own assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'user-assets'
  and owner_id = (select auth.uid()::text)
);
create policy "administrators manage recipe images"
on storage.objects for all to authenticated
using (bucket_id = 'recipe-images' and app_private.is_admin())
with check (bucket_id = 'recipe-images' and app_private.is_admin());

insert into public.data_retention_policies (
  data_category,
  retention_days,
  rationale
)
values
  ('ai_jobs', 30, 'Diagnostic utilisateur et suivi des générations récentes.'),
  ('ai_attempt_details', 14, 'Détails techniques limités au dépannage.'),
  ('admin_audit', 365, 'Traçabilité des actions administratives sensibles.'),
  ('account_deletion_audit', 2190, 'Preuve pseudonymisée de traitement de la demande.')
on conflict (data_category) do update
set
  retention_days = excluded.retention_days,
  rationale = excluded.rationale,
  updated_at = timezone('utc', now());

comment on table public.recipe_reaction_events is
  'Historique minimal des signaux explicites, sans déduire un rejet depuis une absence d’action.';
comment on table app_private.ai_generation_attempts is
  'Détails techniques non exposés à l’utilisateur et supprimables après 14 jours.';
comment on table public.account_deletion_requests is
  'Preuve pseudonymisée et idempotente des demandes de suppression.';
