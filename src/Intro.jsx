import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import logoMark from "./assets/logo-icon.svg";

// 앱을 켤 때 잠깐 보여주는 인트로(스플래시).
// - App이 처음 마운트될 때 한 번만 보임(탭 이동 등으로는 다시 안 나옴)
// - 가운데에 로고가 뜬 뒤, 헤더 좌상단 로고 자리로 날아가 "박히는" 연출로 사라짐
//   (헤더가 아직 없는 화면 — 로그인 전 등 — 에서는 그냥 페이드아웃)
const CENTER_MS = 1050; // 가운데에서 머무는 시간
const FLY_MS = 560; // 좌상단으로 날아가는 시간
const FADE_MS = 380; // 헤더가 없을 때 단순 페이드 시간
const MAX_WAIT = 2600; // 헤더(날아갈 목표)가 나타나길 기다리는 최대 시간

export default function Intro({ hold, onDone }) {
  const [phase, setPhase] = useState("center"); // center → fly | fade
  const [fly, setFly] = useState(null); // { dx, dy, scale }
  const [flyGo, setFlyGo] = useState(false); // transition 준비 프레임을 한 번 거친 뒤 true
  const markRef = useRef(null);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (phase !== "center") return undefined;
    let timer;
    const tick = () => {
      const elapsed = Date.now() - mountedAt.current;
      if (elapsed < CENTER_MS || hold) {
        timer = setTimeout(tick, 100);
        return;
      }
      const target = document.querySelector("[data-brand-mark]");
      const from = markRef.current && markRef.current.getBoundingClientRect();
      const to = target && target.getBoundingClientRect();
      // 헤더가 아직 안 그려졌으면 잠깐 더 기다렸다가(로그인/프로필 로딩 중) 재시도
      if ((!to || to.width === 0) && elapsed < MAX_WAIT) {
        timer = setTimeout(tick, 100);
        return;
      }
      if (from && to && to.width > 0) {
        const scale = to.width / from.width;
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        setFly({ dx, dy, scale });
        setPhase("fly");
        // transition을 켠 상태로 한 프레임 그린 뒤 목표 transform을 적용해야 애니메이션이 돈다
        requestAnimationFrame(() => requestAnimationFrame(() => setFlyGo(true)));
        timer = setTimeout(onDone, FLY_MS + 90);
      } else {
        setPhase("fade");
        timer = setTimeout(onDone, FADE_MS);
      }
    };
    tick();
    return () => clearTimeout(timer);
    // phase는 일부러 의존성에서 뺌 — fly로 넘어간 뒤 이 이펙트가 다시 돌면
    // 예약해둔 onDone 타이머가 취소돼 인트로가 안 사라질 수 있음. onDone은 App에서 useCallback으로 고정.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hold, onDone]);

  const leaving = phase !== "center";
  const overlayStyle = {
    ...st.overlay,
    // fly 단계에서는 배경만 사라지고 로고는 또렷하게 남아 헤더 자리로 이동한다
    opacity: phase === "fade" ? 0 : 1,
    background: phase === "fly" ? "transparent" : "var(--bg1, #FBF4EE)",
    pointerEvents: phase === "fly" ? "none" : "auto",
    transition:
      phase === "fly" ? `background ${Math.round(FLY_MS * 0.7)}ms ease` : `opacity ${FADE_MS}ms ease`,
  };
  const markStyle = {
    ...st.mark,
    transform:
      phase === "fly" && fly && flyGo
        ? `translate(${fly.dx}px, ${fly.dy}px) scale(${fly.scale})`
        : "translate(0,0) scale(1)",
    transition: phase === "fly" ? `transform ${FLY_MS}ms cubic-bezier(.5,0,.2,1)` : "none",
    animation: phase === "center" ? "introPop .6s cubic-bezier(.22,1,.36,1) both" : "none",
  };

  return createPortal(
    <div style={overlayStyle} aria-hidden="true">
      <style>{keyframes}</style>
      <div style={st.inner}>
        <img ref={markRef} src={logoMark} alt="" className="intro-mark" style={markStyle} />
        <div
          className="intro-name"
          style={{ ...st.name, opacity: leaving ? 0 : 1, transition: "opacity .22s ease" }}
        >
          오늘의 우리
        </div>
        <div
          className="intro-sub"
          style={{ ...st.sub, opacity: leaving ? 0 : 1, transition: "opacity .22s ease" }}
        >
          함께 쌓아가는 날들
        </div>
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
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginTop: -24,
  },
  mark: {
    width: 96,
    height: 96,
    display: "block",
    transformOrigin: "center center",
    filter: "drop-shadow(0 12px 28px rgba(176,60,103,0.30))",
    willChange: "transform",
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
