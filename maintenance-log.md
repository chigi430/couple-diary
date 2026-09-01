# 유지보수 로그

> 오류 제보(설정 → 오류 제보) 처리 내역과 야간 점검 루틴이 조치한 내용을 기록하는 파일.
> 형식: 날짜 / 트리거(제보 ID 또는 점검 항목) / 진단 / 조치 / 커밋·PR 링크.
> "요즘 뭐 고쳤어?"라고 물어보면 이 파일 기준으로 답한다.

## 2026-08-27 — 푸시 알림이 조용히 고장 나 있던 문제

- **트리거**: 사용자가 "알림 기능이 작동 잘 안되는 것 같다"고 점검 요청.
- **진단**: `push_subscriptions` 테이블에 구독이 거의 없었음. `Settings.jsx`가 브라우저 쪽 구독 존재 여부만 확인하고 DB에 실제로 저장됐는지는 확인하지 않아, 최초 저장이 한 번이라도 실패하면 토글은 계속 "켜짐"으로 보이는데 실제로는 알림이 전혀 안 가는 상태가 됐다.
- **조치**: `src/push.js`에 `syncPushSubscription()` 추가(브라우저에 구독이 있으면 DB에 재동기화), `src/Settings.jsx`가 설정 화면을 열 때마다 이걸 실행하도록 변경. 저장 실패 시엔 브라우저 구독도 롤백해서 상태가 꼬이지 않게 함.
- **커밋**: `62747c9` Fix push subscriptions silently going out of sync with the DB

## 2026-08-28 — 유지보수 자동화 체계 구축 (오류 제보 + 야간 점검 루틴)

- **트리거**: 사용자가 앞으로 계속 쓸 앱이니 문제 발견·수정·배포까지 스스로 도는 유지보수 체계를 요청.
- **조치**:
  - `bug_reports` 테이블 신설(상태: open→pending_deploy→fixed/wontfix), 설정 화면에 "오류 제보" 기능 추가(`BugReportSheet.jsx`, `useBugReports.js`) — 사진 첨부 가능, 과거 제보 목록/상태 확인 가능.
  - `supabase/functions/maintenance-bot` Edge Function 신설: 야간 루틴이 열린 제보·서버 상태 지표(`maintenance_health()` RPC)를 조회하고 판단 결과를 기록하는 부분(cron-secret 인증) + 앱의 [배포] 버튼이 준비된 PR을 실제로 머지하는 부분(사용자 JWT 인증, GitHub API 사용) 둘 다 포함.
  - 배포 승인은 채팅이 아니라 **앱 안의 [배포]/[대기] 버튼으로만** 이뤄지도록 확정 — 야간 루틴은 절대 main에 직접 push하지 않고 `claude/fix-*` 브랜치 + PR만 준비.
  - 이 문서(`maintenance-log.md`) 신설.
- **참고**: 매일 자정 실행되는 부분(Part B)은 claude.ai의 "루틴" 기능으로 사용자가 직접 등록해야 함 — 세부 사항은 `CLAUDE.md`의 "유지보수 자동화" 절 참고.

## 2026-08-29 — 야간 점검 루틴 첫 실행, 네트워크 정책으로 인해 실패

- **트리거**: 새로 등록된 야간 점검 루틴(Part B)의 첫 자동 실행.
- **진단**: 1단계(`maintenance-bot`에 `{"action":"list"}` POST)부터 실패. 이 루틴이 도는 Claude Code 클라우드 실행 환경의 아웃바운드 네트워크 정책이 `heksenfpxztwwstbqkll.supabase.co`로의 HTTPS 연결을 조직 정책으로 차단함(`CONNECT tunnel failed, response 403` — 프록시 게이트웨이가 CONNECT 자체를 거부, DNS/자격증명 문제 아님). 재시도해도 동일하게 거부됨.
- **영향**: 열린 제보(`open_reports`) 목록도, 서버 상태 지표(`health`)도 가져오지 못해 2~3단계(제보 판단/수정, health 이상 조사)를 전혀 수행할 수 없었음. `notify` 액션 호출도 실패해서 앱을 통한 푸시 알림 발송도 안 됨(대신 세션 계정 이메일로 별도 알림 발송함).
- **조치**: 코드 변경 없음(원인이 코드가 아니라 실행 환경의 네트워크 허용 목록이라 이 세션에서 고칠 수 없는 항목). 이 로그 기록만 추가.
- **필요한 사람 조치**: 이 루틴이 등록된 Claude Code 환경(claude.ai/code/routines 또는 환경 설정)에서 아웃바운드 네트워크 정책에 `heksenfpxztwwstbqkll.supabase.co`(또는 `*.supabase.co`)를 허용 목록에 추가해야 다음 실행부터 정상 동작함.

