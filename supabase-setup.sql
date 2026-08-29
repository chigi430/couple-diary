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

-- ────────────────────────────────────────────────
-- 13) 장소 좌표 (지도에 핀으로 모아보기용)
-- ────────────────────────────────────────────────
alter table entries add column if not exists place_lat double precision;
alter table entries add column if not exists place_lng double precision;

-- ────────────────────────────────────────────────
-- 14) 초대코드 만료 (1시간) + 재발급
-- ────────────────────────────────────────────────
alter table couples add column if not exists invite_code_expires_at timestamptz not null default (now() + interval '1 hour');

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
  insert into public.couples (anniversary_date, invite_code_expires_at)
  values (anniversary, now() + interval '1 hour')
  returning id, invite_code into new_id, code;

  update public.profiles set couple_id = new_id where id = auth.uid();
  return code;
end
$$;

-- join_couple: 'ok' | 'invalid' | 'expired' 로 결과를 구분해서 반환
drop function if exists public.join_couple(text);
create or replace function public.join_couple(code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target     uuid;
  expires_at timestamptz;
begin
  select id, invite_code_expires_at into target, expires_at
  from public.couples
  where invite_code = upper(trim(code));

  if target is null then
    return 'invalid';
  end if;

  if expires_at < now() then
    return 'expired';
  end if;

  update public.profiles set couple_id = target where id = auth.uid();
  return 'ok';
end
$$;

-- regenerate_invite_code: 아직 파트너가 없을 때(1인)만 새 코드 발급
create or replace function public.regenerate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  cid       uuid;
  new_code  text;
  members   int;
begin
  cid := public.my_couple_id();
  if cid is null then
    raise exception '커플 공간이 없어요.';
  end if;

  select count(*) into members from public.profiles where couple_id = cid;
  if members >= 2 then
    raise exception '이미 상대방과 연결되어 있어요.';
  end if;

  new_code := upper(substr(md5(random()::text), 1, 6));
  update public.couples
  set invite_code = new_code, invite_code_expires_at = now() + interval '1 hour'
  where id = cid;

  return new_code;
end
$$;

-- ────────────────────────────────────────────────
-- 15) 푸시 알림 구독 (기기별로 1행씩 저장)
-- ────────────────────────────────────────────────
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  user_agent text,
  created_at timestamptz default now()
);
alter table push_subscriptions enable row level security;

drop policy if exists "own push subscriptions" on push_subscriptions;
create policy "own push subscriptions" on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ────────────────────────────────────────────────
-- 16) 이벤트 알림 (일기·사진·일정·커플연결 시 상대방에게 푸시)
--     실제 vault 시크릿(edge_function_base_url / edge_function_secret)은
--     이 파일에 커밋하지 않고 SQL 에디터에서 1회성으로 등록합니다:
--       select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'edge_function_base_url');
--       select vault.create_secret('<CRON_SECRET 값>', 'edge_function_secret');
-- ────────────────────────────────────────────────
create extension if not exists pg_net with schema extensions;

-- 알림 도배 방지용 스로틀 로그: 받는 사람 × 카테고리별로 마지막 발송 시각을 기억한다.
-- 'activity'(일기/사진/일정)처럼 짧은 시간에 여러 번 트리거되는 카테고리를 한 번으로 묶는 데 씀
-- (예: 사진 5장 올리면 photos insert 트리거가 5번 → 알림 1번만).
create table if not exists public.notify_throttle (
  user_id      uuid not null,
  category     text not null,
  last_sent_at timestamptz not null default now(),
  primary key (user_id, category)
);
-- RLS 켜고 정책은 두지 않음 → 클라이언트 직접 접근 차단, security definer 함수만 읽고 씀
alter table public.notify_throttle enable row level security;

-- 예전 5-인자 버전(카테고리 없음)이 남아있으면 6-인자 호출이 모호해지므로 제거
drop function if exists public.notify_partner(uuid, uuid, text, text, text);

