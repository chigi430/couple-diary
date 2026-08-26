import { useEffect, useRef, useState } from "react";

// 아래로 스크롤하면 true(숨김), 위로 스크롤하면 false(보임)를 반환.
// 스크롤 "거리"가 아니라 "방향"으로 판단해서, 모바일 관성 스크롤처럼 순식간에 수백 px가
// 움직이는 상황에서도 항상 일관되게 동작함. 맨 위 근처(topGuard 이내)에서는 항상 보이게 고정.
export function useHideOnScroll({ threshold = 8, topGuard = 16 } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= topGuard) {
          setHidden(false);
        } else {
          const diff = y - lastY.current;
          if (diff > threshold) setHidden(true);
          else if (diff < -threshold) setHidden(false);
        }
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topGuard]);

  return hidden;
}
