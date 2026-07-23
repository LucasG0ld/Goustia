-- P12-P14: profils, référentiel alimentaire et catalogue de recettes.

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type public.nutrition_goal as enum (
  'weight_loss',
  'balanced',
  'muscle_gain',
  'no_specific_goal'
);
create type public.onboarding_status as enum (
  'account_created',
  'food_safety_completed',
  'goals_completed',
  'initial_tastes_completed',
  'completed'
);
create type public.dietary_pattern as enum (
  'omnivore',
  'vegetarian',
  'vegan',
  'pescatarian',
  'pork_free',
  'other'
);
create type public.cooking_skill as enum ('beginner', 'intermediate', 'advanced');
create type public.budget_level as enum ('low', 'moderate', 'flexible');
create type public.preference_signal as enum ('liked', 'disliked');
create type public.food_constraint_kind as enum (
  'allergy',
  'intolerance',
  'strict_exclusion',
  'negative_preference'
);
create type public.constraint_severity as enum (
  'none',
  'mild',
  'moderate',
  'severe',
  'life_threatening'
);
create type public.ingredient_relation_kind as enum ('derived_from', 'contains');
create type public.recipe_difficulty as enum ('easy', 'medium', 'advanced');
create type public.recipe_cost_level as enum ('low', 'moderate', 'high');
create type public.recipe_origin as enum ('editorial', 'ai_generated', 'user');
create type public.recipe_validation_status as enum (
  'draft',
  'pending',
  'validated',
  'rejected'
);
create type public.recipe_publication_status as enum (
  'private',
  'unlisted',
  'published',
  'archived'
);
create type public.recipe_image_status as enum (
  'pending',
  'generating',
  'ready',
  'failed',
  'rejected'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.normalize_search_term(value text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent', trim(value)));
$$;

comment on function public.normalize_search_term(text) is
  'Normalise le français pour une recherche insensible à la casse et aux accents.';

-- Profils et préférences progressives.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  birth_date date not null,
  nutrition_goal public.nutrition_goal not null default 'no_specific_goal',
  meals_per_week smallint not null default 7 check (meals_per_week between 1 and 14),
  servings_per_meal smallint not null default 2 check (servings_per_meal between 1 and 8),
  onboarding_status public.onboarding_status not null default 'account_created',
  onboarding_completed_at timestamptz,
  country_code text not null default 'FR' check (country_code = 'FR'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    birth_date <=
    (
      (created_at at time zone 'utc')::date - interval '18 years'
    )::date
  ),
  check (
    (onboarding_status = 'completed' and onboarding_completed_at is not null)
    or onboarding_status <> 'completed'
  )
);

comment on table public.profiles is
  'Profil minimal du MVP, lié un-à-un au compte Supabase Auth.';
comment on column public.profiles.birth_date is
  'Date sans heure, précision minimale nécessaire au contrôle d’âge.';

create table public.culinary_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  dietary_pattern public.dietary_pattern,
  cooking_skill public.cooking_skill,
  other_diet_label text check (
    other_diet_label is null
    or char_length(trim(other_diet_label)) between 1 and 100
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    dietary_pattern = 'other'
    or other_diet_label is null
  )
);

create table public.cuisine_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  cuisine_code text not null check (
    cuisine_code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
  ),
  signal public.preference_signal not null,
  learned_from text not null default 'explicit' check (
    learned_from in ('explicit', 'interaction', 'inferred')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, cuisine_code)
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.user_equipment (
  user_id uuid not null references public.profiles (id) on delete cascade,
  equipment_id uuid not null references public.equipment (id) on delete restrict,
  available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, equipment_id)
);

create table public.duration_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  max_preparation_minutes smallint check (
    max_preparation_minutes between 5 and 480
  ),
  max_cooking_minutes smallint check (max_cooking_minutes between 0 and 720),
  max_total_minutes smallint check (max_total_minutes between 5 and 720),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    max_total_minutes is null
    or coalesce(max_preparation_minutes, 0) + coalesce(max_cooking_minutes, 0)
      <= max_total_minutes
  )
);