create or replace function public.notify_partner(p_couple_id uuid, p_actor uuid, p_title text, p_body text, p_url text, p_category text default 'activity')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  partner_id uuid;
  base_url   text;
  secret     text;
  pref       boolean;
  last_at    timestamptz;
begin
  select id into partner_id from public.profiles
   where couple_id = p_couple_id and id <> p_actor;
  if partner_id is null then return; end if;

  if p_category = 'activity' then
    select notify_activity into pref from public.profiles where id = partner_id;
  elsif p_category = 'reminder' then
    select notify_reminder into pref from public.profiles where id = partner_id;
  elsif p_category = 'anniversary' then
    select notify_anniversary into pref from public.profiles where id = partner_id;
  elsif p_category = 'wishlist' then
    select notify_wishlist into pref from public.profiles where id = partner_id;
  elsif p_category = 'poke' then
    select notify_poke into pref from public.profiles where id = partner_id;
  else
    pref := true; -- 'always' 카테고리(커플연결, 연말리캡)는 토글 없이 항상 발송
  end if;
  if pref is false then return; end if;

  -- 'activity'는 편집 한 번(일기 저장 + 사진 여러 장)이 트리거를 여러 번 일으키므로
  -- 같은 사람에게 최근 10분 안에 이미 보냈으면 이번 건은 건너뛴다.
  if p_category = 'activity' then
    select last_sent_at into last_at from public.notify_throttle
     where user_id = partner_id and category = p_category;
    if last_at is not null and now() - last_at < interval '10 minutes' then
      return;
    end if;
    insert into public.notify_throttle (user_id, category, last_sent_at)
    values (partner_id, p_category, now())
    on conflict (user_id, category) do update set last_sent_at = now();
  end if;

  select decrypted_secret into base_url from vault.decrypted_secrets where name = 'edge_function_base_url';
  select decrypted_secret into secret   from vault.decrypted_secrets where name = 'edge_function_secret';
  if base_url is null or secret is null then return; end if;

  perform net.http_post(
    url := base_url || '/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := jsonb_build_object('user_ids', jsonb_build_array(partner_id), 'title', p_title, 'body', p_body, 'url', p_url)
  );
end;
$$;

-- 일기 작성/수정 (note 필드가 실제로 바뀐 경우에만)
create or replace function public.trg_notify_entry() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.note is null or new.note = '' then return new; end if;
  if TG_OP = 'UPDATE' and old.note is not distinct from new.note then return new; end if;
  perform public.notify_partner(new.couple_id, new.note_by,
    coalesce((select display_name from public.profiles where id = new.note_by), '상대방') || '님이 오늘 일기를 남겼어요',
    left(new.note, 80), '/?date=' || new.date, 'activity');
  return new;
end $$;
drop trigger if exists on_entry_note_change on entries;
create trigger on_entry_note_change after insert or update on entries
  for each row execute function public.trg_notify_entry();

-- 사진 업로드
create or replace function public.trg_notify_photo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_partner(new.couple_id, new.uploaded_by,
    coalesce((select display_name from public.profiles where id = new.uploaded_by), '상대방') || '님이 사진을 올렸어요',
    '', '/?date=' || (select date from public.entries where id = new.entry_id), 'activity');
  return new;
end $$;
drop trigger if exists on_photo_insert on photos;
create trigger on_photo_insert after insert on photos
  for each row execute function public.trg_notify_photo();

-- 일정 추가
create or replace function public.trg_notify_schedule() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_partner(new.couple_id, new.user_id,
    coalesce((select display_name from public.profiles where id = new.user_id), '상대방') || '님이 일정을 추가했어요: ' || new.title,
    '', '/?date=' || new.start_date, 'activity');
  return new;
end $$;
drop trigger if exists on_schedule_insert on schedules;
create trigger on_schedule_insert after insert on schedules
  for each row execute function public.trg_notify_schedule();

