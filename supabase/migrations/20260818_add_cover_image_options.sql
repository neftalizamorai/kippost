alter table posts
  add column if not exists cover_image_options jsonb default '{}';
