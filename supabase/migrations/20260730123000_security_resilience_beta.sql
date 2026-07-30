-- P55-P58: limites de débit durables, reprise des tâches, contenu et feedback bêta.

create table app_private.api_rate_limits (
  subject_id uuid not null,
  bucket_key text not null check (bucket_key ~ '^[a-z0-9:_-]{3,100}$'),
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (subject_id, bucket_key, window_start)
);

create or replace function public.consume_api_rate_limit(
  p_subject_id uuid,
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_limit not between 1 and 1000
    or p_window_seconds not between 1 and 86400
    or p_bucket_key !~ '^[a-z0-9:_-]{3,100}$' then
    raise exception 'invalid rate limit' using errcode = '22023';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from timezone('utc', now())) / p_window_seconds)
    * p_window_seconds
  );
  insert into app_private.api_rate_limits (
    subject_id, bucket_key, window_start, request_count
  ) values (
    p_subject_id, p_bucket_key, current_window, 1
  )
  on conflict (subject_id, bucket_key, window_start) do update
  set request_count = app_private.api_rate_limits.request_count + 1
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(
  uuid, text, integer, integer
) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(
  uuid, text, integer, integer
) to service_role;

create or replace function public.admin_recover_stale_ai_jobs(
  p_confirmation text,
  p_idempotency_key uuid,
  p_stale_minutes integer default 15
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  recovered integer := 0;
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'RECUPERER LES TACHES'
    or p_stale_minutes not between 5 and 180 then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return 0; end if;

  update public.ai_generation_jobs
  set status = 'failed',
      progress_stage = 'failed',
      user_error_code = 'stale_job_recovered',
      user_error_message = 'La génération a expiré et peut être relancée.',
      completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where status = 'running'
    and updated_at < timezone('utc', now())
      - make_interval(mins => p_stale_minutes);
  get diagnostics recovered = row_count;

  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, metadata, idempotency_key
  ) values (
    actor, 'ai.recover_stale', 'ai_generation_job', 'stale',
    jsonb_build_object(
      'recovered_count', recovered, 'stale_minutes', p_stale_minutes
    ),
    p_idempotency_key
  );
  return recovered;
end;
$$;

revoke all on function public.admin_recover_stale_ai_jobs(
  text, uuid, integer
) from public, anon;
grant execute on function public.admin_recover_stale_ai_jobs(
  text, uuid, integer
) to authenticated;

create type public.beta_feedback_kind as enum (
  'bug', 'suggestion', 'recipe_quality', 'food_safety'
);
create type public.beta_feedback_status as enum (
  'open', 'triaged', 'resolved', 'dismissed'
);

create table public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.beta_feedback_kind not null,
  message text not null check (char_length(trim(message)) between 10 and 2000),
  page_path text check (
    page_path is null
    or (
      char_length(page_path) between 1 and 300
      and page_path ~ '^/[a-zA-Z0-9/?=&._-]+$'
    )
  ),
  status public.beta_feedback_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.beta_feedback enable row level security;
create policy "users create and read own beta feedback"
on public.beta_feedback for select to authenticated
using (user_id = auth.uid());
create policy "users create own beta feedback"
on public.beta_feedback for insert to authenticated
with check (user_id = auth.uid() and status = 'open');
create policy "admins manage beta feedback"
on public.beta_feedback for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());
grant select, insert, update on public.beta_feedback to authenticated;

alter table public.onboarding_dishes
add column image_path text check (
  image_path is null or image_path ~ '^/images/onboarding/[a-z0-9-]+\.svg$'
);

update public.onboarding_dishes
set image_path = '/images/onboarding/generic-dish.svg';

insert into public.recipe_categories (id, slug, name_fr)
values
  ('60000000-0000-4000-8000-000000000003', 'petit-dejeuner', 'Petit-déjeuner'),
  ('60000000-0000-4000-8000-000000000004', 'collation', 'Collation'),
  ('60000000-0000-4000-8000-000000000005', 'vegetarien', 'Végétarien'),
  ('60000000-0000-4000-8000-000000000006', 'rapide', 'Rapide'),
  ('60000000-0000-4000-8000-000000000007', 'familial', 'Familial')
on conflict (id) do update set slug = excluded.slug, name_fr = excluded.name_fr;

create index recipe_versions_public_catalog_idx
on public.recipe_versions (published_at desc, recipe_id)
where validation_status = 'validated' and publication_status = 'published';
create index planned_meals_plan_date_idx
on public.planned_meals (meal_plan_id, meal_date, meal_type);
create index beta_feedback_priority_idx
on public.beta_feedback (kind, status, created_at)
where status in ('open', 'triaged');
create index api_rate_limits_expiry_idx
on app_private.api_rate_limits (window_start);

comment on table app_private.api_rate_limits is
  'Durable fixed-window limiter. Expired buckets may be purged after 48 hours.';
comment on table public.beta_feedback is
  'Minimal private-beta feedback; no browser or device fingerprint is stored.';
