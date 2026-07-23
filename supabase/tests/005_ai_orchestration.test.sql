begin;

select plan(40);

select has_table(
  'public', 'ai_generation_job_recipes',
  'generation results are linked to persistent jobs'
);
select has_table(
  'app_private', 'global_ai_daily_usage',
  'global quotas and costs are private'
);
select has_table(
  'app_private', 'ai_quota_reservations',
  'quota reservations are idempotent'
);
select has_table(
  'app_private', 'ai_usage_events',
  'provider consumption has an immutable ledger'
);
select has_function(
  'public', 'reserve_ai_generation_job',
  array['uuid', 'uuid', 'text', 'jsonb', 'smallint', 'integer', 'integer'],
  'job creation and quota reservation are atomic'
);
select has_function(
  'public', 'record_ai_usage',
  array[
    'text', 'uuid', 'uuid', 'text', 'text', 'text',
    'integer', 'integer', 'numeric', 'smallint', 'numeric'
  ],
  'provider usage is recorded idempotently'
);
select has_function(
  'public', 'is_ai_cost_circuit_open', array['numeric'],
  'the durable cost circuit is available'
);
select has_function(
  'public', 'store_validated_ai_recipe',
  array[
    'uuid', 'uuid', 'text', 'text', 'jsonb', 'jsonb',
    'text', 'text', 'text', 'smallint'
  ],
  'validated recipes are stored transactionally'
);
select has_column(
  'public', 'ai_generation_jobs', 'progress_percent',
  'job progress is observable'
);
select has_column(
  'public', 'recipe_images', 'recipe_id',
  'images are attached to the canonical recipe'
);
select has_index(
  'public', 'recipe_images', 'recipe_images_generation_once_idx',
  'one generation key cannot create duplicate images'
);
select ok(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.ai_generation_job_recipes'::regclass
  ),
  'job result links use RLS'
);
select has_view(
  'public', 'admin_ai_usage_daily',
  'administrators have a detailed quota and cost view'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
)
values
  (
    '97000000-0000-4000-8000-000000000001',
    'ai-owner@example.test',
    'authenticated',
    'authenticated',
    '{"first_name":"Profil","last_name":"IA","birth_date":"1990-01-01"}',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '97000000-0000-4000-8000-000000000002',
    'ai-other@example.test',
    'authenticated',
    'authenticated',
    '{"first_name":"Autre","last_name":"Profil","birth_date":"1992-01-01"}',
    timezone('utc', now()),
    timezone('utc', now())
  );

