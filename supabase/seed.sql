-- Données strictement locales, déterministes et sans information personnelle.

insert into app_private.seed_metadata (key, value)
values (
  'baseline',
  '{"fixture":"local-only","version":1}'::jsonb
)
on conflict (key) do update
set value = excluded.value;
