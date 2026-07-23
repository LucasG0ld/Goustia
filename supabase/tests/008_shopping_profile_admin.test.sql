begin;
select plan(30);

select has_table('public', 'shopping_list_item_sources', 'shopping provenance exists');
select has_table('public', 'shopping_list_mutations', 'shopping mutations are traceable');
select has_table('public', 'user_recipe_eligibility', 'recipe eligibility cache exists');
select has_table('public', 'account_states', 'account state exists');
select has_table('public', 'blocked_food_rules', 'admin food blocks exist');
select has_view('public', 'admin_user_directory', 'limited admin directory exists');
select has_function(
  'public', 'replace_generated_shopping_items',
  array['uuid', 'integer', 'jsonb', 'uuid'],
  'shopping regeneration is transactional'
);
select has_function(
  'public', 'refresh_user_recipe_eligibility', array['uuid'],
  'eligibility can be recalculated'
);
select has_function(
  'public', 'admin_create_recipe_revision',
  array['uuid', 'text', 'text', 'uuid'],
  'recipe corrections are versioned'
);
select has_function(
  'public', 'admin_set_recipe_publication',
  array['uuid', 'text', 'text', 'uuid'],
  'publication is a controlled action'
);
select ok(
  (select relrowsecurity from pg_class
   where oid = 'public.blocked_food_rules'::regclass),
  'food blocks use RLS'
);
select ok(
  (select prosecdef from pg_proc
   where oid = 'app_private.is_admin()'::regprocedure),
  'database admin verification is security definer'
);

