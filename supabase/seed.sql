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

-- Petit catalogue éditorial local, validé et déterministe pour les parcours.
insert into public.recipes (
  id, canonical_slug, deduplication_hash
)
values
  (
    '91000000-0000-4000-8000-000000000001',
    'pois-chiches-rotis',
    repeat('c', 64)
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    'galettes-pois-chiches',
    repeat('d', 64)
  )
on conflict (id) do update set canonical_slug = excluded.canonical_slug;

insert into public.recipe_versions (
  id, recipe_id, version_number, title, description, servings,
  preparation_minutes, cooking_minutes, difficulty, cost_level, origin,
  validation_status, publication_status, validation_notes,
  validated_at, published_at
)
values
  (
    '92000000-0000-4000-8000-000000000001',
    '91000000-0000-4000-8000-000000000001',
    1, 'Pois chiches rôtis aux épices',
    'Un plat éditorial simple à compléter avec des légumes de saison.',
    2, 10, 25, 'easy', 'low', 'editorial', 'validated', 'published',
    'Fixture éditoriale locale contrôlée : sans alcool, allergènes référencés.',
    timezone('utc', now()), timezone('utc', now())
  ),
  (
    '92000000-0000-4000-8000-000000000002',
    '91000000-0000-4000-8000-000000000002',
    1, 'Galettes de pois chiches',
    'Des galettes dorées et économiques pour un déjeuner rapide.',
    2, 15, 15, 'easy', 'low', 'editorial', 'validated', 'published',
    'Fixture éditoriale locale contrôlée : sans alcool, allergènes référencés.',
    timezone('utc', now()), timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  validation_status = excluded.validation_status,
  publication_status = excluded.publication_status;

insert into public.recipe_ingredients (
  id, recipe_version_id, ingredient_id, position, quantity, unit
)
values
  (
    '93000000-0000-4000-8000-000000000001',
    '92000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    1, 400, 'g'
  ),
  (
    '93000000-0000-4000-8000-000000000002',
    '92000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    1, 300, 'g'
  )
on conflict (id) do update set quantity = excluded.quantity;

insert into public.recipe_steps (
  id, recipe_version_id, position, instruction, timer_seconds
)
values
  (
    '94000000-0000-4000-8000-000000000001',
    '92000000-0000-4000-8000-000000000001',
    1, 'Égoutter les pois chiches et les répartir sur une plaque.', 300
  ),
  (
    '94000000-0000-4000-8000-000000000002',
    '92000000-0000-4000-8000-000000000001',
    2, 'Assaisonner puis cuire au four jusqu’à ce qu’ils soient dorés.', 1500
  ),
  (
    '94000000-0000-4000-8000-000000000003',
    '92000000-0000-4000-8000-000000000002',
    1, 'Écraser les pois chiches afin d’obtenir une pâte homogène.', 300
  ),
  (
    '94000000-0000-4000-8000-000000000004',
    '92000000-0000-4000-8000-000000000002',
    2, 'Former les galettes et les dorer à la poêle sur chaque face.', 900
  )
on conflict (id) do update set instruction = excluded.instruction;

insert into public.recipe_category_assignments (recipe_id, category_id)
values
  (
    '91000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000002'
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000001'
  )
on conflict do nothing;

insert into public.recipe_tags (id, slug, name_fr)
values
  ('70000000-0000-4000-8000-000000000001', 'rapide', 'Rapide'),
  ('70000000-0000-4000-8000-000000000002', 'vegetarien', 'Végétarien'),
  ('70000000-0000-4000-8000-000000000003', 'riche-en-proteines', 'Riche en protéines'),
  ('70000000-0000-4000-8000-000000000004', 'economique', 'Économique')
on conflict (id) do update
set slug = excluded.slug, name_fr = excluded.name_fr;

insert into public.recipe_tag_assignments (recipe_id, tag_id)
values
  (
    '91000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000002'
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    '70000000-0000-4000-8000-000000000004'
  )
on conflict do nothing;
