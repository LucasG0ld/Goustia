begin;
select plan(38);

select has_type(
  'public', 'preference_interaction_kind',
  'interaction signal kinds are explicit'
);
select has_type(
  'public', 'learned_preference_subject_kind',
  'learned preferences cannot become allergies'
);
select has_type(
  'public', 'planned_meal_mutation_kind',
  'planning mutations are auditable'
);
select has_table(
  'public', 'preference_learning_events',
  'preference signal history exists'
);
select has_table(
  'public', 'learned_preferences',
  'deduced preferences are correctable'
);
select has_table(
  'public', 'planned_meal_mutations',
  'planning mutation history exists'
);
select has_column(
  'public', 'meal_plans', 'revision',
  'plans expose an optimistic concurrency revision'
);
select has_column(
  'public', 'planned_meals', 'revision',
  'meals expose an optimistic concurrency revision'
);
select has_function(
  'public',
  'record_preference_learning_signal',
  array['uuid', 'preference_interaction_kind',
    'learned_preference_subject_kind', 'text', 'dislike_reason',
    'numeric', 'uuid'],
  'signals are recorded idempotently'
);
select has_function(
  'public',
  'correct_learned_preference',
  array['learned_preference_subject_kind', 'text', 'numeric'],
  'users can correct deduced preferences'
);
select has_function(
  'public',
  'revert_preference_learning_signal',
  array['uuid'],
  'individual signals are reversible'
);
select has_function(
  'public',
  'apply_planned_meal_mutation',
  array['uuid', 'planned_meal_mutation_kind', 'uuid', 'integer', 'uuid',
    'uuid', 'date', 'meal_type', 'smallint', 'boolean'],
  'planning mutations are atomic'
);
select has_function(
  'public',
  'complete_plan_regeneration',
  array['uuid', 'uuid', 'integer', 'uuid[]'],
  'regeneration replaces only unlocked meals'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.preference_learning_events'::regclass),
  'preference events use RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.learned_preferences'::regclass),
  'learned preferences use RLS'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.planned_meal_mutations'::regclass),
  'planning mutation history uses RLS'
);
select col_is_fk(
  'public', 'preference_learning_events', 'user_id',
  'preference events belong to users'
);
select col_is_fk(
  'public', 'preference_learning_events', 'recipe_id',
  'preference events can trace a recipe'
);
select col_is_fk(
  'public', 'learned_preferences', 'user_id',
  'learned preferences belong to users'
);
select col_is_fk(
  'public', 'planned_meal_mutations', 'user_id',
  'planning mutations belong to users'
);
select col_is_fk(
  'public', 'planned_meal_mutations', 'meal_plan_id',
  'planning mutations trace their plan'
);
select col_is_fk(
  'public', 'planned_meal_mutations', 'planned_meal_id',
  'planning mutations can trace a meal'
);
select has_index(
  'public', 'planned_meals', 'planned_meals_plan_order_idx',
  'weekly meal reads are indexed'
);
select has_index(
  'public', 'preference_learning_events',
  'preference_events_user_subject_idx',
  'preference aggregation is indexed'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
)
values (
  '98000000-0000-4000-8000-000000000001',
  'recommendation-owner@example.test',
  'authenticated',
  'authenticated',
  '{"first_name":"Profil","last_name":"Fictif","birth_date":"1990-01-01"}',
  timezone('utc', now()),
  timezone('utc', now())
);
insert into public.recipes (
  id, canonical_slug, deduplication_hash, created_by
)
values (
  '98000000-0000-4000-8000-000000000002',
  'recette-planning-test',
  repeat('8', 64),
  '98000000-0000-4000-8000-000000000001'
);
insert into public.recipe_versions (
  id, recipe_id, version_number, title, description, servings,
  preparation_minutes, cooking_minutes, difficulty, origin,
  validation_status, publication_status, validated_at
)
values (
  '98000000-0000-4000-8000-000000000003',
  '98000000-0000-4000-8000-000000000002',
  1, 'Recette de test', 'Recette strictement fictive pour le planning.',
  2, 10, 20, 'easy', 'editorial', 'validated', 'private',
  timezone('utc', now())
);
insert into public.meal_plans (
  id, user_id, week_start, idempotency_key
)
values (
  '98000000-0000-4000-8000-000000000004',
  '98000000-0000-4000-8000-000000000001',
  '2026-07-20',
  '98000000-0000-4000-8000-000000000005'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '98000000-0000-4000-8000-000000000001',
  true
);
select lives_ok(
  $$
    select public.record_preference_learning_signal(
      null, 'like', 'ingredient', 'tomato', null, 3,
      '98000000-0000-4000-8000-000000000006'
    )
  $$,
  'a preference signal is accepted'
);
select is(
  (select count(*) from public.preference_learning_events),
  1::bigint,
  'the preference signal is traceable'
);
select lives_ok(
  $$
    select public.record_preference_learning_signal(
      null, 'like', 'ingredient', 'tomato', null, 3,
      '98000000-0000-4000-8000-000000000006'
    )
  $$,
  'a preference signal can be replayed'
);
select is(
  (select count(*) from public.preference_learning_events),
  1::bigint,
  'signal replay remains idempotent'
);
select lives_ok(
  $$
    select public.revert_preference_learning_signal(
      (
        select id from public.preference_learning_events
        where idempotency_key =
          '98000000-0000-4000-8000-000000000006'
      )
    )
  $$,
  'a user can reverse an interaction signal'
);
select ok(
  (
    select reverted_at is not null
    from public.preference_learning_events
    where idempotency_key =
      '98000000-0000-4000-8000-000000000006'
  ),
  'the reversal is traceable without deleting history'
);
select throws_ok(
  $$
    select public.record_preference_learning_signal(
      null, 'dislike', 'ingredient', 'allergy:milk', 'ingredient', -4,
      '98000000-0000-4000-8000-000000000007'
    )
  $$,
  '22023',
  'invalid preference signal',
  'an interaction can never become an allergy'
);
insert into public.learned_preferences (
  user_id, subject_kind, subject_code, score, signal_count
)
values (
  '98000000-0000-4000-8000-000000000001',
  'ingredient', 'tomato', 3, 1
);
select lives_ok(
  $$
    select public.correct_learned_preference(
      'ingredient', 'tomato', -2
    )
  $$,
  'a user can correct a learned preference'
);
select is(
  (
    select corrected_score from public.learned_preferences
    where subject_kind = 'ingredient' and subject_code = 'tomato'
  ),
  (-2)::numeric,
  'the correction is stored separately from the learned score'
);
select lives_ok(
  $$
    select public.apply_planned_meal_mutation(
      '98000000-0000-4000-8000-000000000004'::uuid,
      'add'::public.planned_meal_mutation_kind,
      '98000000-0000-4000-8000-000000000008'::uuid,
      1,
      null::uuid,
      '98000000-0000-4000-8000-000000000003'::uuid,
      '2026-07-20'::date,
      'lunch'::public.meal_type,
      2::smallint,
      false
    )
  $$,
  'an eligible meal is added atomically'
);
select is(
  (
    select revision from public.meal_plans
    where id = '98000000-0000-4000-8000-000000000004'
  ),
  2,
  'a planning mutation increments the plan revision'
);
select lives_ok(
  $$
    select public.apply_planned_meal_mutation(
      '98000000-0000-4000-8000-000000000004'::uuid,
      'add'::public.planned_meal_mutation_kind,
      '98000000-0000-4000-8000-000000000008'::uuid,
      1,
      null::uuid,
      '98000000-0000-4000-8000-000000000003'::uuid,
      '2026-07-20'::date,
      'lunch'::public.meal_type,
      2::smallint,
      false
    )
  $$,
  'an identical planning mutation can be replayed'
);
select is(
  (select count(*) from public.planned_meals),
  1::bigint,
  'planning replay does not duplicate a meal'
);
select throws_ok(
  $$
    select public.apply_planned_meal_mutation(
      p_meal_plan_id =>
        '98000000-0000-4000-8000-000000000004'::uuid,
      p_kind => 'update'::public.planned_meal_mutation_kind,
      p_idempotency_key =>
        '98000000-0000-4000-8000-000000000009'::uuid,
      p_expected_plan_revision => 1
    )
  $$,
  '40001',
  'MEAL_PLAN_CONFLICT',
  'a stale mutation is rejected'
);

select * from finish();
rollback;
