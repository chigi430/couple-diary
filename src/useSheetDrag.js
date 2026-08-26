import { useRef, useState } from "react";

const CLOSE_THRESHOLD = 60; // 이 거리 이상 끌면 닫힘 (기존 110 → 좀 더 조금만 끌어도 닫히게)
const FLICK_VELOCITY = 0.5; // px/ms — 많이 안 끌어도 빠르게 톡 내리면 닫히도록
const FADE_DIST = 120;
const OVERLAY_ALPHA = 0.42;

// 시트 상단 핸들바를 아래로 드래그하면 닫히는 동작 (핸들에서 시작한 드래그만 반응 — 본문 스크롤/입력과 안 겹치게).
export function useSheetDrag(onClose) {
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);
  const lastMove = useRef({ y: 0, t: 0 });

  const onPointerDown = (ev) => {
    dragging.current = true;
    startY.current = ev.clientY;
    lastMove.current = { y: ev.clientY, t: performance.now() };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };

  const onPointerMove = (ev) => {
    if (!dragging.current) return;
    lastMove.current = { y: ev.clientY, t: performance.now() };
    setDragY(Math.max(0, ev.clientY - startY.current));
  };

  const endDrag = (ev) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dt = performance.now() - lastMove.current.t;
    const velocity = ev && dt > 0 ? (ev.clientY - lastMove.current.y) / dt : 0;
    setDragY((y) => {
      if (y > CLOSE_THRESHOLD || (y > 10 && velocity > FLICK_VELOCITY)) {
        onClose();
      }
      return 0;
    });
  };

  return {
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    handleStyle: { touchAction: "none", cursor: "grab" },
    sheetStyle: {
      transform: dragY ? `translateY(${dragY}px)` : undefined,
      transition: dragY ? "none" : "transform .2s ease",
    },
    overlayStyle: {
      background: `rgba(58,34,28,${OVERLAY_ALPHA * (1 - Math.min(1, dragY / FADE_DIST))})`,
      transition: dragY ? "none" : "background .2s ease",
    },
  };
}