-- join_couple: 참여 성공 시 상대방(초대자)에게 연결 알림 추가
drop function if exists public.join_couple(text);
create or replace function public.join_couple(code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target      uuid;
  expires_at  timestamptz;
  joiner_name text;
begin
  select id, invite_code_expires_at into target, expires_at
  from public.couples
  where invite_code = upper(trim(code));

  if target is null then
    return 'invalid';
  end if;

  if expires_at < now() then
    return 'expired';
  end if;

  select display_name into joiner_name from public.profiles where id = auth.uid();
  update public.profiles set couple_id = target where id = auth.uid();

  perform public.notify_partner(target, auth.uid(),
    coalesce(joiner_name, '상대방') || '님과 연결됐어요! 🎉', '이제 함께 기록해요', '/', 'always');

  return 'ok';
end
$$;

-- ────────────────────────────────────────────────
-- 17) 매일 저녁 9시(KST) 스케줄 알림 (기념일/D-day + 미작성 리마인더)
--     Edge Function daily-check 가 실제 판단 로직을 담당하고,
--     여기서는 매일 정해진 시간에 "호출만" 합니다.
-- ────────────────────────────────────────────────
create extension if not exists pg_cron with schema extensions;

do $$
begin
  perform cron.unschedule('daily-check');
exception when others then null;
end $$;

select cron.schedule(
  'daily-check',
  '0 12 * * *', -- UTC 12:00 = KST 21:00 (한국은 DST 없어 연중 고정)
  $cron$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_base_url') || '/daily-check',
    headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_secret'))
  );
  $cron$
);

-- ────────────────────────────────────────────────
-- 18) 버킷리스트/위시리스트 (같이 하고 싶은 것 목록)
-- ────────────────────────────────────────────────
create table if not exists bucket_items (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  title      text not null,
  done       boolean not null default false,
  created_by uuid references auth.users(id),
  done_by    uuid references auth.users(id),
  done_at    timestamptz,
  created_at timestamptz default now()
);
alter table bucket_items enable row level security;

drop policy if exists "couple bucket items" on bucket_items;
create policy "couple bucket items" on bucket_items
  for all using (couple_id = public.my_couple_id()) with check (couple_id = public.my_couple_id());

do $$
begin
  begin
    alter publication supabase_realtime add table bucket_items;
  exception when duplicate_object then null;
  end;
end $$;

-- 완료 체크 시 상대방에게 알림
create or replace function public.trg_notify_bucket_done() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_partner(new.couple_id, coalesce(new.done_by, auth.uid()),
    '버킷리스트 완료! 🎉', new.title, '/', 'wishlist');
  return new;
end $$;
drop trigger if exists on_bucket_item_done on bucket_items;
create trigger on_bucket_item_done after update on bucket_items
  for each row when (new.done = true and old.done = false)
  execute function public.trg_notify_bucket_done();

-- ────────────────────────────────────────────────
-- 19) 알림 카테고리별 on/off (커플연결·연말리캡은 토글 없이 항상 발송)
-- ────────────────────────────────────────────────
alter table profiles add column if not exists notify_activity boolean not null default true;
alter table profiles add column if not exists notify_reminder boolean not null default true;
alter table profiles add column if not exists notify_anniversary boolean not null default true;

-- ────────────────────────────────────────────────
-- 20) 위시리스트 완료 알림도 별도 토글로 분리 (기존엔 notify_activity에 묶여있었음)
-- ────────────────────────────────────────────────
alter table profiles add column if not exists notify_wishlist boolean not null default true;

-- ────────────────────────────────────────────────
-- 21) 오류 제보 (설정 → 오류 제보) + 야간 유지보수 루틴이 남기는 처리 결과
--     status: open(접수) → pending_deploy(수정 PR 준비됨, 배포 여부 대기) → fixed/wontfix
--     fix_branch/fix_pr_url은 야간 루틴이 준비한 브랜치/PR, 앱의 [배포] 버튼이 이걸로 머지를 수행함
-- ────────────────────────────────────────────────
create table if not exists bug_reports (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  reported_by uuid references auth.users(id),
  description text not null,
  photo_path text,
  status text not null default 'open'
    check (status in ('open','pending_deploy','fixed','wontfix')),
  resolution_note text,
  fix_branch text,
  fix_pr_url text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);