select isnt(
  public.reserve_ai_generation_job(
    '97000000-0000-4000-8000-000000000001',
    '97100000-0000-4000-8000-000000000001',
    'recipe-prompt.v1',
    '{"contractVersion":"recipe-generation.v1"}'::jsonb,
    2::smallint,
    3,
    10
  ),
  null,
  'a valid reservation creates a job'
);
select is(
  public.reserve_ai_generation_job(
    '97000000-0000-4000-8000-000000000001',
    '97100000-0000-4000-8000-000000000001',
    'recipe-prompt.v1',
    '{"contractVersion":"recipe-generation.v1"}'::jsonb,
    2::smallint,
    3,
    10
  ),
  (
    select id from public.ai_generation_jobs
    where user_id = '97000000-0000-4000-8000-000000000001'
      and idempotency_key = '97100000-0000-4000-8000-000000000001'
  ),
  'the same idempotency key returns the existing job'
);
select is(
  (
    select used_count from public.usage_quotas
    where user_id = '97000000-0000-4000-8000-000000000001'
      and quota_key = 'recipe_generation'
  ),
  2,
  'an idempotent replay does not consume the user quota twice'
);
select is(
  (
    select used_count from app_private.global_ai_daily_usage
    where quota_key = 'recipe_generation'
  ),
  2,
  'the global counter is reserved with the user counter'
);
select is(
  (
    select count(*) from app_private.ai_quota_reservations
    where user_id = '97000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'one reservation ledger entry exists'
);
select throws_ok(
  $$
    select public.reserve_ai_generation_job(
      '97000000-0000-4000-8000-000000000001',
      '97100000-0000-4000-8000-000000000002',
      'recipe-prompt.v1',
      '{"contractVersion":"recipe-generation.v1"}'::jsonb,
      2::smallint,
      3,
      10
    )
  $$,
  'P0001',
  'AI_USER_QUOTA_EXCEEDED',
  'a reservation beyond the user quota is rejected'
);
select is(
  (
    select used_count from public.usage_quotas
    where user_id = '97000000-0000-4000-8000-000000000001'
      and quota_key = 'recipe_generation'
  ),
  2,
  'a rejected reservation changes no counter'
);

select ok(
  public.record_ai_usage(
    'job:text:0001',
    (
      select id from public.ai_generation_jobs
      where idempotency_key = '97100000-0000-4000-8000-000000000001'
    ),
    '97000000-0000-4000-8000-000000000001',
    'text',
    'groq',
    'openai/gpt-oss-120b',
    100,
    200,
    0::numeric,
    0::smallint,
    0.100000
  ),
  'a first usage event is inserted'
);
select is(
  public.record_ai_usage(
    'job:text:0001',
    (
      select id from public.ai_generation_jobs
      where idempotency_key = '97100000-0000-4000-8000-000000000001'
    ),
    '97000000-0000-4000-8000-000000000001',
    'text',
    'groq',
    'openai/gpt-oss-120b',
    100,
    200,
    0::numeric,
    0::smallint,
    0.100000
  ),
  false,
  'the same usage event cannot be billed twice'
);
select is(
  (select count(*) from app_private.ai_usage_events),
  1::bigint,
  'the usage ledger contains one event'
);
select is(
  (
    select estimated_cost_usd
    from app_private.global_ai_daily_usage
    where quota_key = 'provider_calls'
  ),
  0.100000::numeric,
  'estimated cost is accumulated once'
);
select ok(
  public.is_ai_cost_circuit_open(0.05),
  'the cost circuit opens at the configured ceiling'
);
select is(
  (
    select attempt_count from public.ai_generation_jobs
    where idempotency_key = '97100000-0000-4000-8000-000000000001'
  ),
  1::smallint,
  'successful text calls update the persistent attempt count'
);

select isnt(
  public.store_validated_ai_recipe(
    (
      select id from public.ai_generation_jobs
      where idempotency_key = '97100000-0000-4000-8000-000000000001'
    ),
    '97000000-0000-4000-8000-000000000001',
    'salade-pois-chiche-aaaaaaaaaa',
    repeat('a', 64),
    '{
      "titleFr":"Salade de pois chiche",
      "descriptionFr":"Une salade fraîche, simple et complète.",
      "servings":2,
      "preparationMinutes":10,
      "cookingMinutes":0,
      "restingMinutes":0,
      "difficulty":"easy",
      "costLevel":"low",
      "ingredients":[{
        "canonicalIngredientId":"pois-chiche",
        "quantity":200,
        "unit":"g",
        "preparationNoteFr":null,
        "optional":false
      }],
      "steps":[{
        "position":1,
        "instructionFr":"Mélanger soigneusement tous les ingrédients.",
        "timerSeconds":null
      }]
    }'::jsonb,
    '{
      "sourceVersion":"ciqual-2025-11-03",
      "perPortion":{
        "energyKcal":{"value":400},
        "proteinG":{"value":20},
        "carbohydratesG":{"value":40},
        "fatG":{"value":10},
        "fiberG":{"value":5},
        "saltG":{"value":1}
      }
    }'::jsonb,
    'fake',
    'fake-recipes-v1',
    'recipe-prompt.v1',
    1::smallint
  ),
  null,
  'a previously validated recipe is stored atomically'
);
select is(
  (select count(*) from public.recipes where deduplication_hash = repeat('a', 64)),
  1::bigint,
  'one canonical recipe is stored'
);
select is(
  (
    select validation_status from public.recipe_versions
    where recipe_id = (
      select id from public.recipes where deduplication_hash = repeat('a', 64)
    )
  ),
  'validated'::public.recipe_validation_status,
  'the stored version is already deterministically validated'
);
select is(
  (
    select count(*) from public.recipe_ingredients
    where recipe_version_id = (
      select id from public.recipe_versions
      where recipe_id = (
        select id from public.recipes where deduplication_hash = repeat('a', 64)
      )
    )
  ),
  1::bigint,
  'validated ingredients are stored'
);
select is(
  (
    select count(*) from public.recipe_steps
    where recipe_version_id = (
      select id from public.recipe_versions
      where recipe_id = (
        select id from public.recipes where deduplication_hash = repeat('a', 64)
      )
    )
  ),
  1::bigint,
  'validated steps are stored'
);
select is(
  (
    select calories_kcal from public.recipe_nutrition
    where recipe_version_id = (
      select id from public.recipe_versions
      where recipe_id = (
        select id from public.recipes where deduplication_hash = repeat('a', 64)
      )
    )
  ),
  400.00::numeric,
  'only server-calculated nutrition is stored'
);
select is(
  (select count(*) from public.ai_generation_job_recipes),
  1::bigint,
  'the recipe is linked to its generation job'
);

select isnt(
  public.reserve_ai_generation_job(
    '97000000-0000-4000-8000-000000000002',
    '97100000-0000-4000-8000-000000000003',
    'recipe-prompt.v1',
    '{"contractVersion":"recipe-generation.v1"}'::jsonb,
    1::smallint,
    3,
    10
  ),
  null,
  'another user can reserve independently'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '97000000-0000-4000-8000-000000000001',
  true
);
select is(
  (select count(*) from public.ai_generation_jobs),
  1::bigint,
  'a user sees only their own generation job'
);
select is(
  (select count(*) from public.ai_generation_job_recipes),
  1::bigint,
  'a user sees only links belonging to their job'
);
select is(
  (select count(*) from public.admin_ai_usage_daily),
  0::bigint,
  'detailed costs are hidden from a normal user'
);
select throws_ok(
  $$
    select public.reserve_ai_generation_job(
      '97000000-0000-4000-8000-000000000001',
      '97100000-0000-4000-8000-000000000004',
      'recipe-prompt.v1',
      '{}'::jsonb,
      1::smallint,
      3,
      10
    )
  $$,
  '42501',
  'permission denied for function reserve_ai_generation_job',
  'clients cannot bypass the server quota function'
);
reset role;

select is(
  (
    select count(*) from information_schema.columns
    where table_schema = 'public'
      and table_name = 'recipe_images'
      and column_name in (
        'content_type', 'byte_size', 'checksum_sha256',
        'illustrative', 'generation_key', 'generated_at'
      )
  ),
  6::bigint,
  'image technical metadata are persisted'
);
select is(
  (
    select count(*) from pg_catalog.pg_indexes
    where schemaname = 'public'
      and indexname in (
        'recipe_images_generation_once_idx',
        'recipe_images_one_primary_ready_idx'
      )
  ),
  2::bigint,
  'canonical image uniqueness is enforced'
);

select * from finish();
rollback;
