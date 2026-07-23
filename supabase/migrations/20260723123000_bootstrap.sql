-- Fondation technique uniquement. Le modèle métier sera ajouté dans le jalon M2.

create schema if not exists app_private;

revoke all on schema app_private from public;
revoke all on schema app_private from anon;
revoke all on schema app_private from authenticated;

create table app_private.seed_metadata (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default timezone('utc', now())
);

alter table app_private.seed_metadata enable row level security;

comment on schema app_private is
  'Objets internes non exposés par la Data API Supabase.';
comment on table app_private.seed_metadata is
  'Marqueurs non sensibles utilisés pour vérifier les seeds locaux et la CI.';
