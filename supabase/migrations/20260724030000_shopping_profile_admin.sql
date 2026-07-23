-- P45-P49 : courses, éligibilité, administration et audit.

alter table public.shopping_lists
  add column plan_revision integer,
  add column revision integer not null default 1 check (revision > 0);

alter table public.shopping_list_items
  add column is_available boolean not null default false,
  add column revision integer not null default 1 check (revision > 0);

create unique index shopping_lists_user_plan_unique
  on public.shopping_lists (user_id, meal_plan_id)
  where meal_plan_id is not null;

create table public.shopping_list_item_sources (
  shopping_list_item_id uuid not null
    references public.shopping_list_items (id) on delete cascade,
  recipe_version_id uuid not null
    references public.recipe_versions (id) on delete cascade,
  primary key (shopping_list_item_id, recipe_version_id)
);

create table public.shopping_list_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  shopping_list_id uuid not null references public.shopping_lists (id) on delete cascade,
  action text not null check (
    action in ('generate', 'add', 'update', 'toggle', 'delete', 'reset')
  ),
  idempotency_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, idempotency_key)
);

create or replace function public.replace_generated_shopping_items(
  p_meal_plan_id uuid,
  p_plan_revision integer,
  p_items jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  plan_row public.meal_plans%rowtype;
  list_id uuid;
  item jsonb;
  inserted_item_id uuid;
  source_id text;
  existing_mutation uuid;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 500 then
    raise exception 'invalid shopping items' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(actor::text || ':shopping:' || p_meal_plan_id::text, 0)
  );
  select id into existing_mutation
  from public.shopping_list_mutations
  where user_id = actor and idempotency_key = p_idempotency_key;
  if existing_mutation is not null then
    select shopping_list_id into list_id
    from public.shopping_list_mutations where id = existing_mutation;
    return jsonb_build_object('id', list_id, 'replayed', true);
  end if;

  select * into plan_row from public.meal_plans
  where id = p_meal_plan_id and user_id = actor for update;
  if not found then
    raise exception 'meal plan not found' using errcode = 'P0002';
  end if;
  if plan_row.revision <> p_plan_revision then
    raise exception 'meal plan changed' using errcode = '40001';
  end if;

  insert into public.shopping_lists (
    user_id, meal_plan_id, title, status, idempotency_key, plan_revision
  )
  values (
    actor, plan_row.id, 'Courses - semaine du ' || plan_row.week_start::text,
    'active', p_idempotency_key, plan_row.revision
  )
  on conflict (user_id, meal_plan_id) where meal_plan_id is not null
  do update set
    status = 'active',
    plan_revision = excluded.plan_revision,
    revision = public.shopping_lists.revision + 1,
    updated_at = timezone('utc', now())
  returning id into list_id;

  delete from public.shopping_list_items
  where shopping_list_id = list_id
    and user_id = actor
    and ingredient_id is not null;

  for item in select value from jsonb_array_elements(p_items)
  loop
    if nullif(trim(item->>'ingredientId'), '') is null
       or nullif(trim(item->>'label'), '') is null
       or nullif(trim(item->>'aisle'), '') is null then
      raise exception 'invalid generated shopping item' using errcode = '22023';
    end if;
    insert into public.shopping_list_items (
      shopping_list_id, user_id, ingredient_id, quantity, unit, aisle
    )
    values (
      list_id, actor, (item->>'ingredientId')::uuid,
      nullif(item->>'quantity', '')::numeric,
      nullif(item->>'unit', ''),
      trim(item->>'aisle')
    )
    returning id into inserted_item_id;
    for source_id in
      select value #>> '{}'
      from jsonb_array_elements(item->'sourceRecipeVersionIds')
    loop
      insert into public.shopping_list_item_sources (
        shopping_list_item_id, recipe_version_id
      )
      values (inserted_item_id, source_id::uuid)
      on conflict do nothing;
    end loop;
  end loop;

  insert into public.shopping_list_mutations (
    user_id, shopping_list_id, action, idempotency_key
  )
  values (actor, list_id, 'generate', p_idempotency_key);
  return jsonb_build_object('id', list_id, 'replayed', false);
end;
$$;

