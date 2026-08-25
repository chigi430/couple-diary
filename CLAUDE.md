# CLAUDE.md — 프로젝트 인수인계 문서

> 이 파일은 Claude Code가 프로젝트 맥락을 파악하기 위해 매번 읽는 문서입니다.
> 새 작업을 시작할 때 이 내용을 먼저 참고하세요.

## 프로젝트 개요

- **이름**: 오늘의 우리 (커플 다이어리 앱)
- **한 줄 설명**: 커플이 함께 쓰는 다이어리 앱. 캘린더에 그날의 사진과 기록을 남기는 형태 (타임트리 + 사진/추억 기록).
- **목적**: 여자친구와 함께 쓸 용도로 시작. 부수입(소규모 용돈벌이 수준)도 염두에 둔 사이드 프로젝트.
- **개발자 수준**: 코딩 경험 어느 정도 있음 (완전 초보는 아니지만, 친절한 설명을 선호).

## 기술 스택

- **빌드/프론트엔드**: Vite + React
- **백엔드/데이터**: Supabase (인증, DB, 스토리지, 실시간 기능)
- **지도**: 카카오맵 JS SDK (다녀온 장소 핀 기록/모아보기)
- **개발 환경**: Windows
- **배포**: GitHub(Public, `chigi430/couple-diary`) → Vercel 자동 배포 (main 브랜치 push 시)
- **배포 주소**: https://couple-diary-cyan.vercel.app

## 핵심 기능 (구현 완료)

- 로그인/회원가입, 초대코드로 커플 연결
- 달력: 날짜별 사진·기분·메모 기록 (보기 모드/수정 모드 분리, 여러 장 사진은 스와이프 캐러셀)
- 같은 달력에 TimeTree 스타일 일정 막대 표시 + day-tap 팝업에서 "일정보기"/"오늘의 우리" 탭 전환
- 타임라인 탭: 목록 / 추억 모아보기(그리드) / 지도(다녀온 곳 요약 + 접이식 지도) / 통계 4가지 보기
- 스탬프/태그: 일기에 데이트·여행·영화·맛집·집콕·선물·기념일·투닥 스탬프 붙이기 (달력·타임라인·오늘 화면에 표시)
- PWA (홈 화면에 앱처럼 설치 가능)
- 사진은 클라이언트 리사이즈·압축 후 비공개 버킷 저장 + 서명 URL 조회
- 실시간 공유 (Supabase Realtime)
- 초대코드 1시간 만료 + 재발급
- 위시리스트/버킷리스트 탭: 같이 하고 싶은 것 등록 → 체크로 완료 표시, 완료 시 상대방에게 알림
- 타임라인 탭에 통계 화면 추가: 기분 분포, 많이 쓴 스탬프, 나 vs 상대 기록 비교 (새 DB 없이 기존 기록으로 계산)
- 연말 리캡: 통계 화면에서 스와이프로 넘기는 한 해 요약 카드(연도 선택 가능), 12월 1일 저녁 9시에 리캡 준비 알림 자동 발송(`/?recap=1` 딥링크로 앱 열면 바로 리캡 화면으로 이동)
- 오늘/타임라인에서 상세보기를 열면 일기만 나옴(일정보기 스위처 없음). 캘린더에서 날짜 탭할 때만 일정보기/오늘의 우리 두 탭 다 나옴 — 진입 경로별로 보여주는 내용이 다름
- 설정 탭: 프로필 카드(큰 아바타 + 이름/이모지/색) + "+" 버튼으로 여는 별도 수정 시트. 프로필 사진 업로드, 이름/이모지/색 변경, 로그아웃
- 푸시 알림: 상대방 일기/사진/일정/위시리스트 완료 시 즉시 알림, 커플 연결 시 알림, 매일 저녁 9시 미작성 리마인더, 기념일/D-day(매년·100일 단위) 알림, 12월 1일 연말 리캡 알림. 알림 카테고리별(활동/리마인더/기념일) on-off 가능 — 커플연결·연말리캡은 토글 없이 항상 발송 (자세한 구조는 아래 "푸시 알림 구조" 참고)

## 앞으로 할 일 (TODO)

- 공휴일 데이터(`src/constants.js`, 현재 2026년 예시)를 공공데이터포털 API로 자동화할지 검토
- PWA 아이콘(`public/pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`)이 아직 임시 도형이라 실제 로고로 교체 필요
- (아이디어만 논의, 미착수) 그룹/단체용으로 확장 — 한 사람이 여러 그룹에 속하는 구조로 바꿔야 함

## 푸시 알림 구조

