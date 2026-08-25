-- ============================================================
--  오늘의 우리 · Supabase 초기 설정 (최종본)
--  Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여넣고 Run.
--  (이미 정상 작동 중이면 다시 돌릴 필요 없음. 처음 세팅하거나
--   문제가 생겼을 때 이 하나만 실행하면 됩니다. 여러 번 실행해도 안전.)
-- ============================================================

-- ────────────────────────────────────────────────
-- 1) 테이블
-- ────────────────────────────────────────────────
create table if not exists couples (
  id               uuid primary key default gen_random_uuid(),
  invite_code      text unique not null default upper(substr(md5(random()::text), 1, 6)),
  anniversary_date date,
  created_at       timestamptz default now()
);

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  couple_id    uuid references couples(id) on delete set null,
  display_name text default '나',
  emoji        text default '🙂',
  color        text default '#D98763',
  created_at   timestamptz default now()
);

create table if not exists entries (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  date       date not null,
  mood       text,
  note       text,
  note_by    uuid references auth.users(id),
  schedule   text,
  place      text,
  food       text,
  stamps     text[] default '{}',
  updated_at timestamptz default now(),
  unique (couple_id, date)
);

create table if not exists photos (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references entries(id) on delete cascade,
  couple_id    uuid not null references couples(id) on delete cascade,
  storage_path text not null,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- ────────────────────────────────────────────────
-- 2) 도우미 함수: "지금 로그인한 사람의 커플 id"
--    ※ security definer 함수는 search_path 를 명시해야 안전하게 동작합니다.
--      (이게 없으면 정책 안에서 profiles 를 못 찾아 저장/업로드가 실패)
-- ────────────────────────────────────────────────
create or replace function public.my_couple_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

-- ────────────────────────────────────────────────
-- 3) 가입하면 프로필 자동 생성 (트리거)
-- ────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, emoji, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', '나'),
    coalesce(new.raw_user_meta_data->>'emoji', '🙂'),
    coalesce(new.raw_user_meta_data->>'color', '#D98763')
  )
  on conflict (id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────
-- 4) 커플 만들기 / 참여하기 함수
-- ────────────────────────────────────────────────
create or replace function public.create_couple(anniversary date default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  code   text;
begin
  insert into public.couples (anniversary_date)
  values (anniversary)
  returning id, invite_code into new_id, code;

  update public.profiles set couple_id = new_id where id = auth.uid();
  return code;
end
$$;

create or replace function public.join_couple(code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  select id into target from public.couples
  where invite_code = upper(trim(code));

  if target is null then
    return false;
  end if;

  update public.profiles set couple_id = target where id = auth.uid();
  return true;
end
$$;

-- ────────────────────────────────────────────────
-- 5) 보안 (Row Level Security) — "내 커플 데이터만"
-- ────────────────────────────────────────────────
alter table couples  enable row level security;
alter table profiles enable row level security;
alter table entries  enable row level security;
alter table photos   enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "read partner profile" on profiles;
create policy "read partner profile" on profiles
  for select using (couple_id is not null and couple_id = public.my_couple_id());

drop policy if exists "read own couple" on couples;
create policy "read own couple" on couples
  for select using (id = public.my_couple_id());

drop policy if exists "update own couple" on couples;
create policy "update own couple" on couples
  for update using (id = public.my_couple_id()) with check (id = public.my_couple_id());

drop policy if exists "couple entries" on entries;
create policy "couple entries" on entries
  for all using (couple_id = public.my_couple_id()) with check (couple_id = public.my_couple_id());

drop policy if exists "couple photos" on photos;
create policy "couple photos" on photos
  for all using (couple_id = public.my_couple_id()) with check (couple_id = public.my_couple_id());

-- ────────────────────────────────────────────────
-- 6) 권한 부여 (2026-05-30 이후 만든 프로젝트에 필요)
-- ────────────────────────────────────────────────
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant execute on functions to authenticated;

-- ────────────────────────────────────────────────
-- 7) 사진 저장소(Storage) 버킷 + 보안
-- ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "couple photo read" on storage.objects;
create policy "couple photo read" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = public.my_couple_id()::text);

drop policy if exists "couple photo upload" on storage.objects;
create policy "couple photo upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = public.my_couple_id()::text);

drop policy if exists "couple photo delete" on storage.objects;
create policy "couple photo delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = public.my_couple_id()::text);

-- ────────────────────────────────────────────────
-- 8) 실시간 공유 켜기 (이미 추가돼 있으면 에러가 날 수 있는데 무시해도 됩니다)
-- ────────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table entries;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table photos;
  exception when duplicate_object then null;
  end;
end $$;

-- ────────────────────────────────────────────────
-- 9) 개인 일정 (각자 등록해서 서로 볼 수 있는 스케줄)
-- ────────────────────────────────────────────────
create table if not exists schedules (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  time       text,
  title      text not null,
  created_at timestamptz default now()
);
alter table schedules enable row level security;

drop policy if exists "couple schedules" on schedules;
create policy "couple schedules" on schedules
  for all using (couple_id = public.my_couple_id()) with check (couple_id = public.my_couple_id());

do $$
begin
  begin
    alter publication supabase_realtime add table schedules;
  exception when duplicate_object then null;
  end;
end $$;

-- ────────────────────────────────────────────────
-- 10) 프로필 사진 (공개 버킷 — 서명 URL 불필요)
-- ────────────────────────────────────────────────
alter table profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar own upload" on storage.objects;
create policy "avatar own upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar own update" on storage.objects;
create policy "avatar own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar own delete" on storage.objects;
create policy "avatar own delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ────────────────────────────────────────────────
-- 11) 일정: 기간(시작~종료) + 종일 여부로 확장
--     (TimeTree 스타일 막대 달력을 위해 단일 date → 기간으로 변경)
-- ────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'schedules' and column_name = 'date'
  ) then
    alter table schedules rename column date to start_date;
  end if;
end $$;

alter table schedules add column if not exists end_date date;
update schedules set end_date = start_date where end_date is null;
alter table schedules alter column end_date set not null;
alter table schedules add column if not exists all_day boolean not null default true;

-- ────────────────────────────────────────────────
-- 12) 일정: 시간을 시작~종료 범위로 확장
-- ────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'schedules' and column_name = 'time'
  ) then
    alter table schedules rename column time to start_time;
  end if;
end $$;

alter table schedules add column if not exists end_time text;

-- ============================================================
--  끝! "Success. No rows returned" 이 뜨면 정상입니다.
-- ============================================================
