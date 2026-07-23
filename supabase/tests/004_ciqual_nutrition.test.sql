begin;

select plan(46);

select has_table('public', 'nutrition_source_versions', 'nutrition sources are versioned');
select has_table('public', 'ciqual_foods', 'Ciqual foods are stored');
select has_table('public', 'ciqual_constituents', 'Ciqual constituent metadata is stored');
select has_table('public', 'ciqual_nutrient_values', 'Ciqual values preserve source semantics');
select has_table('public', 'ingredient_ciqual_mappings', 'internal ingredients are mapped explicitly');
select has_table('public', 'ingredient_unit_conversions', 'sourced unit conversions have a dedicated table');

select is(
  (select count(*) from public.nutrition_source_versions where is_current),
  1::bigint,
  'one nutrition source is current'
);
select is(
  (select source_sha256 from public.nutrition_source_versions where id = 'ciqual-2025-11-03'),
  'd2082938522d909119fbdc8772c028017163650dd81e31d13fdb8a8bd702f32e',
  'official source integrity is pinned'
);
select is(
  (select license_name from public.nutrition_source_versions where id = 'ciqual-2025-11-03'),
  'Licence Ouverte / Open Licence 2.0',
  'open licence attribution is recorded'
);

select is(
  (select count(*) from public.ciqual_foods where source_version_id = 'ciqual-2025-11-03'),
  3484::bigint,
  'the complete 2025 food catalog is imported'
);
select is(
  (
    select count(distinct code)
    from public.ciqual_foods
    where source_version_id = 'ciqual-2025-11-03'
  ),
  3484::bigint,
  'Ciqual food codes are unique'
);
select is(
  (select count(*) from public.ciqual_constituents where source_version_id = 'ciqual-2025-11-03'),
  6::bigint,
  'only the six displayed nutrients are materialized'
);
select is(
  (select count(*) from public.ciqual_nutrient_values where source_version_id = 'ciqual-2025-11-03'),
  20904::bigint,
  'all selected values are imported for every food'
);
select is(
  (
    select count(distinct food_code || ':' || constituent_code)
    from public.ciqual_nutrient_values
    where source_version_id = 'ciqual-2025-11-03'
  ),
  20904::bigint,
  'no nutrient value is duplicated'
);

select ok(
  (select count(*) > 19000 from public.ciqual_nutrient_values where value_status = 'exact'),
  'numeric values are parsed'
);
select ok(
  (select count(*) > 400 from public.ciqual_nutrient_values where value_status = 'less_than'),
  'upper bounds remain explicit'
);
select ok(
  (select count(*) > 100 from public.ciqual_nutrient_values where value_status = 'trace'),
  'traces remain qualitative'
);
select ok(
  (select count(*) > 400 from public.ciqual_nutrient_values where value_status = 'missing'),
  'missing values remain explicit'
);
select is(
  (select count(*) from public.ciqual_nutrient_values where value_status = 'unparsed'),
  0::bigint,
  'the selected source values are fully understood'
);

select is(
  (
    select name_fr
    from public.ciqual_foods
    where source_version_id = 'ciqual-2025-11-03' and code = '20385'
  ),
  'Tomate sans précision, crue (aliment moyen)',
  'known tomato reference is present'
);
select is(
  (
    select numeric_value
    from public.ciqual_nutrient_values
    where source_version_id = 'ciqual-2025-11-03'
      and food_code = '22000'
      and constituent_code = '328'
  ),
  140.000000::numeric,
  'known egg energy value is imported'
);
select is(
  (
    select numeric_value
    from public.ciqual_nutrient_values
    where source_version_id = 'ciqual-2025-11-03'
      and food_code = '12120'
      and constituent_code = '25000'
  ),
  31.100000::numeric,
  'known parmesan protein value is imported'
);
select is(
  (
    select value_status
    from public.ciqual_nutrient_values
    where source_version_id = 'ciqual-2025-11-03'
      and food_code = '20385'
      and constituent_code = '10004'
  ),
  'less_than'::public.ciqual_value_status,
  'a tomato upper bound is not fabricated as a number'
);

