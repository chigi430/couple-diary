import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import logoMark from "./assets/logo-icon.svg";

// 앱을 켤 때 잠깐 보여주는 인트로(스플래시).
// - App이 처음 마운트될 때 한 번만 보임(탭 이동 등으로는 다시 안 나옴)
// - 최소 MIN_MS 동안 보여주고, 세션/프로필 준비가 끝나면(hold=false) 서서히 사라짐
const MIN_MS = 1400;
const FADE_MS = 420;

export default function Intro({ hold, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    let fadeTimer;
    const tick = () => {
      const elapsed = Date.now() - mountedAt.current;
      if (elapsed >= MIN_MS && !hold) {
        setLeaving(true);
        fadeTimer = setTimeout(onDone, FADE_MS);
      } else {
        fadeTimer = setTimeout(tick, 120);
      }
    };
    tick();
    return () => clearTimeout(fadeTimer);
  }, [hold, onDone]);

  return createPortal(
    <div style={{ ...st.overlay, opacity: leaving ? 0 : 1 }} aria-hidden="true">
      <style>{keyframes}</style>
      <div style={st.inner}>
        <img src={logoMark} alt="" className="intro-mark" style={st.mark} />
        <div className="intro-name" style={st.name}>오늘의 우리</div>
        <div className="intro-sub" style={st.sub}>함께 쌓아가는 날들</div>
      </div>
    </div>,
    document.body
  );
}

const keyframes = `
@keyframes introPop {
  from { opacity: 0; transform: translateY(10px) scale(.86); }
  60%  { opacity: 1; }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes introRise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .intro-mark, .intro-name, .intro-sub { animation: none !important; }
}
`;

const st = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg1, #FBF4EE)",
    transition: `opacity ${FADE_MS}ms ease`,
  },
  inner: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: -24 },
  mark: {
    width: 96,
    height: 96,
    display: "block",
    filter: "drop-shadow(0 12px 28px rgba(176,60,103,0.30))",
    animation: "introPop .6s cubic-bezier(.22,1,.36,1) both",
  },
  name: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "var(--text-h1, #5A2A3A)",
    animation: "introRise .5s ease .18s both",
  },
  sub: {
    marginTop: 6,
    fontSize: 12.5,
    color: "var(--text-muted, #A8968D)",
    animation: "introRise .5s ease .3s both",
  },
};