create or replace function public.mutate_shopping_list(
  p_shopping_list_id uuid,
  p_action text,
  p_idempotency_key uuid,
  p_item_id uuid default null,
  p_manual_label text default null,
  p_quantity numeric default null,
  p_unit text default null,
  p_aisle text default null,
  p_checked boolean default null,
  p_available boolean default null,
  p_confirmation text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  list_row public.shopping_lists%rowtype;
  target_item public.shopping_list_items%rowtype;
  result_item_id uuid;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.shopping_list_mutations
    where user_id = actor and idempotency_key = p_idempotency_key
  ) then
    return jsonb_build_object('replayed', true);
  end if;
  select * into list_row from public.shopping_lists
  where id = p_shopping_list_id and user_id = actor for update;
  if not found then
    raise exception 'shopping list not found' using errcode = 'P0002';
  end if;

  if p_action = 'add' then
    if char_length(trim(coalesce(p_manual_label, ''))) not between 1 and 160
       or p_quantity is not null and p_quantity <= 0 then
      raise exception 'invalid manual item' using errcode = '22023';
    end if;
    insert into public.shopping_list_items (
      shopping_list_id, user_id, manual_label, quantity, unit, aisle
    )
    values (
      list_row.id, actor, trim(p_manual_label), p_quantity, p_unit,
      coalesce(nullif(trim(p_aisle), ''), 'Autres')
    )
    returning id into result_item_id;
  elsif p_action in ('update', 'toggle', 'delete') then
    select * into target_item from public.shopping_list_items
    where id = p_item_id and shopping_list_id = list_row.id and user_id = actor
    for update;
    if not found then
      raise exception 'shopping item not found' using errcode = 'P0002';
    end if;
    if p_action = 'delete' then
      delete from public.shopping_list_items where id = target_item.id;
      result_item_id := target_item.id;
    else
      update public.shopping_list_items
      set manual_label = case
            when target_item.manual_label is null then null
            else coalesce(nullif(trim(p_manual_label), ''), manual_label)
          end,
          quantity = coalesce(p_quantity, quantity),
          unit = coalesce(p_unit, unit),
          aisle = coalesce(nullif(trim(p_aisle), ''), aisle),
          checked_at = case
            when p_checked is null then checked_at
            when p_checked then coalesce(checked_at, timezone('utc', now()))
            else null
          end,
          is_available = coalesce(p_available, is_available),
          revision = revision + 1
      where id = target_item.id
      returning id into result_item_id;
    end if;
  elsif p_action = 'reset' then
    if p_confirmation <> 'REINITIALISER' then
      raise exception 'confirmation required' using errcode = '22023';
    end if;
    update public.shopping_list_items
    set checked_at = null, is_available = false, revision = revision + 1
    where shopping_list_id = list_row.id and user_id = actor;
  else
    raise exception 'unsupported shopping action' using errcode = '22023';
  end if;
  update public.shopping_lists
  set revision = revision + 1 where id = list_row.id;
  insert into public.shopping_list_mutations (
    user_id, shopping_list_id, action, idempotency_key
  )
  values (actor, list_row.id, p_action, p_idempotency_key);
  return jsonb_build_object(
    'itemId', result_item_id, 'replayed', false
  );
end;
$$;

-- Éligibilité recalculée après une contrainte stricte.

create table public.user_recipe_eligibility (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  eligible boolean not null,
  reason text check (
    reason is null or reason in ('ingredient', 'allergen', 'alcohol', 'withdrawn')
  ),
  checked_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, recipe_id)
);

