begin;
select plan(19);

select has_table(
  'public', 'recipe_equipment_requirements',
  'recipe equipment requirements exist'
);
select has_table(
  'public', 'recipe_substitutions',
  'recipe substitutions exist'
);
select has_table(
  'public', 'recipe_action_events',
  'idempotent recipe action traces exist'
);
select has_table(
  'public', 'cooking_sessions',
  'resumable cooking sessions exist'
);
select has_column(
  'public', 'recipe_versions', 'storage_instructions',
  'recipe storage instructions are supported'
);
select has_column(
  'public', 'recipe_versions', 'reheating_instructions',
  'recipe reheating instructions are supported'
);
select has_column(
  'public', 'recipe_reactions', 'reason_detail',
  'motivated dislikes can include optional detail'
);
select has_column(
  'public', 'recipe_swaps', 'quota_counted',
  'swap quota consumption is traceable'
);
select has_function(
  'public',
  'complete_recipe_swap',
  array[
    'uuid', 'uuid', 'uuid', 'text', 'boolean', 'boolean', 'boolean',
    'boolean', 'uuid'
  ],
  'meal replacement is transactional'
);
select has_function(
  'public',
  'copy_meal_plan_week',
  array['date', 'date', 'uuid'],
  'week copying is transactional and deduplicated'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.recipe_action_events'::regclass),
  'recipe action traces use RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.cooking_sessions'::regclass),
  'cooking sessions use RLS'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
)
values (
  '99000000-0000-4000-8000-000000000001',
  'recipe-experience@example.test',
  'authenticated',
  'authenticated',
  '{"first_name":"Cuisine","last_name":"Test","birth_date":"1990-01-01"}',
  timezone('utc', now()),
  timezone('utc', now())
);
insert into public.recipes (
  id, canonical_slug, deduplication_hash, created_by
)
values
  (
    '99000000-0000-4000-8000-000000000002',
    'recette-initiale-experience',
    repeat('a', 64),
    '99000000-0000-4000-8000-000000000001'
  ),
  (
    '99000000-0000-4000-8000-000000000003',
    'recette-alternative-experience',
    repeat('b', 64),
    '99000000-0000-4000-8000-000000000001'
  );
insert into public.recipe_versions (
  id, recipe_id, version_number, title, description, servings,
  preparation_minutes, cooking_minutes, difficulty, origin,
  validation_status, publication_status, validated_at
)
values
  (
    '99000000-0000-4000-8000-000000000004',
    '99000000-0000-4000-8000-000000000002',
    1, 'Plat initial', 'Description fictive du plat initial.', 2,
    10, 20, 'easy', 'editorial', 'validated', 'private',
    timezone('utc', now())
  ),
  (
    '99000000-0000-4000-8000-000000000005',
    '99000000-0000-4000-8000-000000000003',
    1, 'Plat alternatif', 'Description fictive du plat alternatif.', 2,
    10, 20, 'easy', 'editorial', 'validated', 'private',
    timezone('utc', now())
  );
insert into public.meal_plans (
  id, user_id, week_start, idempotency_key
)
values (
  '99000000-0000-4000-8000-000000000006',
  '99000000-0000-4000-8000-000000000001',
  '2026-07-20',
  '99000000-0000-4000-8000-000000000007'
);
insert into public.planned_meals (
  id, meal_plan_id, user_id, recipe_version_id, meal_date, meal_type, servings
)
values (
  '99000000-0000-4000-8000-000000000008',
  '99000000-0000-4000-8000-000000000006',
  '99000000-0000-4000-8000-000000000001',
  '99000000-0000-4000-8000-000000000004',
  '2026-07-20', 'lunch', 2
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '99000000-0000-4000-8000-000000000001',
  true
);
select lives_ok(
  $$
    select public.complete_recipe_swap(
      '99000000-0000-4000-8000-000000000008',
      '99000000-0000-4000-8000-000000000004',
      '99000000-0000-4000-8000-000000000005',
      'Une alternative de test',
      true, false, true, false,
      '99000000-0000-4000-8000-000000000009'
    )
  $$,
  'a safe selected meal can be replaced'
);
select is(
  (
    select recipe_version_id
    from public.planned_meals
    where id = '99000000-0000-4000-8000-000000000008'
  ),
  '99000000-0000-4000-8000-000000000005'::uuid,
  'only the selected meal receives the alternative'
);
select lives_ok(
  $$
    select public.complete_recipe_swap(
      '99000000-0000-4000-8000-000000000008',
      '99000000-0000-4000-8000-000000000004',
      '99000000-0000-4000-8000-000000000005',
      'Une alternative de test',
      true, false, true, false,
      '99000000-0000-4000-8000-000000000009'
    )
  $$,
  'replaying the same swap is idempotent'
);
select is(
  (
    select used_count
    from public.usage_quotas
    where user_id = '99000000-0000-4000-8000-000000000001'
      and quota_key = 'recipe_swap'
  ),
  1,
  'an idempotent replay consumes quota only once'
);
select is(
  (
    select count(*)
    from public.preference_learning_events
    where interaction_kind = 'swap'
      and subject_kind = 'dish_type'
  ),
  1::bigint,
  'the swap records one contextual non-safety preference signal'
);
select throws_ok(
  $$
    select public.complete_recipe_swap(
      '99000000-0000-4000-8000-000000000008',
      '99000000-0000-4000-8000-000000000004',
      '99000000-0000-4000-8000-000000000005',
      null, false, false, false, false,
      '99000000-0000-4000-8000-000000000010'
    )
  $$,
  '40001',
  'planned meal changed',
  'a stale concurrent swap is rejected'
);
select is(
  (
    select recipe_version_id
    from public.planned_meals
    where id = '99000000-0000-4000-8000-000000000008'
  ),
  '99000000-0000-4000-8000-000000000005'::uuid,
  'a failed swap keeps the current meal'
);

select * from finish();
rollback;
