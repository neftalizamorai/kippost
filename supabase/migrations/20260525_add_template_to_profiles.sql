alter table profiles
  add column if not exists template text not null default 'minimal';
