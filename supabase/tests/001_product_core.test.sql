begin;

select plan(35);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'culinary_preferences', 'culinary preferences table exists');
select has_table('public', 'equipment', 'equipment catalog exists');
select has_table('public', 'ingredients', 'ingredients table exists');
select has_table('public', 'ingredient_synonyms', 'ingredient synonyms table exists');
select has_table('public', 'allergens', 'allergens table exists');
select has_table('public', 'user_food_constraints', 'food constraints table exists');
select has_table('public', 'recipes', 'recipes table exists');
select has_table('public', 'recipe_versions', 'recipe versions table exists');
select has_table('public', 'recipe_nutrition', 'recipe nutrition table exists');
select has_table('public', 'recipe_images', 'recipe images table exists');

select has_column('public', 'profiles', 'birth_date', 'birth date uses date precision');
select has_column(
  'public',
  'recipe_versions',
  'prompt_version',
  'recipe AI prompt version is traceable'
);
select has_column(
  'public',
  'user_food_constraints',
  'is_absolute',
  'constraint strictness is explicit'
);

select has_index(
  'public',
  'ingredients',
  'ingredients_search_name_trgm_idx',
  'ingredient fuzzy search index exists'
);
select has_index(
  'public',
  'ingredient_synonyms',
  'ingredient_synonyms_search_name_trgm_idx',
  'synonym fuzzy search index exists'
);
select has_index(
  'public',
  'recipe_images',
  'recipe_images_primary_idx',
  'one primary image index exists'
);

select results_eq(
  $$ select public.normalize_search_term('  Crème brûlée  ') $$,
  array['creme brulee']::text[],
  'French search ignores accents and case'
);

select is(
  (select count(*) from public.allergens where eu_mandatory),
  14::bigint,
  'the 14 mandatory EU allergens are seeded'
);
select is(
  (select count(*) from public.equipment),
  4::bigint,
  'minimal equipment catalog is seeded'
);
select is(
  (
    select contains_alcohol
    from public.ingredients
    where slug = 'vin-blanc'
  ),
  true,
  'alcohol is represented by structured data'
);
select is(
  (select count(*) from public.recipe_categories),
  2::bigint,
  'MVP meal categories are seeded'
);
select is(
  (select count(*) from public.recipe_tags),
  4::bigint,
  'initial recipe tags are seeded'
);

select ok(
  (
    select bool_and(c.relrowsecurity)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname in (
        'profiles',
        'culinary_preferences',
        'cuisine_preferences',
        'user_equipment',
        'duration_preferences',
        'budget_preferences',
        'user_food_constraints'
      )
  ),
  'RLS is enabled on every user-owned table'
);

select ok(
  (
    select count(*) = 10
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'culinary_preferences',
        'cuisine_preferences',
        'user_equipment',
        'duration_preferences',
        'budget_preferences',
        'user_food_constraints'
      )
  ),
  'owner policies cover every user-owned table'
);

select has_function(
  'app_private',
  'is_recipe_visible',
  array['uuid'],
  'recipe visibility is centralized'
);

select is(
  (
    select string_agg(enumlabel::text, ',' order by e.enumsortorder)
    from pg_catalog.pg_enum e
    join pg_catalog.pg_type t on t.oid = e.enumtypid
    where t.typname = 'food_constraint_kind'
  ),
  'allergy,intolerance,strict_exclusion,negative_preference',
  'strict constraints and dislike are distinct'
);

select is(
  (
    select string_agg(enumlabel::text, ',' order by e.enumsortorder)
    from pg_catalog.pg_enum e
    join pg_catalog.pg_type t on t.oid = e.enumtypid
    where t.typname = 'recipe_origin'
  ),
  'editorial,ai_generated,user',
  'recipe provenance is normalized'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
  ),
  'profiles are linked to auth users'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.user_food_constraints'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%num_nonnulls%'
  ),
  'a constraint targets exactly one ingredient or allergen'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recipe_versions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%ai_generated%'
  ),
  'AI recipes require traceable provenance'
);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  (
    '90000000-0000-4000-8000-000000000001',
    'alice@example.test',
    'authenticated',
    'authenticated',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    'bob@example.test',
    'authenticated',
    'authenticated',
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into public.profiles (
  id,
  first_name,
  last_name,
  birth_date
)
values
  (
    '90000000-0000-4000-8000-000000000001',
    'Alice',
    'Test',
    '1990-01-01'
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    'Bob',
    'Test',
    '1990-01-01'
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '90000000-0000-4000-8000-000000000001',
  true
);

select results_eq(
  $$ select first_name from public.profiles order by first_name $$,
  array['Alice']::text[],
  'an authenticated user only reads their profile'
);

select is_empty(
  $$
    update public.profiles
    set first_name = 'Intrusion'
    where id = '90000000-0000-4000-8000-000000000002'
    returning id
  $$,
  'an authenticated user cannot update another profile'
);

select isnt_empty(
  $$
    update public.profiles
    set first_name = 'Alicia'
    where id = '90000000-0000-4000-8000-000000000001'
    returning id
  $$,
  'an authenticated user can update their profile'
);

reset role;

set local role anon;
select throws_ok(
  $$ select id from public.profiles $$,
  '42501',
  'permission denied for table profiles',
  'an anonymous session is denied access to profiles'
);
reset role;

select * from finish();
rollback;