insert into auth.users (
  id, email, aud, role, raw_user_meta_data, created_at, updated_at
) values
  (
    '98000000-0000-4000-8000-000000000001',
    'shopping-user@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Courses","last_name":"Test","birth_date":"1990-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  ),
  (
    '98000000-0000-4000-8000-000000000002',
    'admin-user@example.test', 'authenticated', 'authenticated',
    '{"first_name":"Admin","last_name":"Test","birth_date":"1990-01-01"}',
    timezone('utc', now()), timezone('utc', now())
  );

insert into public.meal_plans (
  id, user_id, week_start, idempotency_key, revision
) values (
  '98000000-0000-4000-8000-000000000003',
  '98000000-0000-4000-8000-000000000001',
  '2026-07-20',
  '98000000-0000-4000-8000-000000000004',
  1
);
insert into public.shopping_lists (
  id, user_id, meal_plan_id, title, idempotency_key, plan_revision
) values (
  '98000000-0000-4000-8000-000000000005',
  '98000000-0000-4000-8000-000000000001',
  '98000000-0000-4000-8000-000000000003',
  'Courses test',
  '98000000-0000-4000-8000-000000000006',
  1
);
insert into public.shopping_list_items (
  id, shopping_list_id, user_id, manual_label, quantity, unit, aisle
) values (
  '98000000-0000-4000-8000-000000000007',
  '98000000-0000-4000-8000-000000000005',
  '98000000-0000-4000-8000-000000000001',
  'Produit manuel', 2, 'piece', 'Autres'
);
insert into public.user_roles (user_id, role)
values ('98000000-0000-4000-8000-000000000002', 'admin');
insert into public.recipes (
  id, canonical_slug, deduplication_hash, created_by
) values (
  '98000000-0000-4000-8000-000000000010',
  'recette-administration-test',
  repeat('8', 64),
  '98000000-0000-4000-8000-000000000001'
);
insert into public.recipe_versions (
  id, recipe_id, version_number, title, description, servings,
  preparation_minutes, cooking_minutes, difficulty, origin,
  validation_status, publication_status, validated_at
) values (
  '98000000-0000-4000-8000-000000000011',
  '98000000-0000-4000-8000-000000000010',
  1, 'Recette admin test', 'Description initiale suffisamment longue.', 2,
  10, 20, 'easy', 'editorial', 'validated', 'private', timezone('utc', now())
);
insert into public.recipe_ingredients (
  recipe_version_id, ingredient_id, position, quantity, unit
) values (
  '98000000-0000-4000-8000-000000000011',
  '30000000-0000-4000-8000-000000000012',
  1, 100, 'g'
);
insert into public.recipe_steps (
  recipe_version_id, position, instruction
) values (
  '98000000-0000-4000-8000-000000000011',
  1, 'Mélanger puis cuire les ingrédients.'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '98000000-0000-4000-8000-000000000001',
  true
);
select lives_ok(
  $$
    select public.replace_generated_shopping_items(
      '98000000-0000-4000-8000-000000000003',
      1, '[]'::jsonb,
      '98000000-0000-4000-8000-000000000008'
    )
  $$,
  'a user can regenerate their shopping list'
);
select is(
  (
    select count(*) from public.shopping_list_items
    where id = '98000000-0000-4000-8000-000000000007'
      and manual_label = 'Produit manuel'
  ),
  1::bigint,
  'regeneration preserves manual additions'
);
select lives_ok(
  $$
    select public.replace_generated_shopping_items(
      '98000000-0000-4000-8000-000000000003',
      1, '[]'::jsonb,
      '98000000-0000-4000-8000-000000000008'
    )
  $$,
  'shopping regeneration is idempotent'
);
select throws_ok(
  $$
    select public.admin_set_account_status(
      '98000000-0000-4000-8000-000000000002',
      'suspended', 'unauthorized attempt', 'SUSPENDRE',
      '98000000-0000-4000-8000-000000000009'
    )
  $$,
  '42501',
  'admin required',
  'a normal user cannot perform admin actions'
);
select is(app_private.is_admin(), false, 'a normal user is never an admin');

select set_config(
  'request.jwt.claim.sub',
  '98000000-0000-4000-8000-000000000002',
  true
);
select is(app_private.is_admin(), true, 'an active assigned administrator is accepted');
select lives_ok(
  $$
    select public.admin_create_recipe_revision(
      '98000000-0000-4000-8000-000000000011',
      'Recette admin corrigée',
      'Description corrigée et soumise à une nouvelle validation.',
      '98000000-0000-4000-8000-000000000012'
    )
  $$,
  'an administrator creates a separate corrected version'
);
select is(
  (
    select count(*) from public.recipe_versions
    where recipe_id = '98000000-0000-4000-8000-000000000010'
  ),
  2::bigint,
  'the correction preserves the previous version'
);
select throws_ok(
  $$
    select public.admin_set_recipe_publication(
      (
        select id from public.recipe_versions
        where recipe_id = '98000000-0000-4000-8000-000000000010'
        order by version_number desc limit 1
      ),
      'publish', 'PUBLIER',
      '98000000-0000-4000-8000-000000000013'
    )
  $$,
  '23514',
  'recipe validation required',
  'a correction cannot be published before review'
);
select lives_ok(
  $$
    select public.admin_review_recipe_revision(
      (
        select id from public.recipe_versions
        where recipe_id = '98000000-0000-4000-8000-000000000010'
        order by version_number desc limit 1
      ),
      true, 'Structure revue et validée.',
      '98000000-0000-4000-8000-000000000014'
    )
  $$,
  'the corrected version can be reviewed'
);
select lives_ok(
  $$
    select public.admin_set_recipe_publication(
      (
        select id from public.recipe_versions
        where recipe_id = '98000000-0000-4000-8000-000000000010'
        order by version_number desc limit 1
      ),
      'publish', 'PUBLIER',
      '98000000-0000-4000-8000-000000000015'
    )
  $$,
  'a reviewed correction can be published'
);
select is(
  (
    select publication_status::text from public.recipe_versions
    where recipe_id = '98000000-0000-4000-8000-000000000010'
    order by version_number desc limit 1
  ),
  'published',
  'the reviewed version becomes public'
);
select lives_ok(
  $$
    select public.admin_set_recipe_publication(
      (
        select id from public.recipe_versions
        where recipe_id = '98000000-0000-4000-8000-000000000010'
        order by version_number desc limit 1
      ),
      'unpublish', 'DEPUBLIER',
      '98000000-0000-4000-8000-000000000016'
    )
  $$,
  'publication can be reversed'
);
select is(
  (
    select publication_status::text from public.recipe_versions
    where recipe_id = '98000000-0000-4000-8000-000000000010'
    order by version_number desc limit 1
  ),
  'archived',
  'unpublishing archives the selected version'
);
select lives_ok(
  $$
    select public.admin_set_blocked_food_rule(
      null,
      '30000000-0000-4000-8000-000000000012',
      null,
      'Ingrédient bloqué pour le test',
      true,
      'CONFIRMER LE BLOCAGE',
      '98000000-0000-4000-8000-000000000017'
    )
  $$,
  'an administrator can add an audited food block'
);
select throws_ok(
  $$
    select public.admin_set_recipe_publication(
      (
        select id from public.recipe_versions
        where recipe_id = '98000000-0000-4000-8000-000000000010'
        order by version_number desc limit 1
      ),
      'publish', 'PUBLIER',
      '98000000-0000-4000-8000-000000000018'
    )
  $$,
  '23514',
  'recipe validation required',
  'publication rechecks active food blocks'
);
select cmp_ok(
  (
    select count(*) from public.admin_audit_log
    where admin_user_id = '98000000-0000-4000-8000-000000000002'
  ),
  '>=',
  5::bigint,
  'sensitive content actions are audited'
);

reset role;
insert into public.account_states (
  user_id, status, reason, suspended_at, suspended_by
)
values (
  '98000000-0000-4000-8000-000000000002',
  'suspended',
  'security test',
  timezone('utc', now()),
  '98000000-0000-4000-8000-000000000002'
);
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '98000000-0000-4000-8000-000000000002',
  true
);
select is(
  app_private.is_admin(),
  false,
  'a suspended administrator immediately loses database admin access'
);

select * from finish();
rollback;
