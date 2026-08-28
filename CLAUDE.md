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
- 설정 탭: 프로필 카드(큰 아바타 + 이름/이모지/색) + "+" 버튼으로 여는 별도 수정 시트. 프로필 사진 업로드, 이름/이모지/색 변경. 다크모드 수동 토글, 로그아웃/커플연결해제는 "•••" 메뉴 안에. "사귀기 시작한 날"은 `AnniversarySheet.jsx`(달력 상단 D-day 스트립 탭)에서 설정
- 설정 탭에 버전 확인/업데이트 기능: 현재 버전과 최신 여부 표시, 업데이트 버튼 누르면 그동안의 변경사항(`public/changelog.json` 기반, 날짜별로 묶어서 표시)을 보여주는 확인 시트 → 확인하면 서비스워커/캐시 초기화 후 새로고침
- 오늘 탭: 오늘 기록 아래로 무한스크롤 피드(지난 기록을 10개씩 페이지네이션해서 이어서 로드). 사진 캐러셀은 활성 슬라이드 기준 앞뒤 1장만 렌더링해 지연 로딩(성능 때문에 필수 — 전체 다 렌더링하면 피드가 무거워짐)
- 스크롤 다운 시 하단 탭바와 "최근 우리" 스트립이 자동으로 숨고, 스크롤 업하면 다시 나타남 (`useHideOnScroll.js`)
- 푸시 알림: 상대방 일기/사진/일정 작성 시 즉시 알림, 위시리스트 완료 시 알림, 커플 연결 시 알림, 매일 저녁 9시 미작성 리마인더, 기념일/D-day(매년·100일 단위) 알림, 12월 1일 연말 리캡 알림. 알림 카테고리별(활동/리마인더/기념일/위시리스트) on-off 가능 (자세한 구조는 아래 "푸시 알림 구조" 참고)
- 설정 탭에 "오류 제보" 기능: 설명+사진으로 문제 제보 → 야간 점검 루틴이 판단/수정 → 앱 안에서 상태 확인 + [배포] 승인 (자세한 구조는 아래 "유지보수 자동화" 참고)

## 디자인 시스템 / UI 패턴

