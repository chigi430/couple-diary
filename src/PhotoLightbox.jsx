import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { S } from "./styles";
import SignedImage, { getSignedUrl, prefetchSignedUrls } from "./SignedImage";
import { IconX, IconShare } from "./Icons";
import { toast } from "./toast";
import { useScrollLock } from "./scrollLock";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// 원본 사진을 꽉 채워 보여주고, 핀치줌/더블탭줌/드래그 이동, 좌우 스와이프로 사진 넘기기, 아래로 스와이프해서 닫기를 지원.
export default function PhotoLightbox({ photos, initialIndex, onClose }) {
  useScrollLock();
  const [index, setIndex] = useState(initialIndex);
  const [xf, setXf] = useState({ scale: 1, tx: 0, ty: 0 });
  const [saving, setSaving] = useState(false);
  const stageRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef({ mode: "idle" });
  const lastTap = useRef({ time: 0, x: 0, y: 0 });

  // 진입하자마자 이 묶음 전체의 서명 URL을 한 배치로 받아둔다 (넘길 때마다 왕복하지 않도록).
  useEffect(() => {
    prefetchSignedUrls(photos.map((p) => p.storage_path));
  }, [photos]);

  // 현재 사진 양옆(±2)을 실제로 내려받아 브라우저 캐시에 넣어둠 — 스와이프 시 즉시 표시.
  const neighbors = [index - 2, index - 1, index + 1, index + 2].filter((i) => i >= 0 && i < photos.length);

  const resetZoom = () => setXf({ scale: 1, tx: 0, ty: 0 });

  const goTo = (i) => {
    setIndex(i);
    resetZoom();
  };

  const clampPan = (scale, tx, ty) => {
    const stage = stageRef.current;
    if (!stage) return { tx, ty };
    const maxX = (stage.clientWidth * (scale - 1)) / 2 + 40;
    const maxY = (stage.clientHeight * (scale - 1)) / 2 + 40;
    return { tx: clamp(tx, -maxX, maxX), ty: clamp(ty, -maxY, maxY) };
  };

  const onPointerDown = (ev) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

    if (pointers.current.size === 1) {
      const now = Date.now();
      const p = { x: ev.clientX, y: ev.clientY };
      if (now - lastTap.current.time < 300 && dist(p, lastTap.current) < 30) {
        setXf((prev) => (prev.scale > 1.05 ? { scale: 1, tx: 0, ty: 0 } : { scale: 2.4, tx: 0, ty: 0 }));
        lastTap.current = { time: 0, x: 0, y: 0 };
        gesture.current = { mode: "idle" };
        return;
      }
      lastTap.current = { time: now, x: p.x, y: p.y };
      gesture.current = { mode: xf.scale > 1.05 ? "pan" : "swipe", startX: p.x, startY: p.y, startTx: xf.tx, startTy: xf.ty, dx: 0, dy: 0 };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { mode: "pinch", startDist: dist(a, b), startScale: xf.scale, startTx: xf.tx, startTy: xf.ty };
    }
  };

  const onPointerMove = (ev) => {
    if (!pointers.current.has(ev.pointerId)) return;
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const g = gesture.current;

    if (g.mode === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const nextScale = clamp(g.startScale * (dist(a, b) / g.startDist), MIN_SCALE, MAX_SCALE);
      setXf({ scale: nextScale, ...clampPan(nextScale, g.startTx, g.startTy) });
    } else if (g.mode === "pan") {
      const p = [...pointers.current.values()][0];
      const tx = g.startTx + (p.x - g.startX);
      const ty = g.startTy + (p.y - g.startY);
      setXf((prev) => ({ scale: prev.scale, ...clampPan(prev.scale, tx, ty) }));
    } else if (g.mode === "swipe") {
      const p = [...pointers.current.values()][0];
      g.dx = p.x - g.startX;
      g.dy = p.y - g.startY;
    }
  };

  const endGesture = () => {
    const g = gesture.current;
    if (g.mode === "swipe") {
      const dx = g.dx || 0;
      const dy = g.dy || 0;
      if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) {
        onClose();
        return;
      }
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0 && index < photos.length - 1) goTo(index + 1);
        else if (dx > 0 && index > 0) goTo(index - 1);
      }
    }
    if (xf.scale < 1.02) resetZoom();
    gesture.current = { mode: "idle" };
  };

  const onPointerUp = (ev) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size === 0) {
      endGesture();
    } else if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      gesture.current = { mode: xf.scale > 1.05 ? "pan" : "swipe", startX: p.x, startY: p.y, startTx: xf.tx, startTy: xf.ty, dx: 0, dy: 0 };
    }
  };

  const photo = photos[index];

  const shareOrSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const url = await getSignedUrl(photo.storage_path);
      if (!url) throw new Error("no url");
      const blob = await (await fetch(url)).blob();
      const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const file = new File([blob], `photo-${photo.id || Date.now()}.${ext}`, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
        toast("사진을 저장했어요 ✓");
      }
    } catch (e) {
      if (e?.name !== "AbortError") toast("사진을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div style={S.lightboxOverlay} onClick={(ev) => ev.stopPropagation()}>
      <div style={S.lightboxTopBar}>
        <span style={S.lightboxCounter}>{photos.length > 1 ? `${index + 1} / ${photos.length}` : ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.lightboxClose, opacity: saving ? 0.6 : 1 }} onClick={shareOrSave} disabled={saving}>
            <IconShare size={16} />
          </button>
          <button style={S.lightboxClose} onClick={onClose}><IconX size={16} /></button>
        </div>
      </div>
      <div
        ref={stageRef}
        style={S.lightboxStage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <SignedImage
          key={photo.id}
          path={photo.storage_path}
          loading="eager"
          style={{
            ...S.lightboxImg,
            transform: `translate(-50%, -50%) translate(${xf.tx}px, ${xf.ty}px) scale(${xf.scale})`,
            transition: gesture.current.mode === "idle" ? "transform .2s ease" : "none",
          }}
        />
      </div>

      {/* 양옆 사진 프리로더 — 화면엔 안 보이지만 브라우저가 받아둔다 */}
      <div aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        {neighbors.map((i) => (
          <SignedImage key={photos[i].id} path={photos[i].storage_path} loading="eager" />
        ))}
      </div>
    </div>,
    document.body
  );
}
