-- P50-P51: controlled AI administration, food reference mutations and
-- privacy-preserving product notifications.

-- P40 created these read models with RLS policies but omitted the table
-- privilege required for PostgREST to evaluate them.
grant select on
  public.recipe_equipment_requirements,
  public.recipe_substitutions
to anon, authenticated;
grant select, insert on public.recipe_action_events to authenticated;
grant select, insert, update, delete on public.cooking_sessions
to authenticated;

create type public.ai_runtime_kind as enum ('text', 'image');
create type public.notification_kind as enum (
  'planning_ready',
  'shopping_reminder'
);
create type public.notification_channel as enum ('web', 'email');
create type public.notification_delivery_status as enum (
  'queued',
  'sent',
  'skipped',
  'failed'
);

create table public.ai_runtime_settings (
  provider text check (provider in ('fake', 'groq', 'cloudflare')),
  kind public.ai_runtime_kind not null,
  enabled boolean not null default false,
  active_model text not null check (char_length(trim(active_model)) between 2 and 200),
  allowed_models text[] not null check (cardinality(allowed_models) between 1 and 20),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (provider, kind),
  check (active_model = any(allowed_models))
);

insert into public.ai_runtime_settings (
  provider, kind, enabled, active_model, allowed_models
) values
  ('fake', 'text', true, 'fake-recipe-v1', array['fake-recipe-v1']),
  ('fake', 'image', true, 'fake-image-v1', array['fake-image-v1']),
  (
    'groq', 'text', false, 'openai/gpt-oss-120b',
    array['openai/gpt-oss-120b']
  ),
  (
    'cloudflare', 'text', false, '@cf/qwen/qwen3-30b-a3b-fp8',
    array[
      '@cf/qwen/qwen3-30b-a3b-fp8',
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    ]
  ),
  (
    'cloudflare', 'image', false,
    '@cf/black-forest-labs/flux-2-klein-4b',
    array[
      '@cf/black-forest-labs/flux-2-klein-4b',
      '@cf/black-forest-labs/flux-1-schnell'
    ]
  );

create table public.ai_prompt_registry (
  version text primary key check (version ~ '^[a-z0-9_.-]+$'),
  kind public.ai_runtime_kind not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'active' check (status in ('active', 'deprecated')),
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.ai_prompt_registry (version, kind, content_hash)
values
  ('recipe-prompt.v1', 'text', repeat('0', 64)),
  ('recipe-image-prompt.v1', 'image', repeat('1', 64));

create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  planning_ready_enabled boolean not null default true,
  shopping_reminder_enabled boolean not null default false,
  email_enabled boolean not null default false,
  timezone text not null default 'Europe/Paris'
    check (timezone ~ '^[A-Za-z_]+(?:/[A-Za-z_+-]+)+$'),
  max_per_week smallint not null default 3 check (max_per_week between 1 and 7),
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null,
  channel public.notification_channel not null,
  status public.notification_delivery_status not null default 'queued',
  deduplication_key text not null check (
    deduplication_key ~ '^[a-zA-Z0-9:_-]{3,200}$'
  ),
  title text not null check (char_length(trim(title)) between 3 and 100),
  body text not null check (char_length(trim(body)) between 3 and 240),
  action_url text not null check (
    action_url ~ '^/[a-z0-9/?=&_-]+$'
  ),
  scheduled_for timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  failure_code text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, channel, deduplication_key),
  check (
    status <> 'sent' or sent_at is not null
  )
);

