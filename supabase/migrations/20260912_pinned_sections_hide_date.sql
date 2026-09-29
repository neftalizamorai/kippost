alter table posts
  add column if not exists pinned_sections jsonb default '[]'::jsonb,
  add column if not exists hide_date boolean default false;