## 2026-08-29 — 야간 점검 루틴 정상 실행, 열린 제보 4건 처리

- **트리거**: 야간 점검 루틴(Part B) 실행. `maintenance-bot`에 `{"action":"list"}` POST 성공(직전 실행의 네트워크 차단 문제가 해소됨) — 열린 제보 4건, health 지표 정상(`daily-check` cron 활성, 최근 응답 전부 200, 구독 4개) 확인.

- **제보 1 — "사진을 선택해 올리면 미리 보기가 안나와요"** (`a171d300`)
  - **진단**: `compressImage()`가 사진을 `<canvas>`에 그려 압축하는데, 아이폰 기본 촬영 포맷인 HEIC는 사파리 외 브라우저(크롬/안드로이드 등)가 디코딩하지 못해 실패함. 실패 시 원본 HEIC 파일을 그대로 업로드하는 폴백이 있었는데, 원본 자체가 HEIC라 결국 어느 기기에서도 영영 렌더링되지 않는 문제였음(코드 주석에도 이 한계가 이미 언급돼 있었음).
  - **조치**: `heic2any`를 의존성에 추가하고, HEIC/HEIF로 판별되면 압축 전에 JPEG로 동적 변환하도록 `src/utils.js`의 `compressImage()` 수정.
  - **PR**: `claude/fix-heic-photo-preview` → https://github.com/chigi430/couple-diary/pull/1 (배포 대기)

- **제보 2 — "상세보기로 보면 사진이 간헐적으로 나오다가 말아요"** (`641b7bd6`)
  - **진단**: `SignedImage.jsx`가 `createSignedUrl`로 받은 1시간짜리 서명 URL을 `Map` 캐시에 무기한 저장해 재사용하는데, 만료 여부를 전혀 확인하지 않았음. 앱을 오래 켜두면 먼저 로드된 사진들의 URL이 서버에서 만료되는데도 캐시값을 계속 써서 사진이 하나둘 깨져 보이는 원인이었음.
  - **조치**: 캐시에 만료 시각을 같이 저장하고, 만료 5분 전부터는 새로 서명 URL을 발급받도록 `src/SignedImage.jsx` 수정.
  - **PR**: `claude/fix-signed-url-cache-expiry` → https://github.com/chigi430/couple-diary/pull/2 (배포 대기)

- **제보 3 — "사진 슬라이드하면 부자연스럽게 반만 슬라이드 되는 현상"** (`44fdae41`)
  - **진단**: `PhotoCarousel.jsx`의 박스 `aspect-ratio`가 활성 슬라이드를 따라가는데, 스와이프 도중 발생하는 모든 `scroll` 이벤트에서 즉시 `active`를 갱신해 손가락으로 미는 중에 박스 높이가 바뀌어버림. 이게 네이티브 `scroll-snap`과 충돌해 슬라이드가 절반에서 멈추는 현상으로 이어짐.
  - **조치**: `onScroll`에서 `active` 갱신을 100ms 디바운스해서 스와이프가 멈춘 뒤에만 높이가 바뀌도록 `src/PhotoCarousel.jsx` 수정.
  - **PR**: `claude/fix-photo-carousel-swipe` → https://github.com/chigi430/couple-diary/pull/3 (배포 대기)

- **제보 4 — "왜 나만 알림안와!!"** (`37cce8cd`)
  - **진단**: 알림 발송 경로(`notify_partner_activity` → `notify_partner` → `send-push` Edge Function)를 코드로 검토했으나 특정 유저 한 명만 선택적으로 알림을 못 받게 만드는 결함을 찾지 못함. 이 계정의 실제 push 구독 상태·브라우저 알림 권한처럼 이 루틴이 접근할 수 없는 개인 계정 데이터를 봐야 확인 가능해 재현 불가.
  - **조치**: `wontfix`로 기록, 앱 설정 → 알림 토글을 껐다 다시 켜서 재구독하거나 브라우저 알림 권한을 확인해보도록 안내.

- **health 지표**: `daily-check` cron 활성(`0 12 * * *`), 최근 http 응답 전부 200, 구독 4개 — 이상 없어 별도 조치 없음.

- **알림**: 버그 3건이 `pending_deploy`로 올라가 있어 maintenance-bot의 `notify` 액션으로 앱을 통해 안내 발송함.

