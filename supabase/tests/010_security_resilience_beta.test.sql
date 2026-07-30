begin;

select plan(16);

select has_table(
  'app_private', 'api_rate_limits', 'durable rate limits exist'
);
select has_table(
  'public', 'beta_feedback', 'beta feedback channel exists'
);
select has_function(
  'public', 'consume_api_rate_limit',
  array['uuid', 'text', 'integer', 'integer'],
  'rate limit is centralized'
);
select has_function(
  'public', 'admin_recover_stale_ai_jobs',
  array['text', 'uuid', 'integer'],
  'stale jobs have a controlled recovery'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.beta_feedback'::regclass),
  'beta feedback uses RLS'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.consume_api_rate_limit(uuid,text,integer,integer)',
    'execute'
  ),
  'users cannot call the durable limiter directly'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.consume_api_rate_limit(uuid,text,integer,integer)',
    'execute'
  ),
  'service role may enforce the limiter'
);
select is(
  (select count(*) from public.recipe_categories),
  7::bigint,
  'the initial category set is loaded'
);
select is(
  (
    select count(*) from public.recipe_versions
    where validation_status = 'validated'
      and publication_status = 'published'
  ),
  2::bigint,
  'the local editorial catalog is published and validated'
);
select is(
  (
    select count(*) from public.onboarding_dishes
    where image_path is not null
  ),
  8::bigint,
  'all onboarding cards have a generic visual'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
) values
  (
    '98000000-0000-4000-8000-000000000001',
    'beta-owner@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Beta","last_name":"Owner","birth_date":"1990-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  ),
  (
    '98000000-0000-4000-8000-000000000002',
    'beta-other@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Beta","last_name":"Other","birth_date":"1990-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  );

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claim.sub', '98000000-0000-4000-8000-000000000001', true
);
select lives_ok(
  $$
    insert into public.beta_feedback (user_id, kind, message, page_path)
    values (
      '98000000-0000-4000-8000-000000000001',
      'bug', 'Le bouton ne répond pas dans ce parcours.', '/feedback'
    )
  $$,
  'a user can submit own feedback'
);
select is(
  (select count(*) from public.beta_feedback),
  1::bigint,
  'the owner can read own feedback'
);
select set_config(
  'request.jwt.claim.sub', '98000000-0000-4000-8000-000000000002', true
);
select is(
  (select count(*) from public.beta_feedback),
  0::bigint,
  'another user cannot read feedback'
);
select throws_ok(
  $$
    insert into public.beta_feedback (user_id, kind, message)
    values (
      '98000000-0000-4000-8000-000000000001',
      'bug', 'Tentative de création pour une autre personne.'
    )
  $$,
  '42501',
  null,
  'another user cannot submit feedback for the owner'
);

reset role;
set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);
select ok(
  public.consume_api_rate_limit(
    '98000000-0000-4000-8000-000000000001',
    'recipe_generation', 1, 3600
  ),
  'first request is allowed'
);
select ok(
  not public.consume_api_rate_limit(
    '98000000-0000-4000-8000-000000000001',
    'recipe_generation', 1, 3600
  ),
  'request above the limit is rejected'
);

select * from finish();
rollback;
