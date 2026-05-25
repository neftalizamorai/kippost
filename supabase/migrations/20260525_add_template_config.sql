alter table profiles
  add column if not exists template_config jsonb not null default '{}'::jsonb;
