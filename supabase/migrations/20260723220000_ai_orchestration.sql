-- P30-P34: orchestration IA persistée, quotas atomiques, coûts et images.

alter table public.ai_generation_jobs
  add column request_payload jsonb not null default '{}'::jsonb,
  add column progress_percent smallint not null default 0
    check (progress_percent between 0 and 100),
  add column progress_stage text not null default 'queued'
    check (
      progress_stage in (
        'queued', 'profile', 'generation', 'validation', 'nutrition',
        'storage', 'images', 'completed', 'failed'
      )
    ),
  add column result_recipe_ids uuid[] not null default '{}'::uuid[],
  add column degraded_mode text
    check (
      degraded_mode is null
      or degraded_mode in ('cache', 'fallback_provider', 'without_image')
    );

alter table public.recipe_versions
  add column visual_prompt text check (
    visual_prompt is null
    or char_length(trim(visual_prompt)) between 20 and 1200
  ),
  add column visual_alt_text text check (
    visual_alt_text is null
    or char_length(trim(visual_alt_text)) between 3 and 300
  ),
  add column image_illustrative boolean not null default true;

create table public.ai_generation_job_recipes (
  job_id uuid not null
    references public.ai_generation_jobs (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position smallint not null check (position between 1 and 14),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (job_id, recipe_id),
  unique (job_id, position)
);

alter table public.ai_generation_job_recipes enable row level security;

create policy "users read own generated recipe links"
on public.ai_generation_job_recipes for select to authenticated
using (
  exists (
    select 1
    from public.ai_generation_jobs job
    where job.id = job_id and job.user_id = (select auth.uid())
  )
);

create policy "administrators manage generated recipe links"
on public.ai_generation_job_recipes for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

grant select, insert, update, delete
on public.ai_generation_job_recipes to authenticated;
grant all on public.ai_generation_job_recipes to service_role;

create table app_private.global_ai_daily_usage (
  usage_date date not null,
  quota_key text not null check (
    quota_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
  ),
  used_count integer not null default 0 check (used_count >= 0),
  limit_count integer not null check (limit_count > 0),
  estimated_cost_usd numeric(14, 6) not null default 0
    check (estimated_cost_usd >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (usage_date, quota_key),
  check (used_count <= limit_count)
);

create table app_private.ai_quota_reservations (
  idempotency_key uuid primary key,
  job_id uuid not null unique
    references public.ai_generation_jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  quota_key text not null,
  reserved_count integer not null check (reserved_count > 0),
  usage_date date not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table app_private.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique check (
    event_key ~ '^[a-zA-Z0-9._:-]{8,200}$'
  ),
  job_id uuid not null
    references public.ai_generation_jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('text', 'image')),
  provider text not null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  neurons numeric(14, 4) not null default 0 check (neurons >= 0),
  image_count smallint not null default 0 check (image_count >= 0),
  estimated_cost_usd numeric(14, 6) not null default 0
    check (estimated_cost_usd >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.recipe_images
  add column recipe_id uuid references public.recipes (id) on delete cascade,
  add column content_type text check (
    content_type is null
    or content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  add column byte_size integer check (byte_size is null or byte_size > 0),
  add column checksum_sha256 text check (
    checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'
  ),
  add column illustrative boolean not null default true,
  add column generation_key text check (
    generation_key is null or generation_key ~ '^[a-f0-9]{64}$'
  ),
  add column generated_at timestamptz;

update public.recipe_images image
set recipe_id = version.recipe_id
from public.recipe_versions version
where image.recipe_version_id = version.id;

alter table public.recipe_images alter column recipe_id set not null;

create unique index recipe_images_generation_once_idx
  on public.recipe_images (recipe_id, generation_key)
  where generation_key is not null;
create unique index recipe_images_one_primary_ready_idx
  on public.recipe_images (recipe_id)
  where is_primary and status = 'ready';
create index ai_job_recipes_recipe_idx
  on public.ai_generation_job_recipes (recipe_id);
create index ai_usage_events_job_idx
  on app_private.ai_usage_events (job_id, created_at);

create or replace function public.reserve_ai_generation_job(
  p_user_id uuid,
  p_idempotency_key uuid,
  p_prompt_version text,
  p_request_payload jsonb,
  p_recipe_count smallint,
  p_user_daily_limit integer,
  p_global_daily_limit integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_date_utc date := (timezone('utc', now()))::date;
  window_start_utc timestamptz := date_trunc('day', timezone('utc', now())) at time zone 'UTC';
  window_end_utc timestamptz := (date_trunc('day', timezone('utc', now())) + interval '1 day') at time zone 'UTC';
  existing_job_id uuid;
  new_job_id uuid;
  current_user_count integer;
  current_global_count integer;
begin
  if p_recipe_count not between 1 and 14
     or p_user_daily_limit < 1
     or p_global_daily_limit < 1
     or jsonb_typeof(p_request_payload) <> 'object'
     or nullif(trim(p_prompt_version), '') is null then
    raise exception 'invalid AI generation reservation'
      using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'unknown user' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || p_idempotency_key::text, 0)
  );

  select id into existing_job_id
  from public.ai_generation_jobs
  where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if existing_job_id is not null then
    return existing_job_id;
  end if;

  insert into public.usage_quotas (
    user_id, quota_key, window_start, window_end, used_count, limit_count
  )
  values (
    p_user_id, 'recipe_generation', window_start_utc, window_end_utc,
    0, p_user_daily_limit
  )
  on conflict (user_id, quota_key, window_start)
  do update set limit_count = greatest(
    public.usage_quotas.used_count,
    least(public.usage_quotas.limit_count, excluded.limit_count)
  );

  insert into app_private.global_ai_daily_usage (
    usage_date, quota_key, used_count, limit_count
  )
  values (
    current_date_utc, 'recipe_generation', 0, p_global_daily_limit
  )
  on conflict (usage_date, quota_key)
  do update set limit_count = greatest(
    app_private.global_ai_daily_usage.used_count,
    least(
      app_private.global_ai_daily_usage.limit_count,
      excluded.limit_count
    )
  );

  select used_count into current_user_count
  from public.usage_quotas
  where user_id = p_user_id
    and quota_key = 'recipe_generation'
    and window_start = window_start_utc
  for update;

  select used_count into current_global_count
  from app_private.global_ai_daily_usage
  where usage_date = current_date_utc
    and quota_key = 'recipe_generation'
  for update;

  if current_user_count + p_recipe_count > p_user_daily_limit then
    raise exception 'AI_USER_QUOTA_EXCEEDED' using errcode = 'P0001';
  end if;
  if current_global_count + p_recipe_count > p_global_daily_limit then
    raise exception 'AI_GLOBAL_QUOTA_EXCEEDED' using errcode = 'P0001';
  end if;

  insert into public.ai_generation_jobs (
    user_id, kind, status, idempotency_key, prompt_version,
    request_payload, progress_percent, progress_stage
  )
  values (
    p_user_id, 'recipe', 'queued', p_idempotency_key, p_prompt_version,
    p_request_payload, 0, 'queued'
  )
  returning id into new_job_id;

  update public.usage_quotas
  set used_count = used_count + p_recipe_count,
      updated_at = timezone('utc', now())
  where user_id = p_user_id
    and quota_key = 'recipe_generation'
    and window_start = window_start_utc;

  update app_private.global_ai_daily_usage
  set used_count = used_count + p_recipe_count,
      updated_at = timezone('utc', now())
  where usage_date = current_date_utc
    and quota_key = 'recipe_generation';

  insert into app_private.ai_quota_reservations (
    idempotency_key, job_id, user_id, quota_key, reserved_count, usage_date
  )
  values (
    p_idempotency_key, new_job_id, p_user_id,
    'recipe_generation', p_recipe_count, current_date_utc
  );

  return new_job_id;
end;
$$;

create or replace function public.record_ai_usage(
  p_event_key text,
  p_job_id uuid,
  p_user_id uuid,
  p_kind text,
  p_provider text,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_neurons numeric,
  p_image_count smallint,
  p_estimated_cost_usd numeric
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
  next_attempt smallint;
begin
  insert into app_private.ai_usage_events (
    event_key, job_id, user_id, kind, provider, model, input_tokens,
    output_tokens, neurons, image_count, estimated_cost_usd
  )
  values (
    p_event_key, p_job_id, p_user_id, p_kind, p_provider, p_model,
    greatest(p_input_tokens, 0), greatest(p_output_tokens, 0),
    greatest(p_neurons, 0), greatest(p_image_count, 0),
    greatest(p_estimated_cost_usd, 0)
  )
  on conflict (event_key) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 1 then
    if p_kind = 'text' then
      perform pg_advisory_xact_lock(hashtextextended(p_job_id::text, 1));
      select (coalesce(max(attempt_number), 0) + 1)::smallint
      into next_attempt
      from app_private.ai_generation_attempts
      where job_id = p_job_id;
      if next_attempt <= 10 then
        insert into app_private.ai_generation_attempts (
          job_id, attempt_number, provider, model, input_tokens,
          output_tokens, image_count, estimated_cost_usd
        )
        values (
          p_job_id, next_attempt, p_provider, p_model, p_input_tokens,
          p_output_tokens, 0, p_estimated_cost_usd
        );
        update public.ai_generation_jobs
        set attempt_count = next_attempt,
            provider = p_provider,
            model = p_model
        where id = p_job_id;
      end if;
    end if;

    insert into app_private.global_ai_daily_usage (
      usage_date, quota_key, used_count, limit_count, estimated_cost_usd
    )
    values (
      (timezone('utc', now()))::date, 'provider_calls', 1, 2147483647,
      greatest(p_estimated_cost_usd, 0)
    )
    on conflict (usage_date, quota_key)
    do update set
      used_count = app_private.global_ai_daily_usage.used_count + 1,
      estimated_cost_usd =
        app_private.global_ai_daily_usage.estimated_cost_usd
        + excluded.estimated_cost_usd,
      updated_at = timezone('utc', now());
  end if;

  return inserted_count = 1;
end;
$$;

create or replace function public.is_ai_cost_circuit_open(
  p_daily_cost_limit_usd numeric
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select estimated_cost_usd >= p_daily_cost_limit_usd
    from app_private.global_ai_daily_usage
    where usage_date = (timezone('utc', now()))::date
      and quota_key = 'provider_calls'
  ), false);
$$;

revoke all on function public.reserve_ai_generation_job(
  uuid, uuid, text, jsonb, smallint, integer, integer
) from public;
revoke all on function public.record_ai_usage(
  text, uuid, uuid, text, text, text, integer, integer, numeric, smallint, numeric
) from public;
revoke all on function public.is_ai_cost_circuit_open(numeric) from public;
grant execute on function public.reserve_ai_generation_job(
  uuid, uuid, text, jsonb, smallint, integer, integer
) to service_role;
grant execute on function public.record_ai_usage(
  text, uuid, uuid, text, text, text, integer, integer, numeric, smallint, numeric
) to service_role;
grant execute on function public.is_ai_cost_circuit_open(numeric)
to service_role;

create or replace view public.admin_ai_usage_daily
as
select
  usage_date,
  quota_key,
  used_count,
  limit_count,
  estimated_cost_usd,
  round((used_count::numeric / nullif(limit_count, 0)) * 100, 2)
    as usage_percent,
  updated_at
from app_private.global_ai_daily_usage
where app_private.is_admin();

grant select on public.admin_ai_usage_daily to authenticated;

comment on column public.ai_generation_jobs.request_payload is
  'Requête strictement pseudonymisée ; jamais de nom, e-mail ou date de naissance.';
comment on column public.recipe_images.illustrative is
  'Toujours vrai pour une image générée : le produit doit afficher la mention illustrative.';
comment on function public.reserve_ai_generation_job(
  uuid, uuid, text, jsonb, smallint, integer, integer
) is
  'Réserve atomiquement les quotas utilisateur et global, puis crée une tâche idempotente.';

create or replace function public.store_validated_ai_recipe(
  p_job_id uuid,
  p_user_id uuid,
  p_canonical_slug text,
  p_deduplication_hash text,
  p_recipe jsonb,
  p_nutrition jsonb,
  p_provider text,
  p_model text,
  p_prompt_version text,
  p_position smallint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipe_id_value uuid;
  recipe_version_id_value uuid;
  ingredient_value jsonb;
  step_value jsonb;
  ingredient_id_value uuid;
begin
  if p_canonical_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
     or p_deduplication_hash !~ '^[a-f0-9]{64}$'
     or p_position not between 1 and 14
     or jsonb_typeof(p_recipe) <> 'object'
     or jsonb_typeof(p_nutrition) <> 'object' then
    raise exception 'invalid validated recipe payload' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.ai_generation_jobs
    where id = p_job_id and user_id = p_user_id
  ) then
    raise exception 'generation job ownership mismatch' using errcode = '42501';
  end if;

  select id into recipe_id_value
  from public.recipes
  where deduplication_hash = p_deduplication_hash;

  if recipe_id_value is null then
    insert into public.recipes (
      canonical_slug, deduplication_hash, created_by
    )
    values (p_canonical_slug, p_deduplication_hash, p_user_id)
    returning id into recipe_id_value;

    insert into public.recipe_versions (
      recipe_id, version_number, title, description, servings,
      preparation_minutes, cooking_minutes, resting_minutes, difficulty,
      cost_level, origin, ai_provider, ai_model, prompt_version,
      validation_status, publication_status, validated_at
      , visual_prompt, visual_alt_text, image_illustrative
    )
    values (
      recipe_id_value,
      1,
      p_recipe ->> 'titleFr',
      p_recipe ->> 'descriptionFr',
      (p_recipe ->> 'servings')::smallint,
      (p_recipe ->> 'preparationMinutes')::smallint,
      (p_recipe ->> 'cookingMinutes')::smallint,
      (p_recipe ->> 'restingMinutes')::smallint,
      (p_recipe ->> 'difficulty')::public.recipe_difficulty,
      (p_recipe ->> 'costLevel')::public.recipe_cost_level,
      'ai_generated',
      p_provider,
      p_model,
      p_prompt_version,
      'validated',
      'private',
      timezone('utc', now()),
      p_recipe #>> '{visual,promptFr}',
      p_recipe #>> '{visual,altTextFr}',
      true
    )
    returning id into recipe_version_id_value;

    for ingredient_value in
      select value from jsonb_array_elements(p_recipe -> 'ingredients')
    loop
      select id into ingredient_id_value
      from public.ingredients
      where slug = ingredient_value ->> 'canonicalIngredientId'
        and is_active;
      if ingredient_id_value is null then
        raise exception 'unknown canonical ingredient: %',
          ingredient_value ->> 'canonicalIngredientId'
          using errcode = '22023';
      end if;
      insert into public.recipe_ingredients (
        recipe_version_id, ingredient_id, position, quantity, unit,
        preparation_note, optional
      )
      values (
        recipe_version_id_value,
        ingredient_id_value,
        (
          select count(*) + 1
          from public.recipe_ingredients
          where recipe_version_id = recipe_version_id_value
        ),
        (ingredient_value ->> 'quantity')::numeric,
        ingredient_value ->> 'unit',
        nullif(ingredient_value ->> 'preparationNoteFr', ''),
        (ingredient_value ->> 'optional')::boolean
      );
    end loop;

    for step_value in
      select value from jsonb_array_elements(p_recipe -> 'steps')
    loop
      insert into public.recipe_steps (
        recipe_version_id, position, instruction, timer_seconds
      )
      values (
        recipe_version_id_value,
        (step_value ->> 'position')::smallint,
        step_value ->> 'instructionFr',
        (step_value ->> 'timerSeconds')::integer
      );
    end loop;

    insert into public.recipe_nutrition (
      recipe_version_id, source, source_version, calories_kcal, protein_g,
      carbohydrates_g, fat_g, fiber_g, salt_g, tolerance_percent
    )
    values (
      recipe_version_id_value,
      'ciqual',
      coalesce(p_nutrition ->> 'sourceVersion', 'ciqual-2025-11-03'),
      (p_nutrition #>> '{perPortion,energyKcal,value}')::numeric,
      (p_nutrition #>> '{perPortion,proteinG,value}')::numeric,
      (p_nutrition #>> '{perPortion,carbohydratesG,value}')::numeric,
      (p_nutrition #>> '{perPortion,fatG,value}')::numeric,
      (p_nutrition #>> '{perPortion,fiberG,value}')::numeric,
      (p_nutrition #>> '{perPortion,saltG,value}')::numeric,
      10
    );
  end if;

  insert into public.ai_generation_job_recipes (job_id, recipe_id, position)
  values (p_job_id, recipe_id_value, p_position)
  on conflict (job_id, recipe_id) do nothing;

  return recipe_id_value;
end;
$$;

revoke all on function public.store_validated_ai_recipe(
  uuid, uuid, text, text, jsonb, jsonb, text, text, text, smallint
) from public;
grant execute on function public.store_validated_ai_recipe(
  uuid, uuid, text, text, jsonb, jsonb, text, text, text, smallint
) to service_role;
