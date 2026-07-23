begin;

select plan(46);

select has_table('public', 'legal_document_versions', 'legal documents are versioned');
select has_table('public', 'user_legal_consents', 'legal acceptances are recorded');
select has_table('public', 'onboarding_steps', 'onboarding steps are resumable');
select has_table('public', 'onboarding_events', 'onboarding analytics are separated');
select has_table('public', 'onboarding_dishes', 'taste cards use a curated catalog');
select has_table('public', 'onboarding_dish_preferences', 'selected taste cards are stored');
select has_table('public', 'user_ingredient_preferences', 'ingredient tastes are separate');
select has_table('public', 'contextual_question_state', 'contextual frequency is persisted');
select has_table('public', 'taxonomy_versions', 'taxonomy is versioned');
select has_table('public', 'ingredient_units', 'ingredient units are normalized');
select has_table('public', 'ingredient_corrections', 'taxonomy corrections are audited');
select has_table('public', 'data_retention_policies', 'retention remains explicit');

select has_column('public', 'profiles', 'food_safety_confirmed_at', 'food safety confirmation is explicit');
select has_column('public', 'user_equipment', 'learned_from', 'equipment preference provenance is stored');
select has_function('public', 'complete_food_safety_onboarding', array['jsonb', 'boolean'], 'food safety writes are atomic');
select has_function('public', 'complete_goals_onboarding', array['nutrition_goal', 'smallint', 'smallint'], 'goals are validated in one function');
select has_function('public', 'complete_tastes_and_request_plan', array['uuid[]', 'boolean', 'uuid'], 'taste completion is idempotent');
select has_function(
  'public',
  'save_progressive_profile',
  array['dietary_pattern', 'cooking_skill', 'smallint', 'budget_level', 'text[]', 'jsonb', 'uuid[]'],
  'progressive profile writes are atomic'
);
select has_function(
  'public',
  'correct_ingredient',
  array['uuid', 'text', 'text', 'text', 'text'],
  'taxonomy correction is centralized'
);

