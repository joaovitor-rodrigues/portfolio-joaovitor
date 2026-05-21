-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard/project/flhqrsqregmwiiaxwakk/sql)

create table if not exists config (
  key  text primary key,
  value jsonb not null
);

create table if not exists categorias (
  id   text primary key,
  data jsonb not null
);

create table if not exists projetos (
  slug text primary key,
  data jsonb not null
);

-- Desabilita RLS (auth feita pelo Next.js via session cookie)
alter table config    disable row level security;
alter table categorias disable row level security;
alter table projetos  disable row level security;
