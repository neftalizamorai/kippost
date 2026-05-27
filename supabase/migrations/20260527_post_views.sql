create table if not exists post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  country text
);

create index if not exists post_views_post_id_idx on post_views(post_id);
create index if not exists post_views_viewed_at_idx on post_views(viewed_at);

-- Allow anonymous inserts (public tracking)
alter table post_views enable row level security;
create policy "Anyone can insert views" on post_views for insert to anon, authenticated with check (true);
create policy "Users can read their own post views" on post_views for select to authenticated
  using (post_id in (select id from posts where user_id = auth.uid()));