select is(
  (select count(*) from public.ingredient_ciqual_mappings where source_version_id = 'ciqual-2025-11-03'),
  20::bigint,
  'all benchmark ingredients have an explicit mapping decision'
);
select is(
  (select count(*) from public.ingredient_ciqual_mappings where status = 'unmatched'),
  0::bigint,
  'the current benchmark has no unmatched ingredient'
);
select ok(
  (select count(*) > 0 from public.ingredient_ciqual_mappings where status = 'exact'),
  'exact mappings are distinguished'
);
select ok(
  (select count(*) > 0 from public.ingredient_ciqual_mappings where status = 'approximate'),
  'approximate mappings expose uncertainty'
);
select is(
  (select count(*) from public.ingredients where ciqual_code is not null),
  20::bigint,
  'canonical ingredients expose their active Ciqual code'
);
select is(
  (
    select count(*)
    from public.ingredient_ciqual_mappings mapping
    left join public.ciqual_foods food
      on food.source_version_id = mapping.source_version_id
      and food.code = mapping.food_code
    where mapping.food_code is not null and food.code is null
  ),
  0::bigint,
  'every mapping targets a real source food'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.nutrition_source_versions'::regclass),
  true,
  'nutrition source RLS is enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.ciqual_foods'::regclass),
  true,
  'Ciqual food RLS is enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.ciqual_constituents'::regclass),
  true,
  'constituent RLS is enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.ciqual_nutrient_values'::regclass),
  true,
  'nutrient value RLS is enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.ingredient_ciqual_mappings'::regclass),
  true,
  'mapping RLS is enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.ingredient_unit_conversions'::regclass),
  true,
  'unit conversion RLS is enabled'
);

select ok(
  has_table_privilege('anon', 'public.nutrition_source_versions', 'select'),
  'anonymous clients may read source attribution'
);
select ok(
  not has_table_privilege('anon', 'public.nutrition_source_versions', 'insert'),
  'anonymous clients cannot alter source versions'
);
select ok(
  has_table_privilege('authenticated', 'public.ciqual_nutrient_values', 'select'),
  'authenticated clients may read displayed nutrition'
);
select ok(
  not has_table_privilege('authenticated', 'public.ciqual_nutrient_values', 'insert'),
  'authenticated clients cannot alter nutrition values'
);
select ok(
  not has_table_privilege('authenticated', 'public.ingredient_unit_conversions', 'insert'),
  'authenticated clients cannot invent unit conversions'
);
select is(
  (select count(*) from public.ciqual_constituents where not displayed),
  0::bigint,
  'only explicitly displayed constituents are imported'
);
select matches(
  (select attribution from public.nutrition_source_versions where id = 'ciqual-2025-11-03'),
  'Anses',
  'source attribution names Anses'
);
select is(
  (select doi from public.nutrition_source_versions where id = 'ciqual-2025-11-03'),
  '10.57745/RDMHWY',
  'official DOI is recorded'
);
select is(
  (
    select confidence
    from public.ingredient_ciqual_mappings mapping
    join public.ingredients ingredient on ingredient.id = mapping.ingredient_id
    where ingredient.slug = 'parmesan' and mapping.source_version_id = 'ciqual-2025-11-03'
  ),
  1.000::numeric,
  'known exact mapping has full confidence'
);
select is(
  (
    select food_code
    from public.ingredient_ciqual_mappings mapping
    join public.ingredients ingredient on ingredient.id = mapping.ingredient_id
    where ingredient.slug = 'vin-blanc' and mapping.source_version_id = 'ciqual-2025-11-03'
  ),
  '5215',
  'known wine mapping is stable'
);
select ok(
  (
    select bool_and(
      (status = 'unmatched' and food_code is null and confidence = 0)
      or (status <> 'unmatched' and food_code is not null and confidence > 0)
    )
    from public.ingredient_ciqual_mappings
  ),
  'unmatched and mapped decisions remain structurally distinct'
);

select * from finish();
rollback;
