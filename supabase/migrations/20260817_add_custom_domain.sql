alter table profiles
  add column if not exists custom_domain text unique;

create index if not exists profiles_custom_domain_idx
  on profiles(custom_domain);
