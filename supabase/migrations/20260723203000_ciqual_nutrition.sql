-- P25 — Référentiel nutritionnel ANSES-Ciqual 2025.

create type public.ciqual_value_status as enum (
  'exact',
  'less_than',
  'trace',
  'missing',
  'unparsed'
);

create type public.ciqual_mapping_status as enum (
  'exact',
  'approximate',
  'unmatched'
);

create table public.nutrition_source_versions (
  id text primary key check (id ~ '^ciqual-[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  documentation_url text not null check (documentation_url ~ '^https://'),
  doi text not null,
  license_name text not null,
  attribution text not null,
  source_sha256 text not null unique check (source_sha256 ~ '^[a-f0-9]{64}$'),
  published_on date not null,
  imported_at timestamptz not null default timezone('utc', now()),
  is_current boolean not null default false
);

create unique index nutrition_source_versions_one_current_idx
  on public.nutrition_source_versions (is_current)
  where is_current;

create table public.ciqual_foods (
  source_version_id text not null references public.nutrition_source_versions (id) on delete restrict,
  code text not null check (code ~ '^[0-9]+$'),
  name_fr text not null check (char_length(trim(name_fr)) between 1 and 500),
  search_name text generated always as (
    public.normalize_search_term(name_fr)
  ) stored,
  scientific_name text,
  group_code text not null,
  subgroup_code text not null,
  subsubgroup_code text not null,
  group_name_fr text,
  subgroup_name_fr text,
  subsubgroup_name_fr text,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (source_version_id, code)
);

create index ciqual_foods_name_search_idx
  on public.ciqual_foods using gin (search_name extensions.gin_trgm_ops);

create table public.ciqual_constituents (
  source_version_id text not null references public.nutrition_source_versions (id) on delete restrict,
  code text not null,
  infoods_tag text,
  name_fr text not null check (char_length(trim(name_fr)) between 1 and 500),
  unit text not null check (unit in ('kcal', 'g')),
  source_column smallint not null check (source_column between 1 and 84),
  displayed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (source_version_id, code),
  unique (source_version_id, source_column)
);

create table public.ciqual_nutrient_values (
  source_version_id text not null,
  food_code text not null,
  constituent_code text not null,
  raw_value text not null,
  value_status public.ciqual_value_status not null,
  numeric_value numeric(14, 6),
  upper_bound numeric(14, 6),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (source_version_id, food_code, constituent_code),
  foreign key (source_version_id, food_code)
    references public.ciqual_foods (source_version_id, code)
    on delete cascade,
  foreign key (source_version_id, constituent_code)
    references public.ciqual_constituents (source_version_id, code)
    on delete cascade,
  check (
    (value_status = 'exact' and numeric_value is not null and upper_bound is null)
    or (value_status = 'less_than' and numeric_value is null and upper_bound is not null)
    or (value_status in ('trace', 'missing', 'unparsed') and numeric_value is null)
  )
);

create index ciqual_nutrient_values_food_idx
  on public.ciqual_nutrient_values (source_version_id, food_code);

create table public.ingredient_ciqual_mappings (
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  source_version_id text not null,
  food_code text,
  status public.ciqual_mapping_status not null,
  confidence numeric(4, 3) not null check (confidence between 0 and 1),
  rationale_fr text not null check (char_length(trim(rationale_fr)) between 3 and 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (ingredient_id, source_version_id),
  foreign key (source_version_id, food_code)
    references public.ciqual_foods (source_version_id, code)
    on delete restrict,
  check (
    (status = 'unmatched' and food_code is null and confidence = 0)
    or (status <> 'unmatched' and food_code is not null and confidence > 0)
  )
);

create table public.ingredient_unit_conversions (
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  unit text not null check (
    unit in ('ml', 'l', 'piece', 'teaspoon', 'tablespoon', 'pinch', 'bunch', 'slice', 'clove')
  ),
  density_g_per_ml numeric(10, 6),
  grams_per_unit numeric(10, 3),
  confidence numeric(4, 3) not null check (confidence between 0 and 1),
  source_reference text not null check (char_length(trim(source_reference)) between 3 and 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (ingredient_id, unit),
  check (
    (unit in ('ml', 'l') and density_g_per_ml > 0 and grams_per_unit is null)
    or (
      unit not in ('ml', 'l')
      and grams_per_unit > 0
      and density_g_per_ml is null
    )
  )
);

alter table public.nutrition_source_versions enable row level security;
alter table public.ciqual_foods enable row level security;
alter table public.ciqual_constituents enable row level security;
alter table public.ciqual_nutrient_values enable row level security;
alter table public.ingredient_ciqual_mappings enable row level security;
alter table public.ingredient_unit_conversions enable row level security;

create policy nutrition_sources_public_read
  on public.nutrition_source_versions for select
  to anon, authenticated
  using (true);

create policy ciqual_foods_public_read
  on public.ciqual_foods for select
  to anon, authenticated
  using (true);

create policy ciqual_constituents_public_read
  on public.ciqual_constituents for select
  to anon, authenticated
  using (displayed);

create policy ciqual_values_public_read
  on public.ciqual_nutrient_values for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.ciqual_constituents constituent
      where constituent.source_version_id = ciqual_nutrient_values.source_version_id
        and constituent.code = ciqual_nutrient_values.constituent_code
        and constituent.displayed
    )
  );

create policy ingredient_ciqual_mappings_public_read
  on public.ingredient_ciqual_mappings for select
  to anon, authenticated
  using (true);

create policy ingredient_unit_conversions_public_read
  on public.ingredient_unit_conversions for select
  to anon, authenticated
  using (true);

revoke all on table public.nutrition_source_versions from anon, authenticated;
revoke all on table public.ciqual_foods from anon, authenticated;
revoke all on table public.ciqual_constituents from anon, authenticated;
revoke all on table public.ciqual_nutrient_values from anon, authenticated;
revoke all on table public.ingredient_ciqual_mappings from anon, authenticated;
revoke all on table public.ingredient_unit_conversions from anon, authenticated;

grant select on table public.nutrition_source_versions to anon, authenticated;
grant select on table public.ciqual_foods to anon, authenticated;
grant select on table public.ciqual_constituents to anon, authenticated;
grant select on table public.ciqual_nutrient_values to anon, authenticated;
grant select on table public.ingredient_ciqual_mappings to anon, authenticated;
grant select on table public.ingredient_unit_conversions to anon, authenticated;

grant all on table public.nutrition_source_versions to service_role;
grant all on table public.ciqual_foods to service_role;
grant all on table public.ciqual_constituents to service_role;
grant all on table public.ciqual_nutrient_values to service_role;
grant all on table public.ingredient_ciqual_mappings to service_role;
grant all on table public.ingredient_unit_conversions to service_role;

create trigger ingredient_ciqual_mappings_set_updated_at
before update on public.ingredient_ciqual_mappings
for each row execute function public.set_updated_at();

create trigger ingredient_unit_conversions_set_updated_at
before update on public.ingredient_unit_conversions
for each row execute function public.set_updated_at();
