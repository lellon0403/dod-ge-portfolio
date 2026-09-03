create table if not exists public.projects (
  id text primary key,
  title text not null,
  category text not null,
  year text not null,
  description text not null default '',
  image_key text not null,
  layout text not null default 'portrait' check (layout in ('portrait', 'landscape', 'square')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.site_settings (
  id text primary key,
  artist_name text not null,
  artist_mark text not null,
  role_line text not null default '',
  hero_note text not null default '',
  hero_title text not null default '',
  hero_description text not null default '',
  works_eyebrow text not null,
  works_title text not null,
  empty_title text not null,
  empty_body text not null,
  about_eyebrow text not null,
  about_headline text not null,
  about_note text not null,
  about_body text not null,
  location text not null,
  email text not null,
  footer_note text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_credentials (
  id text primary key,
  salt text not null,
  code_hash text not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_login_attempts (
  fingerprint text primary key,
  attempt_count integer not null default 0,
  window_start bigint not null
);

create index if not exists idx_projects_sort_order on public.projects(sort_order);
create index if not exists idx_projects_category_sort on public.projects(category, sort_order);

insert into public.categories (id, name, sort_order) values
  ('category-character-ko', '캐릭터', 0),
  ('category-fan-art-ko', '팬아트', 1),
  ('category-illustration-ko', '일러스트', 2),
  ('category-sketch-ko', '스케치', 3)
on conflict (id) do nothing;

insert into public.site_settings (
  id, artist_name, artist_mark, role_line, hero_note, hero_title, hero_description,
  works_eyebrow, works_title, empty_title, empty_body,
  about_eyebrow, about_headline, about_note, about_body,
  location, email, footer_note
) values (
  'main', 'DodGe', 'DG', '일러스트 · 캐릭터 · 팬아트', '', '', '',
  '01 · 작품', '작품 모음', '첫 작품을 기다리고 있어요.',
  '관리자 화면에서 DodGe의 작품을 올리면 이곳에 바로 전시됩니다.',
  '02 · 작가 소개', E'좋아하는 순간을\n한 장의 그림으로.', '안녕하세요, DodGe입니다.',
  '애니메이션과 이야기, 방송 속 재미있는 순간에서 영감을 받아 캐릭터를 그립니다. 좋아하는 마음이 보이는 그림을 오래 그리고 싶어요.',
  '대한민국 서울', 'hello@example.com', '좋아하는 모든 순간을 그림으로 ✦'
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_credentials enable row level security;
alter table public.admin_login_attempts enable row level security;

revoke all on public.projects, public.categories, public.site_settings, public.admin_credentials, public.admin_login_attempts from anon, authenticated;
grant all on public.projects, public.categories, public.site_settings, public.admin_credentials, public.admin_login_attempts to service_role;

create or replace function public.rename_category(p_id text, p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.categories set name = p_new_name where id = p_id;
  update public.projects set category = p_new_name where category = p_old_name;
end;
$$;

create or replace function public.reorder_projects(p_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id text;
  position integer := 0;
begin
  foreach current_id in array p_ids loop
    update public.projects set sort_order = position where id = current_id;
    position := position + 1;
  end loop;
end;
$$;

revoke all on function public.rename_category(text, text, text) from public, anon, authenticated;
revoke all on function public.reorder_projects(text[]) from public, anon, authenticated;
grant execute on function public.rename_category(text, text, text) to service_role;
grant execute on function public.reorder_projects(text[]) to service_role;