create or replace function public.admin_set_ai_runtime(
  p_provider text,
  p_kind public.ai_runtime_kind,
  p_enabled boolean,
  p_model text,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'CONFIGURER IA' then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  update public.ai_runtime_settings
  set enabled = p_enabled, active_model = trim(p_model),
      updated_by = actor, updated_at = timezone('utc', now())
  where provider = p_provider and kind = p_kind
    and trim(p_model) = any(allowed_models);
  if not found then
    raise exception 'provider or model not allowed' using errcode = '22023';
  end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, metadata, idempotency_key
  ) values (
    actor, 'ai.configure', 'ai_provider', p_provider || ':' || p_kind::text,
    jsonb_build_object(
      'enabled', p_enabled, 'model', trim(p_model), 'kind', p_kind
    ),
    p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_retry_ai_job(
  p_job_id uuid,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'RELANCER' then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  update public.ai_generation_jobs
  set status = 'queued', progress_stage = 'queued', progress_percent = 0,
      user_error_code = null, user_error_message = null,
      started_at = null, completed_at = null, updated_at = timezone('utc', now())
  where id = p_job_id and status = 'failed' and attempt_count < 10;
  if not found then
    raise exception 'failed job not retryable' using errcode = '22023';
  end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  ) values (
    actor, 'ai.retry', 'ai_generation_job', p_job_id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_purge_ai_job(
  p_job_id uuid,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'PURGER' then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  update public.ai_generation_jobs
  set user_id = null, request_payload = '{}'::jsonb,
      user_error_message = null, updated_at = timezone('utc', now())
  where id = p_job_id and status in ('succeeded', 'failed', 'cancelled');
  if not found then
    raise exception 'terminal job required' using errcode = '22023';
  end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  ) values (
    actor, 'ai.purge', 'ai_generation_job', p_job_id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_mutate_food_reference(
  p_action text,
  p_ingredient_id uuid,
  p_related_id uuid,
  p_value text,
  p_relation text,
  p_confidence numeric,
  p_rationale text,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  current_taxonomy uuid;
  current_ciqual text;
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'MODIFIER LE REFERENTIEL' then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  if not exists (
    select 1 from public.ingredients where id = p_ingredient_id
  ) then raise exception 'ingredient not found' using errcode = 'P0002'; end if;

  if p_action = 'add_synonym' then
    select id into current_taxonomy from public.taxonomy_versions
    where is_current;
    insert into public.ingredient_synonyms (
      ingredient_id, name_fr, taxonomy_version_id
    ) values (
      p_ingredient_id, trim(p_value), current_taxonomy
    );
  elsif p_action = 'set_alcohol' then
    update public.ingredients
    set contains_alcohol = (lower(trim(p_value)) = 'true'),
        updated_at = timezone('utc', now())
    where id = p_ingredient_id;
  elsif p_action = 'set_allergen' then
    if p_relation not in ('contains', 'may_contain', 'derived_from') then
      raise exception 'invalid allergen relation' using errcode = '22023';
    end if;
    insert into public.ingredient_allergens (
      ingredient_id, allergen_id, relation
    ) values (
      p_ingredient_id, p_related_id, p_relation
    )
    on conflict (ingredient_id, allergen_id) do update
    set relation = excluded.relation;
  elsif p_action = 'set_ciqual' then
    select id into current_ciqual from public.nutrition_source_versions
    where is_current;
    insert into public.ingredient_ciqual_mappings (
      ingredient_id, source_version_id, food_code, status, confidence,
      rationale_fr, reviewed_at
    ) values (
      p_ingredient_id, current_ciqual, nullif(trim(p_value), ''),
      case when nullif(trim(p_value), '') is null
        then 'unmatched'::public.ciqual_mapping_status
        when p_confidence = 1 then 'exact'::public.ciqual_mapping_status
        else 'approximate'::public.ciqual_mapping_status end,
      case when nullif(trim(p_value), '') is null then 0 else p_confidence end,
      trim(p_rationale), timezone('utc', now())
    )
    on conflict (ingredient_id, source_version_id) do update set
      food_code = excluded.food_code, status = excluded.status,
      confidence = excluded.confidence, rationale_fr = excluded.rationale_fr,
      reviewed_at = excluded.reviewed_at, updated_at = timezone('utc', now());
  else
    raise exception 'unsupported reference action' using errcode = '22023';
  end if;

  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, metadata, idempotency_key
  ) values (
    actor, 'food_reference.' || p_action, 'ingredient', p_ingredient_id::text,
    jsonb_build_object('relation', p_relation, 'has_value', p_value is not null),
    p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.update_notification_preferences(
  p_planning_ready boolean,
  p_shopping_reminder boolean,
  p_email_enabled boolean,
  p_timezone text,
  p_max_per_week smallint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  insert into public.notification_preferences (
    user_id, planning_ready_enabled, shopping_reminder_enabled,
    email_enabled, timezone, max_per_week, unsubscribed_at
  ) values (
    actor, p_planning_ready, p_shopping_reminder, p_email_enabled,
    p_timezone, p_max_per_week,
    case when not p_email_enabled then timezone('utc', now()) end
  )
  on conflict (user_id) do update set
    planning_ready_enabled = excluded.planning_ready_enabled,
    shopping_reminder_enabled = excluded.shopping_reminder_enabled,
    email_enabled = excluded.email_enabled,
    timezone = excluded.timezone, max_per_week = excluded.max_per_week,
    unsubscribed_at = excluded.unsubscribed_at,
    updated_at = timezone('utc', now());
  return true;
end;
$$;

create or replace function public.enqueue_product_notification(
  p_user_id uuid,
  p_kind public.notification_kind,
  p_deduplication_key text,
  p_title text,
  p_body text,
  p_action_url text,
  p_scheduled_for timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  preferences public.notification_preferences%rowtype;
  queued_count integer := 0;
  effective_scheduled_for timestamptz;
begin
  if auth.role() <> 'service_role' and not app_private.is_admin() then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if lower(p_title || ' ' || p_body) ~
    '(allerg|intol[eé]rance|alcool|ingr[eé]dient|calorie|poids)' then
    raise exception 'sensitive notification content' using errcode = '22023';
  end if;
  select * into preferences from public.notification_preferences
  where user_id = p_user_id;
  if not found then
    insert into public.notification_preferences (user_id)
    values (p_user_id) returning * into preferences;
  end if;
  if preferences.unsubscribed_at is not null then return 0; end if;
  if (
    (p_kind = 'planning_ready' and not preferences.planning_ready_enabled)
    or (p_kind = 'shopping_reminder' and not preferences.shopping_reminder_enabled)
  ) then return 0; end if;
  if (
    select count(*) from public.notification_deliveries
    where user_id = p_user_id
      and created_at >= timezone('utc', now()) - interval '7 days'
      and status in ('queued', 'sent')
  ) >= preferences.max_per_week then return 0; end if;
  effective_scheduled_for := case
    when p_kind = 'shopping_reminder' then
      (
        (
          timezone(preferences.timezone, p_scheduled_for)::date
          + interval '1 day'
          + time '17:00'
        ) at time zone preferences.timezone
      )
    else p_scheduled_for
  end;

  insert into public.notification_deliveries (
    user_id, kind, channel, deduplication_key, title, body,
    action_url, scheduled_for
  ) values (
    p_user_id, p_kind, 'web', p_deduplication_key, trim(p_title),
    trim(p_body), p_action_url, effective_scheduled_for
  ) on conflict do nothing;
  get diagnostics queued_count = row_count;
  if preferences.email_enabled then
    insert into public.notification_deliveries (
      user_id, kind, channel, deduplication_key, title, body,
      action_url, scheduled_for
    ) values (
      p_user_id, p_kind, 'email', p_deduplication_key, trim(p_title),
      trim(p_body), p_action_url, effective_scheduled_for
    ) on conflict do nothing;
    queued_count := queued_count + case when found then 1 else 0 end;
  end if;
  return queued_count;
end;
$$;

alter table public.ai_runtime_settings enable row level security;
alter table public.ai_prompt_registry enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "admins read AI runtime"
on public.ai_runtime_settings for select to authenticated
using (app_private.is_admin());
create policy "admins read prompt registry"
on public.ai_prompt_registry for select to authenticated
using (app_private.is_admin());
create policy "users manage notification preferences"
on public.notification_preferences for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read web notifications"
on public.notification_deliveries for select to authenticated
using (user_id = auth.uid() and channel = 'web');
create policy "admins manage notification deliveries"
on public.notification_deliveries for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

grant select on public.ai_runtime_settings, public.ai_prompt_registry
to authenticated;
grant select, insert, update, delete on
  public.notification_preferences, public.notification_deliveries
to authenticated;

revoke all on function public.admin_set_ai_runtime(
  text, public.ai_runtime_kind, boolean, text, text, uuid
) from public;
revoke all on function public.admin_retry_ai_job(uuid, text, uuid) from public;
revoke all on function public.admin_purge_ai_job(uuid, text, uuid) from public;
revoke all on function public.admin_mutate_food_reference(
  text, uuid, uuid, text, text, numeric, text, text, uuid
) from public;
revoke all on function public.update_notification_preferences(
  boolean, boolean, boolean, text, smallint
) from public;
revoke all on function public.enqueue_product_notification(
  uuid, public.notification_kind, text, text, text, text, timestamptz
) from public;

grant execute on function public.admin_set_ai_runtime(
  text, public.ai_runtime_kind, boolean, text, text, uuid
) to authenticated;
grant execute on function public.admin_retry_ai_job(uuid, text, uuid)
to authenticated;
grant execute on function public.admin_purge_ai_job(uuid, text, uuid)
to authenticated;
grant execute on function public.admin_mutate_food_reference(
  text, uuid, uuid, text, text, numeric, text, text, uuid
) to authenticated;
grant execute on function public.update_notification_preferences(
  boolean, boolean, boolean, text, smallint
) to authenticated;
grant execute on function public.enqueue_product_notification(
  uuid, public.notification_kind, text, text, text, text, timestamptz
) to service_role;

create index notification_deliveries_user_created_idx
on public.notification_deliveries (user_id, created_at desc);
create index notification_deliveries_queue_idx
on public.notification_deliveries (status, scheduled_for)
where status = 'queued';
create index ai_jobs_admin_status_created_idx
on public.ai_generation_jobs (status, created_at desc);