- **아이콘**: `src/Icons.jsx` — 얇은 선 스타일 SVG 아이콘 세트(Feather 아이콘 스타일). 유니코드 기호(◉▦☰✕＋✎ 등)는 폰트마다 다르게 보여서 전부 이걸로 교체함. 새 아이콘 필요하면 여기에 추가.
- **"•••" 더보기 메뉴**: `src/MoreMenu.jsx`. **이 앱의 핵심 관례** — 화면당 하나뿐인 액션이든(저장, 완료) 여러 개 중 하나든(삭제) 상관없이, "수정/저장/삭제/완료" 같은 액션 버튼은 전부 큰 버튼으로 노출하지 않고 "•••" 메뉴 안에 항목으로 넣는다. 시트에서는 헤더 우측에 항상 **[•••, ✕] 순서**로 배치(예: `ScheduleForm.jsx`, `Settings.jsx` 프로필 수정 시트, `DaySheet.jsx` 일기 보기/수정 — 단, `DaySheet.jsx`는 `DiaryTab.jsx`의 view/edit 모드 상태를 끌어올려서 헤더에서 메뉴를 띄움). 새로 액션 버튼 추가할 때 이 패턴 따를 것. 예외: 화면 전체의 유일한 진입 CTA(예: Today 탭의 "오늘 기록하기" 빈 상태 버튼)는 헤더가 없는 일반 화면이라 그대로 큰 버튼 유지.
- **토스트**: `src/toast.js`(전역 이벤트 방식) + `src/ToastHost.jsx`(App.jsx에 한 번 마운트). 아무 컴포넌트에서나 `toast("메시지")` 호출하면 화면 상단에 잠깐 떴다 사라짐. 저장류 액션 완료 확인용으로 사용.
- **리스트 등장 애니메이션**: `S.listPop` 스타일 + `animationDelay: ${i * 30}ms` 식으로 인덱스 기반 시차. 타임라인/위시리스트에 적용됨.
- **다크모드**: CSS 변수 기반. `styles.js`의 `css` 템플릿 상단 `:root` 블록에 라이트 값, `@media (prefers-color-scheme: dark)` 블록에 다크 값(시스템 자동 추종). `src/theme.js` + `Settings.jsx`의 "다크모드" 토글로 시스템 설정과 무관하게 강제 전환 가능 — `localStorage`(`theme-override` 키, 기기별로 저장)에 저장하고 `<html data-theme="dark|light">` 속성으로 오버라이드. **색상 새로 추가할 때 하드코딩 hex 대신 반드시 `var(--토큰명)` 쓸 것** (배경/텍스트/테두리류). 브랜드 포인트 컬러(`#D98763` 오렌지, `#D9679A` 핑크 등)는 두 테마에서 거의 그대로 써서 예외. 다크모드 팔레트는 인스타그램/스포티파이류를 참고해 채도 낮은 니어블랙 톤(`--bg1: #141110` 등)으로 통일돼 있음 — 새 색상 추가 시 이 톤에서 벗어나지 않게 할 것. 텍스트 계열 토큰(`--text-muted`, `--text-muted2` 등)은 배경 대비 WCAG AA 기준(일반 텍스트 4.5:1 이상)을 넘도록 맞춰뒀으니, 더 어둡게 조정할 땐 대비 계산해보고 바꿀 것.
- **확인/알림 팝업**: `src/ConfirmSheet.jsx`(되돌리기 어렵거나 위험한 액션 확인용, 예: 커플 연결 해제·업데이트) — `window.confirm`/`window.alert` 대신 이걸로 통일. `src/AnniversarySheet.jsx`처럼 입력값 하나만 받는 간단한 시트도 `window.prompt` 대신 전용 시트 컴포넌트로 만들 것. 내용이 짧은 시트는 `S.sheet`(높이 90vh 고정) 대신 `S.sheetCompact`(내용만큼만 높이 차지)를 사용.
- **전체화면 오버레이는 반드시 Portal로**: `PhotoLightbox.jsx`처럼 화면 전체를 덮어야 하는 `position: fixed` 오버레이는 `createPortal(..., document.body)`로 렌더링할 것. 조상 요소에 `transform`/`filter`/`backdrop-filter`/`will-change`/`contain`/`perspective`가 걸리면(애니메이션 keyframe이 끝난 뒤 남기는 값 포함, 예: `translateY(0)`) 그 조상이 `position: fixed`의 containing block이 되어버려 전체화면이 카드 크기로 쪼그라드는 버그가 남 — Portal로 완전히 우회하는 게 제일 확실함.
- **falsy 렌더링 주의**: `{조건 && <X/>}` 패턴에서 `조건`이 `false`/`null`/`undefined`가 아니라 숫자 `0`이면 React가 문자 그대로 `"0"`을 화면에 찍음. `hasAny()` 같은 boolean 판정용 유틸 함수는 `&&`/`||` 체이닝 결과를 그대로 반환하지 말고 꼭 `!!(...)`로 감쌀 것.

## 앞으로 할 일 (TODO)

- 공휴일 데이터(`src/constants.js`, 현재 2026년 예시)를 공공데이터포털 API로 자동화할지 검토
- PWA 아이콘(`public/pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`)이 아직 임시 도형이라 실제 로고로 교체 필요
- (아이디어만 논의, 미착수) 그룹/단체용으로 확장 — 한 사람이 여러 그룹에 속하는 구조로 바꿔야 함

## 푸시 알림 구조

- **프론트**: `src/sw.js`(커스텀 서비스워커, push/notificationclick 처리) + `src/push.js`(구독 생성/해제) + `Settings.jsx`의 알림 토글(구독 on-off + 카테고리별 on-off). `vite-plugin-pwa`는 `injectManifest` 전략 사용 중(커스텀 SW를 넣으려면 이 방식이 필요).
- **구독 저장**: `push_subscriptions` 테이블 (기기당 1행).
- **카테고리별 on-off**: `profiles.notify_activity` / `notify_reminder` / `notify_anniversary` / `notify_wishlist` 컬럼(기본 true). 커플연결·연말리캡 알림은 토글이 없고 항상 발송(SQL의 `notify_partner()` 함수에서 `p_category = 'always'`로 호출).
- **발송**: Supabase Edge Function `supabase/functions/send-push` (VAPID 웹푸시, 즉시성 알림용), `supabase/functions/daily-check`(매일 저녁 9시 기념일/리마인더/연말리캡 판단 — 카테고리 컬럼 보고 대상자 필터링).
- **트리거**: `supabase-setup.sql` 16번 섹션 — 일기/사진/일정/위시리스트 완료, `join_couple()` 성공 시 `pg_net`으로 `send-push` 호출(각각 카테고리 파라미터 전달). 17번 섹션 — `pg_cron`이 매일 21시(KST)에 `daily-check` 호출.
- **비밀값**: VAPID 비밀키·CRON_SECRET은 Supabase Edge Function secrets로, `send-push` 호출 URL/시크릿은 Supabase Vault(`vault.decrypted_secrets`)로 관리. 전부 git에는 안 올라감.
- Edge Function을 수정했으면 `npx supabase functions deploy <이름> --no-verify-jwt`로 재배포 필요 (수정만으로는 자동 반영 안 됨).
- 테스트용 "테스트 알림 보내기" 버튼은 배포판에는 넣지 않기로 함(제거 완료). 발송 테스트가 필요하면 `curl`로 `send-push` Edge Function을 직접 호출하거나, `daily-check`를 수동 invoke해서 확인할 것.

