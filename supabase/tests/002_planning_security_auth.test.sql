begin;

select plan(37);

select has_table('public', 'meal_plans', 'meal plans exist');
select has_table('public', 'planned_meals', 'planned meals exist');
select has_table('public', 'recipe_reactions', 'current reactions exist');
select has_table('public', 'recipe_reaction_events', 'reaction history exists');
select has_table('public', 'recipe_swaps', 'swap history exists');
select has_table('public', 'cooked_recipes', 'cooked history exists');
select has_table('public', 'favorite_recipes', 'favorites exist');
select has_table('public', 'shopping_lists', 'shopping lists exist');
select has_table('public', 'shopping_list_items', 'shopping items exist');
select has_table('public', 'ai_generation_jobs', 'AI jobs exist');
select has_table('public', 'usage_quotas', 'usage quotas exist');
select has_table('public', 'content_reports', 'reports exist');
select has_table('public', 'account_deletion_requests', 'deletion audit exists');

select has_function(
  'public',
  'consume_auth_rate_limit',
  array['text', 'text'],
  'auth rate limit is server controlled'
);
select has_function(
  'public',
  'request_account_deletion',
  array['text', 'uuid'],
  'account deletion request is centralized'
);
select ok(
  (
    select bool_and(c.relrowsecurity)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'meal_plans', 'planned_meals', 'recipe_reactions',
        'recipe_reaction_events', 'recipe_swaps', 'cooked_recipes',
        'favorite_recipes', 'shopping_lists', 'shopping_list_items',
        'ai_generation_jobs', 'usage_quotas', 'content_reports',
        'account_deletion_requests'
      )
  ),
  'RLS protects every new user or operational table'
);
select ok(
  (
    select count(*) >= 26
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and policyname in (
        'users manage own meal plans',
        'users manage own planned meals',
        'administrators manage rows'
      )
  ),
  'owner and administrator policies are installed'
);
select ok(
  (select count(*) >= 4 from public.data_retention_policies),
  'retention rules are explicit and seeded'
);
select is(
  (select count(*) from storage.buckets where id in ('recipe-images', 'user-assets')),
  2::bigint,
  'private storage buckets are configured'
);
select has_index(
  'public',
  'meal_plans',
  'meal_plans_user_status_idx',
  'meal plan listing is indexed'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
)
values (
  '91000000-0000-4000-8000-000000000010',
  'signup-trigger@example.test',
  'authenticated',
  'authenticated',
  '{"first_name":"Jeanne","last_name":"Test","birth_date":"1990-01-01"}',
  timezone('utc', now()),
  timezone('utc', now())
);
select is(
  (
    select first_name
    from public.profiles
    where id = '91000000-0000-4000-8000-000000000010'
  ),
  'Jeanne',
  'signup metadata creates the minimal profile'
);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  (
    '91000000-0000-4000-8000-000000000001',
    'alice-planning@example.test',
    'authenticated',
    'authenticated',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    'bob-planning@example.test',
    'authenticated',
    'authenticated',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '91000000-0000-4000-8000-000000000003',
    'admin-planning@example.test',
    'authenticated',
    'authenticated',
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into public.profiles (id, first_name, last_name, birth_date)
values
  ('91000000-0000-4000-8000-000000000001', 'Alice', 'Planning', '1990-01-01'),
  ('91000000-0000-4000-8000-000000000002', 'Bob', 'Planning', '1990-01-01'),
  ('91000000-0000-4000-8000-000000000003', 'Ada', 'Admin', '1990-01-01');
insert into public.user_roles (user_id, role)
values ('91000000-0000-4000-8000-000000000003', 'admin');

insert into public.ai_generation_jobs (
  id, user_id, kind, idempotency_key, prompt_version
)
values (
  '94000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000001',
  'meal_plan',
  '94000000-0000-4000-8000-000000000002',
  'planning-v1'
);
insert into app_private.ai_generation_attempts (
  job_id, attempt_number, provider, model
)
values (
  '94000000-0000-4000-8000-000000000001',
  1,
  'fake',
  'fake-model'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select is(
  (select count(*) from public.admin_ai_attempts),
  0::bigint,
  'a normal user cannot inspect technical AI attempts through the view'
);

select isnt_empty(
  $$
    insert into public.meal_plans (user_id, week_start, idempotency_key)
    values (
      '91000000-0000-4000-8000-000000000001',
      '2026-07-20',
      '92000000-0000-4000-8000-000000000001'
    )
    returning id
  $$,
  'a user creates their own meal plan'
);
select throws_ok(
  $$
    insert into public.planned_meals (
      meal_plan_id, user_id, meal_date, meal_type, servings
    )
    select
      id,
      user_id,
      '2026-07-27',
      'dinner',
      2
    from public.meal_plans
    where user_id = '91000000-0000-4000-8000-000000000001'
  $$,
  '23514',
  'meal date must belong to the plan week',
  'a planned meal must stay inside its week'
);

reset role;
insert into public.meal_plans (user_id, week_start, idempotency_key)
values (
  '91000000-0000-4000-8000-000000000002',
  '2026-07-20',
  '92000000-0000-4000-8000-000000000002'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select is(
  (select count(*) from public.meal_plans),
  1::bigint,
  'a user cannot read another meal plan'
);
select is_empty(
  $$
    update public.meal_plans
    set status = 'archived'
    where user_id = '91000000-0000-4000-8000-000000000002'
    returning id
  $$,
  'a user cannot update another meal plan'
);

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000003', true);
select is(
  (select count(*) from public.admin_ai_attempts),
  1::bigint,
  'an administrator can inspect the redacted AI attempt view'
);
select is(
  (select count(*) from public.meal_plans),
  2::bigint,
  'an administrator can inspect user rows'
);
reset role;

set local role anon;
select throws_ok(
  $$ select id from public.meal_plans $$,
  '42501',
  'permission denied for table meal_plans',
  'anonymous users cannot read meal plans'
);

select ok(public.consume_auth_rate_limit('password_reset', repeat('a', 64)), 'first reset attempt is allowed');
select ok(public.consume_auth_rate_limit('password_reset', repeat('a', 64)), 'second reset attempt is allowed');
select ok(public.consume_auth_rate_limit('password_reset', repeat('a', 64)), 'third reset attempt is allowed');
select is(public.consume_auth_rate_limit('password_reset', repeat('a', 64)), false, 'further reset attempts are denied');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select isnt(
  public.request_account_deletion(
    'SUPPRIMER',
    '92000000-0000-4000-8000-000000000099'
  ),
  null,
  'deletion is explicitly confirmed and queued'
);
select is(
  (
    select status::text
    from public.account_deletion_requests
    where user_id = '91000000-0000-4000-8000-000000000001'
  ),
  'processing',
  'the deletion request is ready for server processing'
);
select is(
  public.request_account_deletion(
      'SUPPRIMER',
      '92000000-0000-4000-8000-000000000099'
  ),
  (
    select id
    from public.account_deletion_requests
    where user_id = '91000000-0000-4000-8000-000000000001'
  ),
  'a repeated deletion request returns the same audit row'
);
select is(
  (
    select count(*)
    from public.account_deletion_requests
    where user_id = '91000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'a repeated deletion request is idempotent'
);
reset role;

select * from finish();
rollback;
