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

## 핵심 기능 (구현 완료)

- 로그인/회원가입, 초대코드로 커플 연결
- 달력: 날짜별 사진·기분·메모 기록 (보기 모드/수정 모드 분리, 여러 장 사진은 스와이프 캐러셀)
- 같은 달력에 TimeTree 스타일 일정 막대 표시 + day-tap 팝업에서 "일정보기"/"오늘의 우리" 탭 전환
- 타임라인 탭: 목록 / 추억 모아보기(그리드) / 지도(다녀온 곳 요약 + 접이식 지도) 3가지 보기
- 설정 탭: 프로필 사진 업로드, 이름/이모지/색 변경, 로그아웃
- PWA (홈 화면에 앱처럼 설치 가능)
- 사진은 클라이언트 리사이즈·압축 후 비공개 버킷 저장 + 서명 URL 조회
- 실시간 공유 (Supabase Realtime)

## 앞으로 할 일 (TODO)

- 공휴일 데이터(`src/constants.js`, 현재 2026년 예시)를 공공데이터포털 API로 자동화할지 검토
- (아이디어만 논의, 미착수) 그룹/단체용으로 확장 — 한 사람이 여러 그룹에 속하는 구조로 바꿔야 함

## 다른 PC에서 이어서 작업하기

이 저장소는 Public GitHub라 코드는 그대로 클론하면 되지만, **`.env` 파일은 git에 없어서 새 PC마다 직접 만들어야 함**:

1. Node.js, Git, VSCode + Claude Code 확장 설치
2. `git clone https://github.com/chigi430/couple-diary.git` 후 `npm install`
3. `.env.example`을 복사해서 `.env`로 만들고 실제 값 채우기:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` — Supabase 대시보드 → Settings → API Keys
   - `VITE_KAKAO_MAP_APP_KEY` — Kakao Developers → 내 애플리케이션 → 앱 키 → JavaScript 키
4. `npm run dev`로 실행

Supabase/Vercel/Kakao 설정은 전부 클라우드에 이미 되어 있어서 추가 설정 없이 그대로 이어짐 (Kakao Web 플랫폼 도메인에 `http://localhost:5173`이 등록돼 있어 포트만 같으면 어느 PC에서든 지도 기능도 동작).

## 작업 시 지켜줄 것

- 코드를 수정하기 전에 무엇을 왜 바꾸는지 먼저 설명할 것.
- 큰 변경은 한 번에 하지 말고 단계별로 진행하고, 각 단계마다 확인받을 것.
- Supabase/Kakao 키 등 민감한 값은 절대 코드나 이 문서에 하드코딩하지 말고 환경변수(.env)로 관리할 것 (이 저장소는 Public이라 특히 주의).
- 설명은 한국어로, 초보 친화적으로.
- `npm run build`/`dev`/`preview`는 매번 승인받지 않고 바로 실행 (Bash 도구 사용 — PowerShell 도구는 권한 규칙이 안 먹힘).

## 환경변수 (참고)

- `.env`는 `.gitignore`에 포함되어 git에 올라가지 않음. 값은 `.env.example` 형식 참고.