create or replace function public.refresh_user_recipe_eligibility(
  p_user_id uuid default auth.uid()
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  affected integer;
begin
  if actor is null or (actor <> p_user_id and not app_private.is_admin()) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  delete from public.user_recipe_eligibility where user_id = p_user_id;
  with recursive latest_versions as (
    select distinct on (rv.recipe_id)
      rv.recipe_id, rv.id as recipe_version_id, rv.publication_status
    from public.recipe_versions rv
    join public.recipes r on r.id = rv.recipe_id
    where rv.validation_status = 'validated'
      and (rv.publication_status = 'published' or r.created_by = p_user_id)
    order by rv.recipe_id, rv.version_number desc
  ), ingredient_tree as (
    select
      lv.recipe_id, ri.ingredient_id, ri.ingredient_id as related_id
    from latest_versions lv
    join public.recipe_ingredients ri
      on ri.recipe_version_id = lv.recipe_version_id
    union
    select tree.recipe_id, tree.ingredient_id, rel.parent_ingredient_id
    from ingredient_tree tree
    join public.ingredient_relations rel
      on rel.child_ingredient_id = tree.related_id
  ), evaluation as (
    select
      lv.recipe_id,
      lv.publication_status,
      exists (
        select 1 from ingredient_tree tree
        join public.user_food_constraints constraint_row
          on constraint_row.user_id = p_user_id
         and constraint_row.is_absolute
         and constraint_row.ingredient_id = tree.related_id
        where tree.recipe_id = lv.recipe_id
      ) as blocked_ingredient,
      exists (
        select 1 from ingredient_tree tree
        join public.ingredient_allergens ia
          on ia.ingredient_id = tree.related_id
        join public.user_food_constraints constraint_row
          on constraint_row.user_id = p_user_id
         and constraint_row.is_absolute
         and constraint_row.allergen_id = ia.allergen_id
        where tree.recipe_id = lv.recipe_id
      ) as blocked_allergen,
      exists (
        select 1 from ingredient_tree tree
        join public.ingredients ingredient on ingredient.id = tree.related_id
        join public.profiles profile on profile.id = p_user_id
        where tree.recipe_id = lv.recipe_id
          and ingredient.contains_alcohol
          and profile.birth_date > (
            (timezone('utc', now()))::date - interval '18 years'
          )::date
      ) as blocked_alcohol
    from latest_versions lv
  )
  insert into public.user_recipe_eligibility (
    user_id, recipe_id, eligible, reason
  )
  select
    p_user_id, recipe_id,
    not (
      publication_status = 'archived' or blocked_ingredient
      or blocked_allergen or blocked_alcohol
    ),
    case
      when publication_status = 'archived' then 'withdrawn'
      when blocked_ingredient then 'ingredient'
      when blocked_allergen then 'allergen'
      when blocked_alcohol then 'alcohol'
      else null
    end
  from evaluation;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function app_private.refresh_eligibility_after_constraint()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_user_recipe_eligibility(
    coalesce(new.user_id, old.user_id)
  );
  return coalesce(new, old);
end;
$$;

create trigger user_constraints_refresh_eligibility
after insert or update or delete on public.user_food_constraints
for each row execute function app_private.refresh_eligibility_after_constraint();

-- Administration : comptes, blocages et mutations auditées.

create type public.account_state_kind as enum ('active', 'suspended');

create table public.account_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status public.account_state_kind not null default 'active',
  reason text check (reason is null or char_length(trim(reason)) between 3 and 500),
  suspended_at timestamptz,
  suspended_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (status = 'suspended' and suspended_at is not null and suspended_by is not null)
    or (status = 'active' and suspended_at is null)
  )
);

alter table public.admin_audit_log
  add column idempotency_key uuid;
alter table public.admin_audit_log
  drop constraint admin_audit_log_action_check;
alter table public.admin_audit_log
  add constraint admin_audit_log_action_check
  check (action ~ '^[a-z0-9_]+([.][a-z0-9_]+)+$');
create unique index admin_audit_idempotency_idx
  on public.admin_audit_log (admin_user_id, idempotency_key)
  where idempotency_key is not null;

