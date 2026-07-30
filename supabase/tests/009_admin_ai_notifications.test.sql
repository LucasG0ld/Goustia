begin;

select plan(36);

select has_table('public', 'ai_runtime_settings', 'AI runtime settings exist');
select has_table('public', 'ai_prompt_registry', 'prompt metadata registry exists');
select has_table('public', 'notification_preferences', 'notification preferences exist');
select has_table('public', 'notification_deliveries', 'notification deliveries exist');
select has_function(
  'public', 'admin_set_ai_runtime',
  array['text', 'public.ai_runtime_kind', 'boolean', 'text', 'text', 'uuid'],
  'AI runtime changes use a controlled function'
);
select has_function(
  'public', 'admin_retry_ai_job', array['uuid', 'text', 'uuid'],
  'failed AI jobs can be retried safely'
);
select has_function(
  'public', 'admin_purge_ai_job', array['uuid', 'text', 'uuid'],
  'terminal AI jobs can be scrubbed'
);
select has_function(
  'public', 'admin_mutate_food_reference',
  array[
    'text', 'uuid', 'uuid', 'text', 'text', 'numeric', 'text', 'text', 'uuid'
  ],
  'food reference mutations are controlled'
);
select has_function(
  'public', 'enqueue_product_notification',
  array[
    'uuid', 'public.notification_kind', 'text', 'text', 'text', 'text',
    'timestamp with time zone'
  ],
  'product notifications are queued centrally'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.ai_runtime_settings'::regclass),
  'AI runtime settings use RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.ai_prompt_registry'::regclass),
  'prompt registry uses RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.notification_preferences'::regclass),
  'notification preferences use RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.notification_deliveries'::regclass),
  'notification deliveries use RLS'
);
select ok(
  has_table_privilege(
    'authenticated', 'public.recipe_equipment_requirements', 'select'
  ) and has_table_privilege(
    'authenticated', 'public.recipe_substitutions', 'select'
  ) and has_table_privilege(
    'authenticated', 'public.recipe_action_events', 'insert'
  ) and has_table_privilege(
    'authenticated', 'public.cooking_sessions', 'update'
  ),
  'authenticated recipe experiences have privileges required by RLS'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
) values
  (
    '99000000-0000-4000-8000-000000000001',
    'notifications-owner@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Propriétaire","last_name":"Test","birth_date":"1990-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  ),
  (
    '99000000-0000-4000-8000-000000000002',
    'notifications-other@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Autre","last_name":"Test","birth_date":"1992-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  ),
  (
    '99000000-0000-4000-8000-000000000003',
    'ai-admin@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Admin","last_name":"IA","birth_date":"1985-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  );

insert into public.user_roles (user_id, role)
values ('99000000-0000-4000-8000-000000000003', 'admin');

insert into public.ai_generation_jobs (
  id, user_id, kind, status, idempotency_key, prompt_version,
  attempt_count, user_error_code, user_error_message, request_payload,
  progress_percent, progress_stage, completed_at
) values (
  '99000000-0000-4000-8000-000000000010',
  '99000000-0000-4000-8000-000000000001',
  'recipe', 'failed', '99000000-0000-4000-8000-000000000011',
  'recipe-prompt.v1', 1, 'provider_unavailable', 'Réessayer plus tard.',
  '{"private":"must disappear"}', 40, 'failed', timezone('utc', now())
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub', '99000000-0000-4000-8000-000000000001', true
);
select throws_ok(
  $$
    select public.admin_set_ai_runtime(
      'fake', 'text', false, 'fake-recipe-v1', 'CONFIGURER IA',
      '99000000-0000-4000-8000-000000000020'
    )
  $$,
  '42501', 'admin required',
  'a normal user cannot configure AI'
);
select lives_ok(
  $$
    select public.update_notification_preferences(
      true, true, true, 'Europe/Paris', 3::smallint
    )
  $$,
  'a user can update their own notification preferences'
);
select is(
  (select count(*) from public.notification_preferences),
  1::bigint,
  'a user sees their own preferences only'
);
select is(
  (select count(*) from public.ai_runtime_settings),
  0::bigint,
  'AI configuration is hidden from a normal user'
);

select set_config(
  'request.jwt.claim.sub', '99000000-0000-4000-8000-000000000003', true
);
select lives_ok(
  $$
    select public.admin_set_ai_runtime(
      'fake', 'text', false, 'fake-recipe-v1', 'CONFIGURER IA',
      '99000000-0000-4000-8000-000000000021'
    )
  $$,
  'an administrator can disable an allowed provider'
);
select is(
  (
    select enabled from public.ai_runtime_settings
    where provider = 'fake' and kind = 'text'
  ),
  false,
  'the controlled AI setting is persisted'
);
select throws_ok(
  $$
    select public.admin_set_ai_runtime(
      'fake', 'text', true, 'unapproved-model', 'CONFIGURER IA',
      '99000000-0000-4000-8000-000000000022'
    )
  $$,
  '22023', 'provider or model not allowed',
  'an unapproved AI model is rejected'
);
select cmp_ok(
  (
    select count(*) from public.admin_audit_log
    where action = 'ai.configure'
      and admin_user_id = '99000000-0000-4000-8000-000000000003'
  ),
  '>=', 1::bigint,
  'AI configuration is audited'
);
select lives_ok(
  $$
    select public.admin_retry_ai_job(
      '99000000-0000-4000-8000-000000000010', 'RELANCER',
      '99000000-0000-4000-8000-000000000023'
    )
  $$,
  'an administrator can retry a failed job'
);
select is(
  (
    select status::text from public.ai_generation_jobs
    where id = '99000000-0000-4000-8000-000000000010'
  ),
  'queued',
  'retry returns the job to the queue'
);

reset role;
update public.ai_generation_jobs
set status = 'failed', progress_stage = 'failed',
    completed_at = timezone('utc', now())
where id = '99000000-0000-4000-8000-000000000010';

set local role service_role;
select is(
  public.enqueue_product_notification(
    '99000000-0000-4000-8000-000000000001',
    'shopping_reminder', 'shopping:plan:1',
    'Ta liste est prête',
    'Pense à consulter ta liste avant de faire les courses.',
    '/courses', timezone('utc', now())
  ),
  2,
  'web and opted-in email deliveries are queued'
);
select is(
  public.enqueue_product_notification(
    '99000000-0000-4000-8000-000000000001',
    'shopping_reminder', 'shopping:plan:1',
    'Ta liste est prête',
    'Pense à consulter ta liste avant de faire les courses.',
    '/courses', timezone('utc', now())
  ),
  0,
  'notification enqueueing is idempotent'
);
select throws_ok(
  $$
    select public.enqueue_product_notification(
      '99000000-0000-4000-8000-000000000001',
      'shopping_reminder', 'shopping:plan:2',
      'Alerte allergie', 'Un ingrédient doit être vérifié.',
      '/courses', timezone('utc', now())
    )
  $$,
  '22023', 'sensitive notification content',
  'sensitive food content is refused'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub', '99000000-0000-4000-8000-000000000001', true
);
select is(
  (select count(*) from public.notification_deliveries),
  1::bigint,
  'the owner sees the web delivery'
);
select is(
  (
    select count(*) from public.notification_deliveries
    where channel = 'email'
  ),
  0::bigint,
  'email delivery details are hidden from the user'
);

select set_config(
  'request.jwt.claim.sub', '99000000-0000-4000-8000-000000000002', true
);
select is(
  (select count(*) from public.notification_deliveries),
  0::bigint,
  'another user cannot read notification deliveries'
);
select is(
  (select count(*) from public.notification_preferences),
  0::bigint,
  'another user cannot read preferences'
);

select set_config(
  'request.jwt.claim.sub', '99000000-0000-4000-8000-000000000003', true
);
select lives_ok(
  $$
    select public.admin_purge_ai_job(
      '99000000-0000-4000-8000-000000000010', 'PURGER',
      '99000000-0000-4000-8000-000000000024'
    )
  $$,
  'an administrator can scrub a terminal job'
);
select is(
  (
    select user_id from public.ai_generation_jobs
    where id = '99000000-0000-4000-8000-000000000010'
  ),
  null::uuid,
  'purging removes the user link'
);
select is(
  (
    select request_payload from public.ai_generation_jobs
    where id = '99000000-0000-4000-8000-000000000010'
  ),
  '{}'::jsonb,
  'purging removes the request payload'
);
select cmp_ok(
  (
    select count(*) from public.admin_audit_log
    where admin_user_id = '99000000-0000-4000-8000-000000000003'
      and action in ('ai.configure', 'ai.retry', 'ai.purge')
  ),
  '>=', 3::bigint,
  'all sensitive AI actions are audited'
);
select is(
  (
    select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'ai_prompt_registry'
      and column_name in ('prompt', 'content', 'secret', 'api_key')
  ),
  0::bigint,
  'prompt content and secrets are absent from the registry'
);

select * from finish();
rollback;