## 유지보수 자동화 (오류 제보 + 야간 점검)

문제가 생기면 사람이 매번 "점검해줘"라고 말하지 않아도 스스로 찾아서 고치는 체계. 2026-08-28에 도입, `C:\Users\박창환\.claude\plans\quizzical-snuggling-rossum.md`에 설계 배경이 남아있음.

- **오류 제보(Part A, 완성)**: 설정 → 오류 제보에서 설명+사진(선택)으로 제보 → `bug_reports` 테이블에 저장. `src/useBugReports.js`(CRUD+realtime), `src/BugReportSheet.jsx`(제보 폼 + 과거 제보 목록). 사진은 새 버킷 없이 기존 `photos` 비공개 버킷을 `${coupleId}/bugreports/...` 경로로 재사용.
- **상태 흐름**: `open`(접수, 점검 전) → `pending_deploy`(실제 버그로 판단, 수정 PR 준비됨) → 사용자가 배포 선택 시 `fixed`, 대기 선택 시 그대로 → 버그가 아니면 `wontfix`. `resolution_note`에 판단/조치 내용이 남음.
- **배포 승인은 반드시 앱 안의 [배포]/[대기] 버튼으로만** — `pending_deploy` 상태인 제보를 "설정 → 오류 제보" 목록에서 열면 버튼이 뜬다. **채팅으로 "배포해"라고 말해도 그걸로 배포를 실행하지 않는다** (예전엔 그런 방식으로 설계했다가 사용자가 명시적으로 반대해서 지금 방식으로 바뀜 — 세션이 이 규칙을 착각하지 않도록 여기 명시).
- **`supabase/functions/maintenance-bot`**: 두 가지 인증 경로를 한 함수에서 처리.
  - `x-cron-secret`(시크릿 `MAINTENANCE_BOT_SECRET`) 인증 — 야간 점검 루틴 전용. `{action:"list"}`로 열린 제보 + 서버 상태 지표 조회(`maintenance_health()` RPC — `push_subscriptions` 수, `cron.job` 활성 여부, `net._http_response` 최근 상태코드; `net`/`cron` 스키마는 PostgREST에 안 잡혀서 이 RPC로 우회), `{action:"update_report",...}`로 판단 결과 기록, `{action:"notify",message}`로 창환님 계정(`MAINTENANCE_OWNER_USER_ID` 시크릿 = chigi430@gmail.com 프로필, 커플 전체가 아니라 이 계정 한정)에만 웹푸시 발송.
  - `/deploy` 경로 — 앱의 [배포] 버튼 전용, 사용자 로그인 JWT로 인증 + couple 소속 확인 후 GitHub API로 `fix_pr_url`의 PR을 머지(squash). 머지가 main push가 되므로 Vercel이 그대로 자동 배포. GitHub 토큰은 시크릿 `GITHUB_TOKEN`(저장소 `chigi430/couple-diary` 전용 fine-grained PAT, Contents+Pull requests 권한만).
- **`maintenance-log.md`**(레포 루트, git 추적): 제보 처리/점검 조치 내역을 날짜별로 기록. "요즘 뭐 고쳤어?" 질문엔 이 파일 기준으로 답할 것 — 세션이 바뀌어도 이 파일을 보면 지금까지 뭘 처리했는지 알 수 있음.
- **매일 자정 점검 루틴(Part B)**: 클라우드에서 도는 이 부분은 API로 대신 만들지 않고 **사용자가 claude.ai/code/routines(또는 CLI `/schedule`)에서 직접 등록**해야 함(등록 문구는 계획 파일 Part B 5번 항목 참고). 등록 전 사용자가 준비해야 하는 것: ① 계정에 Claude Code on the web 루틴 기능이 있는지 확인(Pro/Max/Team 필요), ② 위 프롬프트로 매일 00시경 스케줄 등록, ③ GitHub fine-grained PAT 발급해서 전달 → `GITHUB_TOKEN` 시크릿으로 등록. 이 셋이 준비되기 전까지는 오류 제보를 접수는 받지만 야간 자동 판단/수정은 안 돎(제보 목록에 계속 `open`으로만 남음) — 정상 동작이니 당황하지 말 것.
- **스키마 변경은 절대 자동 적용 안 함**(고정 정책) — 야간 루틴이 `supabase-setup.sql` 변경이 필요해 보이는 버그를 만나면 코드는 고치지 말고 `open` 상태 그대로 "사람 승인 필요"라고만 기록하게 설계돼 있음.