create table public.blocked_food_rules (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  paired_ingredient_id uuid references public.ingredients (id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  active boolean not null default true,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (paired_ingredient_id is null or paired_ingredient_id <> ingredient_id)
);

create or replace view public.admin_user_directory
with (security_barrier = true)
as
select
  users.id,
  users.email,
  profile.first_name,
  profile.last_name,
  coalesce(state.status, 'active'::public.account_state_kind) as status,
  users.created_at,
  users.last_sign_in_at,
  deletion.id as deletion_request_id,
  deletion.status as deletion_status
from auth.users users
left join public.profiles profile on profile.id = users.id
left join public.account_states state on state.user_id = users.id
left join lateral (
  select request.id, request.status
  from public.account_deletion_requests request
  where request.user_id = users.id
  order by request.requested_at desc
  limit 1
) deletion on true
where app_private.is_admin();

create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status public.account_state_kind,
  p_reason text,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() or actor = p_user_id then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> (case
      when p_status = 'suspended' then 'SUSPENDRE'
      else 'REACTIVER'
    end) then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  insert into public.account_states (
    user_id, status, reason, suspended_at, suspended_by
  )
  values (
    p_user_id, p_status, nullif(trim(p_reason), ''),
    case when p_status = 'suspended' then timezone('utc', now()) end,
    case when p_status = 'suspended' then actor end
  )
  on conflict (user_id) do update set
    status = excluded.status,
    reason = excluded.reason,
    suspended_at = excluded.suspended_at,
    suspended_by = excluded.suspended_by,
    updated_at = timezone('utc', now());
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, metadata, idempotency_key
  )
  values (
    actor, 'user.' || p_status::text, 'user', p_user_id::text,
    jsonb_build_object('reason_category', case when p_reason is null then 'none' else 'provided' end),
    p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_process_deletion_request(
  p_request_id uuid,
  p_status public.account_deletion_status,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'TRAITER LA SUPPRESSION'
     or p_status not in ('processing', 'completed', 'failed') then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  update public.account_deletion_requests
  set status = p_status,
      completed_at = case when p_status = 'completed' then timezone('utc', now()) end
  where id = p_request_id;
  if not found then raise exception 'request not found' using errcode = 'P0002'; end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  )
  values (
    actor, 'deletion.' || p_status::text, 'account_deletion_request',
    p_request_id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_set_recipe_publication(
  p_recipe_version_id uuid,
  p_action text,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  version_row public.recipe_versions%rowtype;
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_action not in ('publish', 'unpublish')
     or p_confirmation <> (
       case when p_action = 'publish' then 'PUBLIER' else 'DEPUBLIER' end
     ) then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  select * into version_row from public.recipe_versions
  where id = p_recipe_version_id for update;
  if not found then raise exception 'recipe version not found' using errcode = 'P0002'; end if;
  if p_action = 'publish' and (
    version_row.validation_status <> 'validated'
    or not exists (
      select 1 from public.recipe_ingredients where recipe_version_id = version_row.id
    )
    or not exists (
      select 1 from public.recipe_steps where recipe_version_id = version_row.id
    )
    or exists (
      select 1
      from public.blocked_food_rules rule
      where rule.active and (
        (
          rule.paired_ingredient_id is null and exists (
            select 1 from public.recipe_ingredients ri
            where ri.recipe_version_id = version_row.id
              and ri.ingredient_id = rule.ingredient_id
          )
        ) or (
          rule.paired_ingredient_id is not null
          and exists (
            select 1 from public.recipe_ingredients ri
            where ri.recipe_version_id = version_row.id
              and ri.ingredient_id = rule.ingredient_id
          )
          and exists (
            select 1 from public.recipe_ingredients ri
            where ri.recipe_version_id = version_row.id
              and ri.ingredient_id = rule.paired_ingredient_id
          )
        )
      )
    )
  ) then
    raise exception 'recipe validation required' using errcode = '23514';
  end if;
  update public.recipe_versions
  set publication_status = case
        when p_action = 'publish' then 'published'::public.recipe_publication_status
        else 'archived'::public.recipe_publication_status
      end,
      published_at = case
        when p_action = 'publish' then timezone('utc', now())
        else published_at
      end
  where id = version_row.id;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  )
  values (
    actor, 'recipe.' || p_action, 'recipe_version',
    version_row.id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_create_recipe_revision(
  p_recipe_version_id uuid,
  p_title text,
  p_description text,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  source_row public.recipe_versions%rowtype;
  new_id uuid;
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  select target_id::uuid into new_id
  from public.admin_audit_log
  where admin_user_id = actor and idempotency_key = p_idempotency_key;
  if new_id is not null then return new_id; end if;
  select * into source_row from public.recipe_versions
  where id = p_recipe_version_id;
  if not found then raise exception 'recipe version not found' using errcode = 'P0002'; end if;
  insert into public.recipe_versions (
    recipe_id, version_number, title, description, servings,
    preparation_minutes, cooking_minutes, resting_minutes, difficulty,
    cost_level, estimated_cost_eur, origin, ai_provider, ai_model,
    prompt_version, validation_status, publication_status, validation_notes,
    visual_prompt, visual_alt_text, image_illustrative, tips, variants,
    storage_instructions, reheating_instructions
  )
  values (
    source_row.recipe_id,
    (select max(version_number) + 1 from public.recipe_versions
     where recipe_id = source_row.recipe_id),
    trim(p_title), trim(p_description), source_row.servings,
    source_row.preparation_minutes, source_row.cooking_minutes,
    source_row.resting_minutes, source_row.difficulty, source_row.cost_level,
    source_row.estimated_cost_eur, source_row.origin, source_row.ai_provider,
    source_row.ai_model, source_row.prompt_version, 'pending', 'private',
    'Correction administrateur à revalider', source_row.visual_prompt,
    source_row.visual_alt_text, source_row.image_illustrative,
    source_row.tips, source_row.variants, source_row.storage_instructions,
    source_row.reheating_instructions
  )
  returning id into new_id;
  insert into public.recipe_ingredients (
    recipe_version_id, ingredient_id, position, quantity, unit,
    preparation_note, optional
  )
  select new_id, ingredient_id, position, quantity, unit, preparation_note, optional
  from public.recipe_ingredients where recipe_version_id = source_row.id;
  insert into public.recipe_steps (
    recipe_version_id, position, instruction, timer_seconds
  )
  select new_id, position, instruction, timer_seconds
  from public.recipe_steps where recipe_version_id = source_row.id;
  insert into public.recipe_nutrition (
    recipe_version_id, source, source_version, calories_kcal, protein_g,
    carbohydrates_g, fat_g, fiber_g, salt_g, tolerance_percent, calculated_at
  )
  select new_id, source, source_version, calories_kcal, protein_g,
    carbohydrates_g, fat_g, fiber_g, salt_g, tolerance_percent, calculated_at
  from public.recipe_nutrition where recipe_version_id = source_row.id;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, metadata, idempotency_key
  )
  values (
    actor, 'recipe.revise', 'recipe_version', new_id::text,
    jsonb_build_object('source_version_id', source_row.id), p_idempotency_key
  );
  return new_id;
end;
$$;

create or replace function public.admin_review_recipe_revision(
  p_recipe_version_id uuid,
  p_approve boolean,
  p_notes text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  if p_approve and (
    not exists (
      select 1 from public.recipe_ingredients where recipe_version_id = p_recipe_version_id
    ) or not exists (
      select 1 from public.recipe_steps where recipe_version_id = p_recipe_version_id
    )
  ) then raise exception 'invalid recipe structure' using errcode = '23514'; end if;
  update public.recipe_versions
  set validation_status = case
        when p_approve then 'validated'::public.recipe_validation_status
        else 'rejected'::public.recipe_validation_status
      end,
      validation_notes = nullif(trim(p_notes), ''),
      validated_at = case when p_approve then timezone('utc', now()) end
  where id = p_recipe_version_id;
  if not found then raise exception 'recipe version not found' using errcode = 'P0002'; end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  )
  values (
    actor, case when p_approve then 'recipe.validate' else 'recipe.reject' end,
    'recipe_version', p_recipe_version_id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_resolve_report(
  p_report_id uuid,
  p_status public.report_status,
  p_confirmation text,
  p_idempotency_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_status not in ('investigating', 'resolved', 'dismissed')
     or p_confirmation <> 'TRAITER' then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_audit_log
    where admin_user_id = actor and idempotency_key = p_idempotency_key
  ) then return true; end if;
  update public.content_reports
  set status = p_status, assigned_admin_id = actor,
      resolved_at = case
        when p_status in ('resolved', 'dismissed') then timezone('utc', now())
      end
  where id = p_report_id;
  if not found then raise exception 'report not found' using errcode = 'P0002'; end if;
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  )
  values (
    actor, 'report.' || p_status::text, 'content_report',
    p_report_id::text, p_idempotency_key
  );
  return true;
end;
$$;

create or replace function public.admin_set_blocked_food_rule(
  p_rule_id uuid,
  p_ingredient_id uuid,
  p_paired_ingredient_id uuid,
  p_reason text,
  p_active boolean,
  p_confirmation text,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  result_id uuid := coalesce(p_rule_id, gen_random_uuid());
  audit_target text;
begin
  if actor is null or not app_private.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_confirmation <> 'CONFIRMER LE BLOCAGE'
     or char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'confirmation required' using errcode = '22023';
  end if;
  select target_id into audit_target from public.admin_audit_log
  where admin_user_id = actor and idempotency_key = p_idempotency_key;
  if found then return audit_target::uuid; end if;
  insert into public.blocked_food_rules (
    id, ingredient_id, paired_ingredient_id, reason, active, created_by
  )
  values (
    result_id, p_ingredient_id, p_paired_ingredient_id, trim(p_reason),
    p_active, actor
  )
  on conflict (id) do update set
    reason = excluded.reason, active = excluded.active,
    updated_at = timezone('utc', now());
  insert into public.admin_audit_log (
    admin_user_id, action, target_type, target_id, idempotency_key
  )
  values (
    actor, case when p_active then 'food_rule.block' else 'food_rule.unblock' end,
    'blocked_food_rule', result_id::text, p_idempotency_key
  );
  return result_id;
end;
$$;

alter table public.shopping_list_item_sources enable row level security;
alter table public.shopping_list_mutations enable row level security;
alter table public.user_recipe_eligibility enable row level security;
alter table public.account_states enable row level security;
alter table public.blocked_food_rules enable row level security;

create policy "users manage own shopping sources"
on public.shopping_list_item_sources for all to authenticated
using (exists (
  select 1 from public.shopping_list_items item
  where item.id = shopping_list_item_id and item.user_id = auth.uid()
))
with check (exists (
  select 1 from public.shopping_list_items item
  where item.id = shopping_list_item_id and item.user_id = auth.uid()
));
create policy "users manage own shopping mutations"
on public.shopping_list_mutations for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read own eligibility"
on public.user_recipe_eligibility for select to authenticated
using (user_id = auth.uid());
create policy "users read own account state"
on public.account_states for select to authenticated
using (user_id = auth.uid());
create policy "administrators manage shopping sources"
on public.shopping_list_item_sources for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());
create policy "administrators manage shopping mutations"
on public.shopping_list_mutations for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());
create policy "administrators manage eligibility"
on public.user_recipe_eligibility for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());
create policy "administrators manage account states"
on public.account_states for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());
create policy "administrators manage blocked food rules"
on public.blocked_food_rules for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

