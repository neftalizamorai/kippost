alter table profiles add column if not exists blog_sections jsonb default '[]'::jsonb;
alter table posts add column if not exists post_sections jsonb default '[]'::jsonb;
alter table posts add column if not exists unlisted boolean not null default false;
