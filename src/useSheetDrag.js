import { useRef, useState } from "react";

const CLOSE_THRESHOLD = 110;
const FADE_DIST = 160;
const OVERLAY_ALPHA = 0.42;

// 시트 상단 핸들바를 아래로 드래그하면 닫히는 동작 (핸들에서 시작한 드래그만 반응 — 본문 스크롤/입력과 안 겹치게).
export function useSheetDrag(onClose) {
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);

  const onPointerDown = (ev) => {
    dragging.current = true;
    startY.current = ev.clientY;
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };

  const onPointerMove = (ev) => {
    if (!dragging.current) return;
    setDragY(Math.max(0, ev.clientY - startY.current));
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setDragY((y) => {
      if (y > CLOSE_THRESHOLD) {
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