- **프론트**: `src/sw.js`(커스텀 서비스워커, push/notificationclick 처리) + `src/push.js`(구독 생성/해제) + `Settings.jsx`의 알림 토글(구독 on-off + 카테고리별 on-off). `vite-plugin-pwa`는 `injectManifest` 전략 사용 중(커스텀 SW를 넣으려면 이 방식이 필요).
- **구독 저장**: `push_subscriptions` 테이블 (기기당 1행).
- **카테고리별 on-off**: `profiles.notify_activity` / `notify_reminder` / `notify_anniversary` 컬럼(기본 true). 커플연결·연말리캡 알림은 토글이 없고 항상 발송(SQL의 `notify_partner()` 함수에서 `p_category = 'always'`로 호출).
- **발송**: Supabase Edge Function `supabase/functions/send-push` (VAPID 웹푸시, 즉시성 알림용), `supabase/functions/daily-check`(매일 저녁 9시 기념일/리마인더/연말리캡 판단 — 카테고리 컬럼 보고 대상자 필터링).
- **트리거**: `supabase-setup.sql` 16번 섹션 — 일기/사진/일정/위시리스트 완료, `join_couple()` 성공 시 `pg_net`으로 `send-push` 호출(각각 카테고리 파라미터 전달). 17번 섹션 — `pg_cron`이 매일 21시(KST)에 `daily-check` 호출.
- **비밀값**: VAPID 비밀키·CRON_SECRET은 Supabase Edge Function secrets로, `send-push` 호출 URL/시크릿은 Supabase Vault(`vault.decrypted_secrets`)로 관리. 전부 git에는 안 올라감.
- Edge Function을 수정했으면 `npx supabase functions deploy <이름> --no-verify-jwt`로 재배포 필요 (수정만으로는 자동 반영 안 됨).
- 테스트용 "테스트 알림 보내기" 버튼은 배포판에는 넣지 않기로 함(제거 완료). 발송 테스트가 필요하면 `curl`로 `send-push` Edge Function을 직접 호출하거나, `daily-check`를 수동 invoke해서 확인할 것.

## 다른 PC에서 이어서 작업하기

이 저장소는 Public GitHub라 코드는 그대로 클론하면 되지만, **`.env` 파일은 git에 없어서 새 PC마다 직접 만들어야 함**:

1. Node.js, Git, VSCode + Claude Code 확장 설치
2. `git clone https://github.com/chigi430/couple-diary.git` 후 `npm install`
3. `.env.example`을 복사해서 `.env`로 만들고 실제 값 채우기:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` — Supabase 대시보드 → Settings → API Keys
   - `VITE_KAKAO_MAP_APP_KEY` — Kakao Developers → 내 애플리케이션 → 앱 키 → JavaScript 키
   - `VITE_VAPID_PUBLIC_KEY` — 푸시 알림용 공개키. 기존에 생성해둔 값이 있으면 그걸 그대로 쓰면 되고(비밀키와 짝이 맞아야 하므로 새로 만들면 안 됨), 안 가지고 있으면 물어볼 것.
4. `npm run dev`로 실행

Supabase/Vercel/Kakao 설정은 전부 클라우드에 이미 되어 있어서 추가 설정 없이 그대로 이어짐 (Kakao Web 플랫폼 도메인에 `http://localhost:5173`이 등록돼 있어 포트만 같으면 어느 PC에서든 지도 기능도 동작). Edge Function 배포/시크릿 설정도 클라우드 쪽이라 새 PC에서 다시 할 필요 없음 — 다만 Edge Function 코드를 새 PC에서 수정해서 재배포하려면 그 PC에서 `npx supabase login` → `npx supabase link --project-ref heksenfpxztwwstbqkll` 한 번은 해줘야 함.

## 작업 시 지켜줄 것

- 코드를 수정하기 전에 무엇을 왜 바꾸는지 먼저 설명할 것.
- 큰 변경은 한 번에 하지 말고 단계별로 진행하고, 각 단계마다 확인받을 것.
- Supabase/Kakao 키 등 민감한 값은 절대 코드나 이 문서에 하드코딩하지 말고 환경변수(.env)로 관리할 것 (이 저장소는 Public이라 특히 주의).
- 설명은 한국어로, 초보 친화적으로.
- `npm run build`/`dev`/`preview`는 매번 승인받지 않고 바로 실행 (Bash 도구 사용 — PowerShell 도구는 권한 규칙이 안 먹힘).

## 환경변수 (참고)

- `.env`는 `.gitignore`에 포함되어 git에 올라가지 않음. 값은 `.env.example` 형식 참고.
- Edge Function 쪽 비밀값(VAPID 비밀키, CRON_SECRET)은 `.env`가 아니라 `npx supabase secrets set`으로 클라우드에 저장되어 있음. 로컬에는 존재하지 않으니 다시 확인하려면 Supabase 대시보드 → Edge Functions → Secrets에서 볼 것 (값 자체는 대시보드에서도 마스킹되어 안 보임, 재설정만 가능).