create table public.budget_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  level public.budget_level not null,
  max_cost_per_serving_eur numeric(6, 2) check (
    max_cost_per_serving_eur between 0.50 and 500
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Ingrédients, allergènes et contraintes.

create table public.ingredient_families (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.ingredient_families (id) on delete set null,
  parent_ingredient_id uuid references public.ingredients (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 160),
  search_name text generated always as (
    public.normalize_search_term(name_fr)
  ) stored,
  ciqual_code text unique,
  contains_alcohol boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (parent_ingredient_id is null or parent_ingredient_id <> id)
);

create table public.ingredient_synonyms (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  name_fr text not null check (char_length(trim(name_fr)) between 1 and 160),
  search_name text generated always as (
    public.normalize_search_term(name_fr)
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  unique (ingredient_id, search_name)
);

create table public.ingredient_relations (
  parent_ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  child_ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  kind public.ingredient_relation_kind not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (parent_ingredient_id, child_ingredient_id, kind),
  check (parent_ingredient_id <> child_ingredient_id)
);

create table public.allergens (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 100),
  eu_mandatory boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ingredient_allergens (
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  allergen_id uuid not null references public.allergens (id) on delete restrict,
  relation text not null default 'contains' check (
    relation in ('contains', 'may_contain', 'derived_from')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (ingredient_id, allergen_id)
);

create table public.user_food_constraints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ingredient_id uuid references public.ingredients (id) on delete restrict,
  allergen_id uuid references public.allergens (id) on delete restrict,
  kind public.food_constraint_kind not null,
  severity public.constraint_severity not null default 'none',
  is_absolute boolean not null,
  note text check (note is null or char_length(trim(note)) between 1 and 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (num_nonnulls(ingredient_id, allergen_id) = 1),
  check (
    (kind in ('allergy', 'strict_exclusion') and is_absolute)
    or kind = 'intolerance'
    or (kind = 'negative_preference' and not is_absolute)
  ),
  check (
    kind <> 'negative_preference'
    or severity in ('none', 'mild')
  )
);

-- Recettes versionnées et nutrition calculée.

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  canonical_slug text not null unique check (
    canonical_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  deduplication_hash text not null unique check (
    deduplication_hash ~ '^[a-f0-9]{64}$'
  ),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  title text not null check (char_length(trim(title)) between 3 and 180),
  description text not null check (
    char_length(trim(description)) between 10 and 2000
  ),
  servings smallint not null check (servings between 1 and 8),
  preparation_minutes smallint not null check (preparation_minutes between 0 and 480),
  cooking_minutes smallint not null check (cooking_minutes between 0 and 720),
  resting_minutes smallint not null default 0 check (resting_minutes between 0 and 720),
  difficulty public.recipe_difficulty not null,
  cost_level public.recipe_cost_level,
  estimated_cost_eur numeric(8, 2) check (estimated_cost_eur between 0 and 10000),
  origin public.recipe_origin not null,
  ai_provider text,
  ai_model text,
  prompt_version text,
  validation_status public.recipe_validation_status not null default 'draft',
  publication_status public.recipe_publication_status not null default 'private',
  validation_notes text,
  validated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (recipe_id, version_number),
  check (
    origin <> 'ai_generated'
    or (
      nullif(trim(ai_provider), '') is not null
      and nullif(trim(ai_model), '') is not null
      and nullif(trim(prompt_version), '') is not null
    )
  ),
  check (
    validation_status <> 'validated'
    or validated_at is not null
  ),
  check (
    publication_status <> 'published'
    or (
      validation_status = 'validated'
      and published_at is not null
    )
  )
);

create table public.recipe_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.recipe_category_assignments (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  category_id uuid not null references public.recipe_categories (id) on delete restrict,
  primary key (recipe_id, category_id)
);

create table public.recipe_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_fr text not null unique check (char_length(trim(name_fr)) between 1 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.recipe_tag_assignments (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  tag_id uuid not null references public.recipe_tags (id) on delete restrict,
  primary key (recipe_id, tag_id)
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references public.recipe_versions (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  position smallint not null check (position > 0),
  quantity numeric(10, 3) check (quantity > 0),
  unit text check (
    unit is null
    or unit in (
      'g', 'kg', 'ml', 'l', 'piece', 'teaspoon', 'tablespoon',
      'pinch', 'bunch', 'slice', 'clove', 'to_taste'
    )
  ),
  preparation_note text check (
    preparation_note is null
    or char_length(trim(preparation_note)) between 1 and 300
  ),
  optional boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (recipe_version_id, position)
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references public.recipe_versions (id) on delete cascade,
  position smallint not null check (position > 0),
  instruction text not null check (
    char_length(trim(instruction)) between 3 and 3000
  ),
  timer_seconds integer check (timer_seconds between 1 and 86400),
  created_at timestamptz not null default timezone('utc', now()),
  unique (recipe_version_id, position)
);

create table public.recipe_nutrition (
  recipe_version_id uuid primary key references public.recipe_versions (id) on delete cascade,
  source text not null default 'ciqual' check (source in ('ciqual', 'manual')),
  source_version text not null,
  calories_kcal numeric(8, 2) not null check (calories_kcal >= 0),
  protein_g numeric(8, 2) not null check (protein_g >= 0),
  carbohydrates_g numeric(8, 2) not null check (carbohydrates_g >= 0),
  fat_g numeric(8, 2) not null check (fat_g >= 0),
  fiber_g numeric(8, 2) check (fiber_g >= 0),
  salt_g numeric(8, 3) check (salt_g >= 0),
  tolerance_percent numeric(5, 2) not null default 10 check (
    tolerance_percent between 0 and 100
  ),
  calculated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references public.recipe_versions (id) on delete cascade,
  storage_bucket text not null default 'recipe-images',
  storage_path text,
  alt_text text check (
    alt_text is null
    or char_length(trim(alt_text)) between 1 and 300
  ),
  status public.recipe_image_status not null default 'pending',
  is_primary boolean not null default false,
  provider text,
  model text,
  prompt_version text,
  width integer check (width between 1 and 8192),
  height integer check (height between 1 and 8192),
  failure_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    status <> 'ready'
    or (
      nullif(trim(storage_path), '') is not null
      and nullif(trim(alt_text), '') is not null
    )
  )
);

create or replace function app_private.is_recipe_visible(recipe_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.recipes r
    where r.id = recipe_uuid
      and (
        r.created_by = auth.uid()
        or exists (
          select 1
          from public.recipe_versions rv
          where rv.recipe_id = r.id
            and rv.publication_status = 'published'
            and rv.validation_status = 'validated'
        )
      )
  );
$$;

revoke all on function app_private.is_recipe_visible(uuid) from public;
grant usage on schema app_private to anon, authenticated;
grant execute on function app_private.is_recipe_visible(uuid) to anon, authenticated;

-- Index de recherche, relations et politiques.

create index profiles_onboarding_status_idx
  on public.profiles (onboarding_status);
create index cuisine_preferences_user_signal_idx
  on public.cuisine_preferences (user_id, signal);
create index ingredients_family_id_idx on public.ingredients (family_id);
create index ingredients_parent_id_idx on public.ingredients (parent_ingredient_id);
create index ingredients_search_name_trgm_idx
  on public.ingredients using gin (search_name extensions.gin_trgm_ops);
create index ingredient_synonyms_ingredient_id_idx
  on public.ingredient_synonyms (ingredient_id);
create index ingredient_synonyms_search_name_trgm_idx
  on public.ingredient_synonyms using gin (search_name extensions.gin_trgm_ops);
create index ingredient_relations_child_idx
  on public.ingredient_relations (child_ingredient_id);
create index ingredient_allergens_allergen_idx
  on public.ingredient_allergens (allergen_id);
create index user_food_constraints_user_idx
  on public.user_food_constraints (user_id);
create unique index user_food_constraints_unique_idx
  on public.user_food_constraints (
    user_id,
    coalesce(ingredient_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(allergen_id, '00000000-0000-0000-0000-000000000000'::uuid),
    kind
  );
create index recipes_created_by_idx on public.recipes (created_by);
create index recipe_versions_recipe_status_idx
  on public.recipe_versions (recipe_id, publication_status, version_number desc);
create index recipe_versions_published_idx
  on public.recipe_versions (published_at desc)
  where publication_status = 'published';
create index recipe_category_assignments_category_idx
  on public.recipe_category_assignments (category_id);
create index recipe_tag_assignments_tag_idx
  on public.recipe_tag_assignments (tag_id);
create index recipe_ingredients_version_idx
  on public.recipe_ingredients (recipe_version_id);
create index recipe_ingredients_ingredient_idx
  on public.recipe_ingredients (ingredient_id);
create index recipe_steps_version_idx on public.recipe_steps (recipe_version_id);
create index recipe_images_version_idx on public.recipe_images (recipe_version_id);
create unique index recipe_images_primary_idx
  on public.recipe_images (recipe_version_id)
  where is_primary;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger culinary_preferences_set_updated_at
before update on public.culinary_preferences
for each row execute function public.set_updated_at();
create trigger cuisine_preferences_set_updated_at
before update on public.cuisine_preferences
for each row execute function public.set_updated_at();
create trigger user_equipment_set_updated_at
before update on public.user_equipment
for each row execute function public.set_updated_at();
create trigger duration_preferences_set_updated_at
before update on public.duration_preferences
for each row execute function public.set_updated_at();
create trigger budget_preferences_set_updated_at
before update on public.budget_preferences
for each row execute function public.set_updated_at();
create trigger ingredients_set_updated_at
before update on public.ingredients
for each row execute function public.set_updated_at();
create trigger user_food_constraints_set_updated_at
before update on public.user_food_constraints
for each row execute function public.set_updated_at();
create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();
create trigger recipe_versions_set_updated_at
before update on public.recipe_versions
for each row execute function public.set_updated_at();
create trigger recipe_nutrition_set_updated_at
before update on public.recipe_nutrition
for each row execute function public.set_updated_at();
create trigger recipe_images_set_updated_at
before update on public.recipe_images
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.culinary_preferences enable row level security;
alter table public.cuisine_preferences enable row level security;
alter table public.equipment enable row level security;
alter table public.user_equipment enable row level security;
alter table public.duration_preferences enable row level security;
alter table public.budget_preferences enable row level security;
alter table public.ingredient_families enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_synonyms enable row level security;
alter table public.ingredient_relations enable row level security;
alter table public.allergens enable row level security;
alter table public.ingredient_allergens enable row level security;
alter table public.user_food_constraints enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_versions enable row level security;
alter table public.recipe_categories enable row level security;
alter table public.recipe_category_assignments enable row level security;
alter table public.recipe_tags enable row level security;
alter table public.recipe_tag_assignments enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_nutrition enable row level security;
alter table public.recipe_images enable row level security;

create policy "users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "users insert own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
create policy "users delete own profile"
on public.profiles for delete to authenticated
using ((select auth.uid()) = id);

create policy "users manage own culinary preferences"
on public.culinary_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own cuisine preferences"
on public.cuisine_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own equipment"
on public.user_equipment for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own duration preferences"
on public.duration_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own budget preferences"
on public.budget_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users manage own food constraints"
on public.user_food_constraints for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "catalog equipment is readable"
on public.equipment for select to anon, authenticated using (true);
create policy "catalog families are readable"
on public.ingredient_families for select to anon, authenticated using (true);
create policy "catalog ingredients are readable"
on public.ingredients for select to anon, authenticated using (is_active);
create policy "catalog synonyms are readable"
on public.ingredient_synonyms for select to anon, authenticated using (true);
create policy "catalog ingredient relations are readable"
on public.ingredient_relations for select to anon, authenticated using (true);
create policy "catalog allergens are readable"
on public.allergens for select to anon, authenticated using (true);
create policy "catalog ingredient allergens are readable"
on public.ingredient_allergens for select to anon, authenticated using (true);
create policy "catalog recipe categories are readable"
on public.recipe_categories for select to anon, authenticated using (true);
create policy "catalog recipe tags are readable"
on public.recipe_tags for select to anon, authenticated using (true);

create policy "published or owned recipes are readable"
on public.recipes for select to anon, authenticated
using (app_private.is_recipe_visible(id));
create policy "published or owned recipe versions are readable"
on public.recipe_versions for select to anon, authenticated
using (app_private.is_recipe_visible(recipe_id));

create policy "visible recipe category assignments are readable"
on public.recipe_category_assignments for select to anon, authenticated
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_category_assignments.recipe_id
  )
);
create policy "visible recipe tag assignments are readable"
on public.recipe_tag_assignments for select to anon, authenticated
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_tag_assignments.recipe_id
  )
);
create policy "visible recipe ingredients are readable"
on public.recipe_ingredients for select to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_ingredients.recipe_version_id
  )
);
create policy "visible recipe steps are readable"
on public.recipe_steps for select to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_steps.recipe_version_id
  )
);
create policy "visible recipe nutrition is readable"
on public.recipe_nutrition for select to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_nutrition.recipe_version_id
  )
);
create policy "visible recipe images are readable"
on public.recipe_images for select to anon, authenticated
using (
  exists (
    select 1 from public.recipe_versions rv
    where rv.id = recipe_images.recipe_version_id
  )
);

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.culinary_preferences,
  public.cuisine_preferences,
  public.user_equipment,
  public.duration_preferences,
  public.budget_preferences,
  public.user_food_constraints
to authenticated;
grant select on
  public.equipment,
  public.ingredient_families,
  public.ingredients,
  public.ingredient_synonyms,
  public.ingredient_relations,
  public.allergens,
  public.ingredient_allergens,
  public.recipes,
  public.recipe_versions,
  public.recipe_categories,
  public.recipe_category_assignments,
  public.recipe_tags,
  public.recipe_tag_assignments,
  public.recipe_ingredients,
  public.recipe_steps,
  public.recipe_nutrition,
  public.recipe_images
to anon, authenticated;
grant execute on function public.normalize_search_term(text) to anon, authenticated;

comment on table public.user_food_constraints is
  'Contraintes strictes et signaux négatifs, distingués par kind et is_absolute.';
comment on table public.recipe_versions is
  'Contenu immuable par version avec provenance, validation et publication.';
comment on table public.recipe_nutrition is
  'Valeurs calculées par portion depuis une source structurée, jamais garanties par le LLM.';
comment on table public.recipe_images is
  'Illustrations de recette avec provenance et état de validation.';
