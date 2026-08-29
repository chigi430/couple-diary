import { useCallback, useRef } from "react";

const CLOSE_THRESHOLD = 78; // 이만큼 내리면 닫힘
const FLICK_VELOCITY = 0.4; // px/ms — 살짝만 내려도 빠르게 톡 내리면 닫힘
const FADE_DIST = 150; // 이 거리쯤 내리면 뒤 배경이 거의 투명
const OVERLAY_ALPHA = 0.42;
const SNAP_EASE = "transform .32s cubic-bezier(.22,1,.36,1)";
const FADE_EASE = "background .32s ease";

// 시트 상단 핸들바를 아래로 끌면 닫히는 동작.
// 드래그 중에는 React 리렌더 없이 ref로 transform 을 직접(rAF) 갱신해서,
// 사진이 많은 무거운 시트(DaySheet 등)에서도 손가락을 부드럽게 따라오게 한다.
export function useSheetDrag(onClose) {
  const sheetRef = useRef(null);
  const overlayRef = useRef(null);

  const dragging = useRef(false);
  const startY = useRef(0);
  const curY = useRef(0);
  const last = useRef({ y: 0, t: 0 });
  const raf = useRef(0);

  const paint = useCallback(() => {
    raf.current = 0;
    const y = curY.current;
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (sheet) sheet.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
    if (overlay) {
      const a = OVERLAY_ALPHA * (1 - Math.min(1, Math.max(0, y) / FADE_DIST));
      overlay.style.background = `rgba(58,34,28,${a})`;
    }
  }, []);

  const schedulePaint = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  }, [paint]);

  const setEasing = (on) => {
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (sheet) {
      sheet.style.transition = on ? SNAP_EASE : "none";
      sheet.style.willChange = on ? "" : "transform";
    }
    if (overlay) overlay.style.transition = on ? FADE_EASE : "none";
  };

  const onPointerDown = useCallback((ev) => {
    dragging.current = true;
    startY.current = ev.clientY;
    curY.current = 0;
    last.current = { y: ev.clientY, t: performance.now() };
    setEasing(false);
    ev.currentTarget.setPointerCapture(ev.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (ev) => {
      if (!dragging.current) return;
      const dy = ev.clientY - startY.current;
      // 위로는 고무줄처럼 살짝만, 아래로는 1:1로 따라온다
      curY.current = dy < 0 ? dy * 0.22 : dy;
      last.current = { y: ev.clientY, t: performance.now() };
      schedulePaint();
    },
    [schedulePaint]
  );

  const endDrag = useCallback(
    (ev) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      }
      const dt = performance.now() - last.current.t;
      const v = ev && dt > 0 ? (ev.clientY - last.current.y) / dt : 0;
      const y = curY.current;
      const shouldClose = y > CLOSE_THRESHOLD || (y > 6 && v > FLICK_VELOCITY);

      setEasing(true);
      if (shouldClose) {
        // 아래로 쭉 미끄러뜨린 뒤 실제로 닫는다
        const h = (sheetRef.current && sheetRef.current.offsetHeight) || 640;
        curY.current = h + 60;
        paint();
        if (overlayRef.current) overlayRef.current.style.background = "rgba(58,34,28,0)";
        window.setTimeout(onClose, 240);
      } else {
        curY.current = 0;
        paint();
      }
    },
    [onClose, paint]
  );

  return {
    sheetRef,
    overlayRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    handleStyle: { touchAction: "none", cursor: "grab" },
    // 하위호환용(예전엔 style 로 넘겼음) — 지금은 ref 로 직접 그리므로 비어있음
    sheetStyle: undefined,
    overlayStyle: undefined,
  };
}