## 2026-08-30 — 야간 점검 루틴 실행, 열린 제보 2건 처리

- **트리거**: 야간 점검 루틴(Part B) 실행. `maintenance-bot`에 `{"action":"list"}` POST 성공 — 열린 제보 2건, health 지표 정상(`daily-check` cron 활성, 최근 http 응답 전부 200, 구독 4개) 확인.

- **제보 1 — "간헐적으로 인트로 화면이 2번 3번 씩 나올때 있어요"** (`f2c1b1c6`)
  - **진단**: `App.jsx`에서 로딩/로그인전/커플연결전 단계는 전부 `<>{intro}...</>`(Fragment)를 루트로 반환하는데, 로그인 완료 후 최종 화면만 `<div style={S.root}>{intro}...</div>`로 루트 타입이 달랐음. React는 컴포넌트가 반환하는 루트 엘리먼트 타입이 바뀌면(Fragment → div) 하위 트리를 통째로 언마운트 후 재마운트하는데, 이 때문에 `Intro` 컴포넌트도 매번 새 인스턴스로 다시 마운트되어 스플래시 애니메이션이 처음부터 재생됨. 세션 로딩 → 로그인 확인 → 프로필 로딩 → (커플 미연결 시 커플연결 화면) → 최종 화면까지 거치는 단계 수에 따라 인트로가 여러 번(2~3번) 보인 것.
  - **조치**: 최종 화면의 반환문도 동일하게 `<>{intro}<div style={S.root}>...</div></>` 형태로 바꿔서 모든 분기에서 루트 타입이 항상 Fragment로 고정되도록 `src/App.jsx` 수정. `Intro`가 앱 로딩 과정 내내 같은 인스턴스로 유지되어 로드당 정확히 한 번만 재생됨.
  - **PR**: `claude/fix-intro-double-play` → https://github.com/chigi430/couple-diary/pull/4 (배포 대기)

- **제보 2 — 상대방 활동 알림 재정의 요청 (수정/저장 버튼 눌렀을 때 알림 가도록)** (`1ab4736b`)
  - **진단**: 일기 상세보기의 "수정"→"완료" 흐름은 `DiaryTab.jsx`가 이미 글/사진이 실제로 바뀐 경우에 한해 `notify_partner_activity`를 1회 호출하도록 구현·문서화돼 있음(시트를 닫거나 앱을 벗어나 컴포넌트가 unmount될 때도 동일하게 발송됨을 코드로 확인). 반면 기분/스탬프만 바꾸거나 기존 일정을 수정하는 경우는 의도적으로 알림을 안 보내게 설계돼 있음(기존 동작 유지로 이미 문서화됨). 제보에 정확히 어떤 조작에서 알림이 누락됐는지 재현 단계가 없어 코드 결함인지 알림 범위를 넓히는 정책 변경이 필요한 건지 판단 불가.
  - **조치**: `wontfix`로 기록, 어떤 화면에서 무엇을 수정·저장했을 때 알림이 안 왔는지 구체적으로 알려달라고 안내.

- **health 지표**: `daily-check` cron 활성, 최근 http 응답 전부 200, 구독 4개 — 이상 없어 별도 조치 없음.

- **알림**: 버그 1건이 `pending_deploy`로 올라가 있어 maintenance-bot의 `notify` 액션으로 앱을 통해 안내 발송함.

## 2026-08-31 — 야간 점검 루틴 실행, 특이사항 없음

- **트리거**: 야간 점검 루틴(Part B) 실행. `maintenance-bot`에 `{"action":"list"}` POST 성공 — 열린 제보 0건.
- **health 지표**: `daily-check` cron 활성(`0 12 * * *`), 최근 http 응답 4건 전부 200, 구독 5개 — 이상 없어 별도 조치 없음.
- **조치**: 처리할 제보도 없고 health 이상도 없어 코드 변경 없음.
- **알림**: maintenance-bot의 `notify` 액션으로 "특이사항 없음" 안내 발송함.

## 2026-09-01 — 야간 점검 루틴 실행, 특이사항 없음

- **트리거**: 야간 점검 루틴(Part B) 실행. `maintenance-bot`에 `{"action":"list"}` POST 성공 — 열린 제보 0건.
- **health 지표**: `daily-check` cron 활성(`0 12 * * *`), 최근 http 응답 2건 전부 200, 구독 5개 — 이상 없어 별도 조치 없음.
- **조치**: 처리할 제보도 없고 health 이상도 없어 코드 변경 없음.
- **알림**: maintenance-bot의 `notify` 액션으로 "특이사항 없음" 안내 발송함.