## 다른 PC에서 이어서 작업하기

회사/집 등 여러 PC를 오가며 작업하는 걸 전제로 함. **환경변수/설정이 들어가는 곳이 3군데인데 성격이 전혀 달라서**, 어디에 뭘 넣어야 하는지부터 명확히 구분해둠(실제로 이거 헷갈려서 한 번 사고 날 뻔함 — Vercel 쪽에 새 변수 추가를 깜빡한 적 있음):

| 위치 | 뭐가 들어가나 | PC 바뀔 때마다 새로 해야 하나? |
|---|---|---|
| 로컬 `.env` (git 추적 안 됨, `.gitignore`) | `VITE_` 접두어 변수 전부 (아래 4개) | **그렇다** — 새 PC마다 `.env.example` 복사해서 직접 채워야 함 |
| **Vercel 프로젝트 환경변수** (Vercel 대시보드 → Settings → Environment Variables) | 로컬 `.env`와 **동일한 `VITE_` 변수 전부** | 한 번 설정되면 유지되지만, **`VITE_` 변수를 새로 추가할 때마다 여기도 같이 추가해야 함** — 안 하면 프로덕션 빌드에서 그 값이 `undefined`가 되는데 에러가 안 나고 그냥 기능이 조용히 안 보이기만 해서 놓치기 쉬움 |
| Supabase Edge Function secrets (`npx supabase secrets set`) | `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `GITHUB_TOKEN`, `MAINTENANCE_BOT_SECRET`, `MAINTENANCE_OWNER_USER_ID` 등 | **아니다** — 클라우드(같은 Supabase 프로젝트)에 저장돼서 어느 PC에서 작업하든 그대로 적용됨 |

### 새 PC 세팅 순서

1. Node.js, Git, VSCode + Claude Code 확장 설치
2. `git clone https://github.com/chigi430/couple-diary.git` 후 `npm install`
3. `.env.example`을 복사해서 `.env`로 만들고 실제 값 채우기:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` — Supabase 대시보드 → Settings → API Keys
   - `VITE_KAKAO_MAP_APP_KEY` — Kakao Developers → 내 애플리케이션 → 앱 키 → JavaScript 키 (Web 플랫폼 도메인에 `http://localhost:5173`과 실제 배포 도메인이 이미 둘 다 등록돼 있어서 새 PC에서 추가 설정 불필요, 포트만 5173으로 맞으면 됨)
   - `VITE_VAPID_PUBLIC_KEY` — 기존에 생성해둔 값 그대로 사용(비밀키와 짝이 맞아야 하므로 새로 만들면 안 됨), 모르면 물어볼 것
   - `VITE_MAINTAINER_USER_ID` — 오류 제보 화면에서 배포 버튼 등 유지보수 상세정보를 볼 수 있는 계정(창환님 profiles.id). 비밀값 아님, `.env.example`에 실제 값이 이미 적혀 있으니 그대로 복사. **DB를 초기화해서 계정을 다시 만든 경우엔 이 값이 옛날 계정 id라 안 맞을 수 있음** — 그럴 땐 새 id를 찾아서 `.env.example`과 Vercel 프로젝트 환경변수 양쪽 다 갱신하고 재배포해야 반영됨
4. `npm run dev`로 실행

Edge Function 배포/시크릿 설정은 클라우드 쪽이라 새 PC에서 다시 할 필요 없음 — 다만 Edge Function 코드를 새 PC에서 수정해서 재배포하려면 그 PC에서 `npx supabase login` → `npx supabase link --project-ref heksenfpxztwwstbqkll` 한 번은 해줘야 함.

### 세션 넘길 때 지킬 습관

- 작업 끝내고 자리 옮기기 전엔 **커밋 + push까지 끝내고 갈 것** — 로컬에만 있는 커밋은 다른 PC/세션에서 안 보임.
- 새 PC/새 세션 시작하면 **`git pull`(또는 `git fetch`+`git log HEAD..origin/main`로 확인)부터 하고 시작할 것** — 다른 PC에서 먼저 작업해뒀을 수 있음(실제로 이런 일이 있었음: 집 PC에서 만든 "오류 제보" 기능을 이 PC 세션이 하루 뒤에야 발견함).
- 이 CLAUDE.md의 "핵심 기능"/"앞으로 할 일" 같은 섹션은 큰 작업이 끝나면 그때그때 최신 상태로 갱신해둘 것 — 다른 PC 세션이 이 파일만 보고도 맥락을 바로 잡을 수 있어야 함.

