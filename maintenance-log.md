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