select is((select count(*) from public.legal_document_versions where is_current), 6::bigint, 'six current legal drafts are published');
select is((select count(*) from public.legal_document_versions where is_current and requires_acceptance), 2::bigint, 'only terms and privacy are accepted at signup');
select is((select count(*) from public.taxonomy_versions where is_current), 1::bigint, 'one taxonomy version is current');
select is((select count(*) from public.ingredients where taxonomy_version_id = '81000000-0000-4000-8000-000000000001'), 20::bigint, 'benchmark import contains exactly 20 ingredients');
select ok((select count(*) >= 20 from public.ingredient_synonyms), 'French plurals and variants are imported');
select is((select count(*) from public.ingredients where contains_alcohol), 2::bigint, 'alcohol ingredients are structured');
select ok((select count(*) >= 20 from public.ingredient_units), 'compatible units are imported');
select ok((select count(*) >= 5 from public.ingredient_relations), 'derived ingredients are linked');
select ok(
  (
    select bool_and(c.relrowsecurity)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'user_legal_consents', 'onboarding_steps', 'onboarding_events',
        'onboarding_dish_preferences', 'user_ingredient_preferences',
        'contextual_question_state', 'ingredient_corrections'
      )
  ),
  'new personal and administrative tables use RLS'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
)
values (
  '95000000-0000-4000-8000-000000000001',
  'onboarding-alice@example.test',
  'authenticated',
  'authenticated',
  '{"first_name":"Alice","last_name":"Onboarding","birth_date":"1990-01-01","legal_acceptance":true}',
  timezone('utc', now()),
  timezone('utc', now())
);
select is(
  (select first_name from public.profiles where id = '95000000-0000-4000-8000-000000000001'),
  'Alice',
  'signup creates the minimal profile'
);
select is(
  (select count(*) from public.user_legal_consents where user_id = '95000000-0000-4000-8000-000000000001'),
  2::bigint,
  'signup records each required document version'
);
select is(
  (select count(*) from public.onboarding_steps where user_id = '95000000-0000-4000-8000-000000000001' and step = 'account'),
  1::bigint,
  'signup completes the account onboarding step'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$ select public.complete_food_safety_onboarding('[]'::jsonb, false) $$,
  '22023',
  'inconsistent food safety submission',
  'an empty unconfirmed safety submission is rejected'
);
select lives_ok(
  $$ select public.complete_food_safety_onboarding('[]'::jsonb, true) $$,
  'the explicit no-constraint option is accepted'
);
select isnt(
  (select food_safety_confirmed_at from public.profiles where id = '95000000-0000-4000-8000-000000000001'),
  null,
  'food safety confirmation is timestamped'
);
select lives_ok(
  $$ select public.complete_goals_onboarding('balanced'::public.nutrition_goal, 7::smallint, 2::smallint) $$,
  'goals are accepted after food safety'
);
select isnt(
  public.complete_tastes_and_request_plan(
    array[]::uuid[],
    true,
    '96000000-0000-4000-8000-000000000001'
  ),
  null,
  'skipping taste cards starts the fake generation'
);
select is(
  (select count(*) from public.onboarding_dish_preferences where user_id = '95000000-0000-4000-8000-000000000001'),
  0::bigint,
  'ignored cards create no dislike or other signal'
);
select is(
  (
    select status::text
    from public.ai_generation_jobs
    where user_id = '95000000-0000-4000-8000-000000000001'
      and idempotency_key = '96000000-0000-4000-8000-000000000001'
  ),
  'succeeded',
  'the local fake provider finishes deterministically'
);
select lives_ok(
  $$
    select public.save_progressive_profile(
      'omnivore'::public.dietary_pattern,
      'beginner'::public.cooking_skill,
      30::smallint,
      'moderate'::public.budget_level,
      array['french'],
      '[{"ingredient_id":"30000000-0000-4000-8000-000000000012","signal":"disliked"}]'::jsonb,
      array['10000000-0000-4000-8000-000000000001']::uuid[]
    )
  $$,
  'progressive preferences are saved'
);
select is(
  (select count(*) from public.user_ingredient_preferences where user_id = '95000000-0000-4000-8000-000000000001'),
  1::bigint,
  'an ingredient dislike is a preference'
);
select is(
  (select count(*) from public.user_food_constraints where user_id = '95000000-0000-4000-8000-000000000001'),
  0::bigint,
  'an ingredient dislike never becomes a safety exclusion'
);
reset role;

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  ('95000000-0000-4000-8000-000000000002', 'onboarding-bob@example.test', 'authenticated', 'authenticated', now(), now()),
  ('95000000-0000-4000-8000-000000000003', 'taxonomy-admin@example.test', 'authenticated', 'authenticated', now(), now());
insert into public.profiles (id, first_name, last_name, birth_date)
values
  ('95000000-0000-4000-8000-000000000002', 'Bob', 'Onboarding', '1990-01-01'),
  ('95000000-0000-4000-8000-000000000003', 'Ada', 'Taxonomy', '1990-01-01');
insert into public.user_roles (user_id, role)
values ('95000000-0000-4000-8000-000000000003', 'admin');

set local role authenticated;
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000002', true);
select is(
  (select count(*) from public.onboarding_steps),
  0::bigint,
  'a second user cannot read onboarding progress'
);
reset role;

set local role anon;
select is(
  (select count(*) from public.legal_document_versions where is_current),
  6::bigint,
  'legal information is available before signup'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000002', true);
select throws_ok(
  $$
    select public.correct_ingredient(
      '30000000-0000-4000-8000-000000000012',
      'source_reference',
      'Source utilisateur',
      'Correction non autorisée',
      'https://example.test/source'
    )
  $$,
  '42501',
  'administrator required',
  'a normal user cannot correct the taxonomy'
);
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000003', true);
select lives_ok(
  $$
    select public.correct_ingredient(
      '30000000-0000-4000-8000-000000000012',
      'source_reference',
      'Référentiel éditorial benchmark v1',
      'Ajout de la source éditoriale de test',
      'https://eur-lex.europa.eu/eli/reg/2011/1169/oj?locale=fr'
    )
  $$,
  'an administrator can apply a sourced correction'
);
select is(
  (select count(*) from public.ingredient_corrections where requested_by = '95000000-0000-4000-8000-000000000003'),
  1::bigint,
  'the administrator correction is audited'
);
reset role;

select * from finish();
rollback;