Edge Function 쪽 비밀값(VAPID 비밀키, CRON_SECRET)은 `.env`가 아니라 `npx supabase secrets set`으로 클라우드에 저장돼 있어서 로컬에는 존재하지 않음 — 확인하려면 Supabase 대시보드 → Edge Functions → Secrets에서 볼 것(값 자체는 대시보드에서도 마스킹되어 안 보임, 재설정만 가능).

## 작업 시 지켜줄 것

- 코드를 수정하기 전에 무엇을 왜 바꾸는지 먼저 설명할 것.
- 큰 변경은 한 번에 하지 말고 단계별로 진행할 것. 다만 매 단계 확인받으려고 멈추지 말고, **웬만한 요청/판단은 기본적으로 진행(yes)** — 되돌리기 어려운 작업, 보안/계정 관련(비밀번호·결제·계정 삭제 등), 방향이 크게 갈리는 선택처럼 "진짜 중요하다" 싶은 것만 먼저 확인받을 것. (이건 어느 PC/환경에서 작업하든 동일하게 적용 — 로컬 메모리가 아니라 이 문서에 박아둔 이유)
- Supabase/Kakao 키 등 민감한 값은 절대 코드나 이 문서에 하드코딩하지 말고 환경변수(.env)로 관리할 것 (이 저장소는 Public이라 특히 주의).
- 새 `VITE_` 접두어 환경변수를 추가하면 `.env.example`뿐 아니라 **Vercel 프로젝트 환경변수에도 반드시 같이 추가**할 것(위 "다른 PC에서 이어서 작업하기" 표 참고) — 안 하면 프로덕션에서 조용히 `undefined`가 되고 에러 없이 기능만 안 보여서 놓치기 쉬움.
- 설명은 한국어로, 초보 친화적으로.
- `npm run build`/`dev`/`preview`는 매번 승인받지 않고 바로 실행 (Bash 도구 사용 — PowerShell 도구는 권한 규칙이 안 먹힘).
- `supabase-setup.sql` 변경(새 컬럼/함수/트리거 추가 등)도 승인받지 말고 바로 실행할 것 — `npx supabase db query --linked --file supabase-setup.sql` (또는 필요한 부분만 `--linked "<SQL>"`)으로 직접 적용. 이 파일은 여러 번 실행해도 안전하게 설계돼 있음. CLI가 로그인/링크 안 돼 있으면 그때만 로그인 진행 여부를 물을 것.
- 사용자 눈에 보이는 변경사항을 배포(git push)할 때는 `public/changelog.json`에도 새 항목을 추가할 것 — `version`은 그 배포 커밋의 짧은 해시(`git rev-parse --short HEAD`, 7자), `notes`는 초보 사용자 눈높이의 한국어 한 줄 설명 배열(깃 커밋 메시지 그대로 쓰지 말 것). 배열 맨 앞(최신)에 추가. 설정 화면의 "버전 정보/업데이트" 기능이 이 파일로 "무엇이 바뀌었는지"를 보여줌.
  - `notes` 문구 원칙: 사용자가 체감할 핵심 기능 추가/변경이면 어떤 기능인지 구체적으로 적고, 그 정도가 아닌 사소한 조정·튜닝·버그성 수정이면 그냥 "오류 수정"으로 뭉뚱그려 적을 것 (자잘한 문구가 여러 줄 나열되면 사용자 입장에서 오히려 안 읽힘).
  - 같은 날짜에 여러 커밋을 배포해도 설정 화면 업데이트 팝업에서는 날짜별로 한 번만 묶어서 보여줌(`Settings.jsx`의 `confirmAndUpdate`가 `changelogEntries`를 날짜 기준으로 그룹핑) — 그러니 `notes` 작성 시 같은 날짜의 다른 항목과 중복되는 문구를 안 넣어도 됨.
  - 오늘 이미 같은 성격(사소한 수정/튜닝)의 항목이 있으면, 배포할 때마다 매번 새 항목을 또 추가하지 말고 그냥 둘 것. 방금 추가한 기능을 같은 날 미세 조정하는 후속 커밋(임계값 조정 등)은 별도 changelog 항목 없이 조용히 배포만 하면 됨 — 핵심 기능이 새로 생겼을 때만 새 항목을 추가.
