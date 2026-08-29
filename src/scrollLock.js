import { useEffect } from "react";

// 시트/오버레이가 열려 있는 동안 뒤 배경(window) 스크롤을 막는다.
// 여러 오버레이가 겹쳐도(예: 상세보기 위에 확인창) 안전하도록 참조 카운트를 쓴다.
// 배경 스크롤을 막으면 하단 탭바·"최근 우리" 스트립의 스크롤 방향 감지(useHideOnScroll)도
// 같이 멈춰서, 시트를 넘길 때 뒤에서 탭바가 움직이던 문제가 사라진다.
let locks = 0;
let prev = { overflow: "", paddingRight: "" };

export function lockScroll() {
  if (locks === 0) {
    const b = document.body.style;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    prev = { overflow: b.overflow, paddingRight: b.paddingRight };
    b.overflow = "hidden";
    if (sbw > 0) b.paddingRight = `${sbw}px`; // 데스크톱에서 스크롤바 사라지며 생기는 밀림 방지
  }
  locks += 1;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    const b = document.body.style;
    b.overflow = prev.overflow;
    b.paddingRight = prev.paddingRight;
  }
}

export function useScrollLock() {
  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);
}