revoke all on public.admin_user_directory from anon, authenticated;
grant select on public.admin_user_directory to authenticated;
grant select, insert, update, delete on
  public.shopping_list_item_sources,
  public.shopping_list_mutations,
  public.user_recipe_eligibility,
  public.account_states,
  public.blocked_food_rules
to authenticated;

revoke all on function public.replace_generated_shopping_items(
  uuid, integer, jsonb, uuid
) from public;
revoke all on function public.mutate_shopping_list(
  uuid, text, uuid, uuid, text, numeric, text, text, boolean, boolean, text
) from public;
revoke all on function public.refresh_user_recipe_eligibility(uuid) from public;
revoke all on function public.admin_set_account_status(
  uuid, public.account_state_kind, text, text, uuid
) from public;
revoke all on function public.admin_process_deletion_request(
  uuid, public.account_deletion_status, text, uuid
) from public;
revoke all on function public.admin_set_recipe_publication(
  uuid, text, text, uuid
) from public;
revoke all on function public.admin_create_recipe_revision(
  uuid, text, text, uuid
) from public;
revoke all on function public.admin_review_recipe_revision(
  uuid, boolean, text, uuid
) from public;
revoke all on function public.admin_resolve_report(
  uuid, public.report_status, text, uuid
) from public;
revoke all on function public.admin_set_blocked_food_rule(
  uuid, uuid, uuid, text, boolean, text, uuid
) from public;

