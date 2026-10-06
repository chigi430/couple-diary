import { useEffect, useRef } from "react";

// 안드로이드/브라우저 "뒤로가기"로 앱이 꺼지지 않고, 열려 있는 화면(시트·팝업·탭)을 하나씩 닫게 한다.
// 화면이 열릴 때 history 에 한 칸을 쌓고(pushState), 뒤로가기(popstate)가 오면 맨 위 화면의 close 를 부른다.
// 버튼 등으로 직접 닫힌 화면은 자기 몫의 history 칸을 history.back() 으로 되돌려 둔다.
// history.back() 은 비동기라, 그 사이에 새 화면이 열리면 push 를 popstate 이후로 미룬다(순서 꼬임 방지).
const stack = []; // 열린 화면들 (아래 → 위)
const queued = []; // history.back() 처리 대기 중이라 아직 pushState 못 한 화면
let pendingBacks = 0; // 우리가 직접 부른 history.back() 중 아직 popstate 가 안 온 개수
let listening = false;
// 맨 바닥(오늘 탭, 열린 화면 없음)에서 뒤로가기 → 바로 종료하지 않고 rootHandler(종료 확인창)를 부른다.
// 이를 위해 history 맨 아래에 "가드" 칸을 하나 깔아둔다.
const GUARD = { guard: true };
let guardArmed = false;
let rootHandler = null;
let exiting = false;

function pushEntry(entry) {
  if (pendingBacks > 0) queued.push(entry);
  else window.history.pushState({ layer: true }, "");
}

function onPopState() {
  if (exiting) {
    window.history.back(); // 종료 중: 앱 밖으로 나갈 때까지 계속 뒤로
    return;
  }
  if (pendingBacks > 0) {
    pendingBacks--;
    if (pendingBacks === 0) {
      queued.splice(0).forEach(() => window.history.pushState({ layer: true }, ""));
    }
    return;
  }
  const top = stack.pop();
  if (!top) {
    // 열린 화면 없음 = 가드 칸이 소비됨 → 종료 확인. (가드가 없으면 브라우저 기본 동작 = 앱 종료)
    if (guardArmed && rootHandler) {
      guardArmed = false;
      rootHandler();
    }
    return;
  }
  // 입력 중이던 칸은 blur 로 저장 처리(onBlur 자동저장)를 먼저 태운 뒤 닫는다
  if (document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
  top.close();
}

function ensureListener() {
  if (listening) return;
  window.addEventListener("popstate", onPopState);
  listening = true;
}

// 화면 하나를 뒤로가기 대상으로 등록. 반환값은 "버튼 등으로 직접 닫혔을 때" 부를 해제 함수.
export function pushBackLayer(close) {
  ensureListener();
  const entry = { close };
  stack.push(entry);
  pushEntry(entry);
  return () => {
    const i = stack.indexOf(entry);
    if (i === -1) return; // 이미 뒤로가기로 닫힘 (history 칸도 이미 소비됨)
    stack.splice(i, 1);
    const q = queued.indexOf(entry);
    if (q !== -1) {
      queued.splice(q, 1); // 아직 history 에 안 쌓였으니 되돌릴 것도 없음
      return;
    }
    pendingBacks++;
    window.history.back();
  };
}

// 바닥에서 뒤로가기를 눌렀을 때 부를 함수(종료 확인창 열기) 등록
export function setRootBackHandler(fn) {
  rootHandler = fn;
}

// 가드 칸 깔기 (앱 시작 시 + 종료 확인창에서 '취소'했을 때). 이미 깔려 있으면 무시.
export function armRootGuard() {
  ensureListener();
  if (guardArmed) return;
  guardArmed = true;
  pushEntry(GUARD);
}

// 종료 확인창의 '종료': 앱이 쌓아둔 history 를 전부 거슬러 올라가 앱 밖으로 나간다
// (설치형 PWA 는 첫 화면보다 더 뒤로 가면 앱이 닫힘). 일반 브라우저 탭처럼 더 갈 곳이 없어
// 안 나가지면 상태를 초기화하고 onFail 을 부른다.
export function exitApp(onFail) {
  exiting = true;
  window.history.back();
  setTimeout(() => {
    if (document.visibilityState !== "visible") return; // 나가는 중/나감
    exiting = false;
    stack.splice(0); // 남은 화면의 history 칸은 이미 다 소비됨 → 해제 함수가 back() 하지 않게
    queued.splice(0);
    pendingBacks = 0;
    guardArmed = false;
    armRootGuard();
    if (onFail) onFail();
  }, 700);
}

// active 인 동안 뒤로가기를 누르면 onClose 를 부른다.
export function useBackClose(onClose, active = true) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    return pushBackLayer(() => closeRef.current && closeRef.current());
  }, [active]);
}
