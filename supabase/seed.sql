-- Données strictement locales, déterministes et sans information personnelle.

insert into app_private.seed_metadata (key, value)
values (
  'baseline',
  '{"fixture":"local-only","version":2}'::jsonb
)
on conflict (key) do update
set value = excluded.value;

insert into public.equipment (id, code, name_fr)
values
  ('10000000-0000-4000-8000-000000000001', 'oven', 'Four'),
  ('10000000-0000-4000-8000-000000000002', 'microwave', 'Micro-ondes'),
  ('10000000-0000-4000-8000-000000000003', 'blender', 'Mixeur'),
  ('10000000-0000-4000-8000-000000000004', 'air_fryer', 'Air fryer')
on conflict (id) do update
set code = excluded.code, name_fr = excluded.name_fr;

insert into public.ingredient_families (id, code, name_fr)
values
  ('20000000-0000-4000-8000-000000000001', 'legumes', 'Légumineuses'),
  ('20000000-0000-4000-8000-000000000002', 'nuts', 'Fruits à coque'),
  ('20000000-0000-4000-8000-000000000003', 'dairy', 'Produits laitiers'),
  ('20000000-0000-4000-8000-000000000004', 'cereals', 'Céréales')
on conflict (id) do update
set code = excluded.code, name_fr = excluded.name_fr;

insert into public.ingredients (
  id,
  family_id,
  slug,
  name_fr,
  contains_alcohol
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'pois-chiche',
    'Pois chiche',
    false
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'cacahuete',
    'Cacahuète',
    false
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'lait-de-vache',
    'Lait de vache',
    false
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000004',
    'ble',
    'Blé',
    false
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    null,
    'vin-blanc',
    'Vin blanc',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000002',
    'beurre-de-cacahuete',
    'Beurre de cacahuète',
    false
  )
on conflict (id) do update
set
  family_id = excluded.family_id,
  slug = excluded.slug,
  name_fr = excluded.name_fr,
  contains_alcohol = excluded.contains_alcohol;

insert into public.ingredient_synonyms (id, ingredient_id, name_fr)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Pois chiches'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    'Arachide'
  )
on conflict (id) do update
set ingredient_id = excluded.ingredient_id, name_fr = excluded.name_fr;

insert into public.ingredient_relations (
  parent_ingredient_id,
  child_ingredient_id,
  kind
)
values (
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000006',
  'derived_from'
)
on conflict (parent_ingredient_id, child_ingredient_id, kind) do nothing;

insert into public.allergens (id, code, name_fr, eu_mandatory)
values
  ('50000000-0000-4000-8000-000000000001', 'gluten', 'Gluten', true),
  ('50000000-0000-4000-8000-000000000002', 'peanuts', 'Arachides', true),
  ('50000000-0000-4000-8000-000000000003', 'milk', 'Lait', true),
  ('50000000-0000-4000-8000-000000000004', 'eggs', 'Œufs', true),
  ('50000000-0000-4000-8000-000000000005', 'fish', 'Poissons', true),
  ('50000000-0000-4000-8000-000000000006', 'crustaceans', 'Crustacés', true),
  ('50000000-0000-4000-8000-000000000007', 'soybeans', 'Soja', true),
  ('50000000-0000-4000-8000-000000000008', 'tree_nuts', 'Fruits à coque', true),
  ('50000000-0000-4000-8000-000000000009', 'celery', 'Céleri', true),
  ('50000000-0000-4000-8000-000000000010', 'mustard', 'Moutarde', true),
  ('50000000-0000-4000-8000-000000000011', 'sesame', 'Graines de sésame', true),
  ('50000000-0000-4000-8000-000000000012', 'sulphites', 'Sulfites', true),
  ('50000000-0000-4000-8000-000000000013', 'lupin', 'Lupin', true),
  ('50000000-0000-4000-8000-000000000014', 'molluscs', 'Mollusques', true)
on conflict (id) do update
set code = excluded.code, name_fr = excluded.name_fr, eu_mandatory = true;

insert into public.ingredient_allergens (ingredient_id, allergen_id, relation)
values
  (
    '30000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000002',
    'contains'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000003',
    'contains'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000001',
    'contains'
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    '50000000-0000-4000-8000-000000000002',
    'derived_from'
  )
on conflict (ingredient_id, allergen_id) do update
set relation = excluded.relation;

insert into public.recipe_categories (id, slug, name_fr)
values
  ('60000000-0000-4000-8000-000000000001', 'dejeuner', 'Déjeuner'),
  ('60000000-0000-4000-8000-000000000002', 'diner', 'Dîner')
on conflict (id) do update
set slug = excluded.slug, name_fr = excluded.name_fr;

insert into public.recipe_tags (id, slug, name_fr)
values
  ('70000000-0000-4000-8000-000000000001', 'rapide', 'Rapide'),
  ('70000000-0000-4000-8000-000000000002', 'vegetarien', 'Végétarien'),
  ('70000000-0000-4000-8000-000000000003', 'riche-en-proteines', 'Riche en protéines'),
  ('70000000-0000-4000-8000-000000000004', 'economique', 'Économique')
on conflict (id) do update
set slug = excluded.slug, name_fr = excluded.name_fr;