grant execute on function public.replace_generated_shopping_items(
  uuid, integer, jsonb, uuid
) to authenticated;
grant execute on function public.mutate_shopping_list(
  uuid, text, uuid, uuid, text, numeric, text, text, boolean, boolean, text
) to authenticated;
grant execute on function public.refresh_user_recipe_eligibility(uuid)
to authenticated;
grant execute on function public.admin_set_account_status(
  uuid, public.account_state_kind, text, text, uuid
) to authenticated;
grant execute on function public.admin_process_deletion_request(
  uuid, public.account_deletion_status, text, uuid
) to authenticated;
grant execute on function public.admin_set_recipe_publication(
  uuid, text, text, uuid
) to authenticated;
grant execute on function public.admin_create_recipe_revision(
  uuid, text, text, uuid
) to authenticated;
grant execute on function public.admin_review_recipe_revision(
  uuid, boolean, text, uuid
) to authenticated;
grant execute on function public.admin_resolve_report(
  uuid, public.report_status, text, uuid
) to authenticated;
grant execute on function public.admin_set_blocked_food_rule(
  uuid, uuid, uuid, text, boolean, text, uuid
) to authenticated;

create index shopping_sources_recipe_idx
  on public.shopping_list_item_sources (recipe_version_id);
create index eligibility_user_status_idx
  on public.user_recipe_eligibility (user_id, eligible);
create index account_states_status_idx on public.account_states (status);
create index blocked_food_rules_active_idx on public.blocked_food_rules (active);

-- A suspended administrator immediately loses every database-level admin
-- capability, including through an already-open session.
create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles roles
    where roles.user_id = auth.uid()
      and roles.role = 'admin'
      and not exists (
        select 1
        from public.account_states states
        where states.user_id = roles.user_id
          and states.status = 'suspended'
      )
  );
$$;