alter table bug_reports enable row level security;

drop policy if exists "couple bug reports" on bug_reports;
create policy "couple bug reports" on bug_reports
  for all using (couple_id = public.my_couple_id()) with check (couple_id = public.my_couple_id());

do $$
begin
  begin
    alter publication supabase_realtime add table bug_reports;
  exception when duplicate_object then null;
  end;
end $$;

-- ────────────────────────────────────────────────
-- 22) 야간 유지보수 루틴이 조회하는 서버 상태 지표
--     net/cron 스키마는 PostgREST에 노출되지 않아 supabase-js .from()으로 못 읽으므로,
--     security definer 함수로 감싸서 maintenance-bot Edge Function이 rpc()로 호출한다.
-- ────────────────────────────────────────────────
create or replace function public.maintenance_health()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'push_subscription_count', (select count(*) from push_subscriptions),
    'cron_jobs', (
      select coalesce(jsonb_agg(jsonb_build_object('jobname', jobname, 'active', active, 'schedule', schedule)), '[]'::jsonb)
      from cron.job
    ),
    'recent_http_responses', (
      select coalesce(jsonb_agg(jsonb_build_object('status_code', status_code, 'created', created)), '[]'::jsonb)
      from (select status_code, created from net._http_response order by created desc limit 20) t
    )
  ) into result;
  return result;
end;
$$;

-- ────────────────────────────────────────────────
-- 23) 상대방 프로필 보기 (카카오톡 프로필 스타일)
--     - cover_url: 프로필 배경 사진 (새 버킷 없이 공개 avatars 버킷 재사용)
--     - status_message: 한 줄 상태 메시지
--     - birthday: 생일 (daily-check 가 생일 당일 상대에게 축하 알림 발송)
--     - last_poke_at: "생각나서 콕" 스팸 방지용 마지막 발송 시각
--     각자 자기 프로필만 수정(기존 "own profile" 정책), 상대 프로필은
--     "read partner profile" 정책으로 읽기만 되므로 추가 정책 불필요.
-- ────────────────────────────────────────────────
alter table profiles add column if not exists cover_url      text;
alter table profiles add column if not exists status_message text;
alter table profiles add column if not exists birthday       date;
alter table profiles add column if not exists last_poke_at   timestamptz;
alter table profiles add column if not exists notify_poke    boolean not null default true;

-- "생각나서 콕" — 상대에게 즉시 푸시. 도배 방지로 3분 쿨다운.
-- 반환값(jsonb): {status:'ok', retry_after:180}
--             | {status:'cooldown', retry_after:<남은 초>}
--             | {status:'no_partner'}
drop function if exists public.poke_partner();
create or replace function public.poke_partner()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  my_couple uuid;
  my_name   text;
  last_at   timestamptz;
  cooldown  constant interval := interval '3 minutes';
begin
  select couple_id, display_name, last_poke_at
    into my_couple, my_name, last_at
  from public.profiles where id = auth.uid();

  if my_couple is null then
    return jsonb_build_object('status', 'no_partner');
  end if;

  if last_at is not null and now() - last_at < cooldown then
    return jsonb_build_object(
      'status', 'cooldown',
      'retry_after', ceil(extract(epoch from (last_at + cooldown - now())))::int
    );
  end if;

  update public.profiles set last_poke_at = now() where id = auth.uid();

  perform public.notify_partner(
    my_couple, auth.uid(),
    coalesce(my_name, '상대방') || '님이 생각나서 콕 찔렀어요 💗',
    '지금 ' || coalesce(my_name, '상대방') || '님이 당신을 떠올리고 있어요',
    '/', 'poke');

  return jsonb_build_object('status', 'ok', 'retry_after', extract(epoch from cooldown)::int);
end;
$$;

-- ============================================================
--  끝! "Success. No rows returned" 이 뜨면 정상입니다.
-- ============================================================
