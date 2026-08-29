import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { S, css } from "./styles";
import { EMOJI_CHOICES, COLOR_CHOICES } from "./constants";
import logoMark from "./assets/logo-icon.svg";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  const submit = async () => {
    setErr("");
    setInfo("");
    if (!email || !password) {
      setErr("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setErr("표시할 이름을 입력해주세요.");
          setBusy(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim(), emoji, color } },
        });
        if (error) throw error;
        // 이메일 확인이 켜져 있으면 session 이 없습니다.
        if (!data.session) {
          setInfo("가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해주세요.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // 성공 시 App 의 onAuthStateChange 가 알아서 화면을 전환합니다.
    } catch (e) {
      console.error("로그인/가입 실패:", e);
      setErr(translate(e.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.authWrap}>
      <style>{css}</style>
      <div style={S.authBrand}>
        <img src={logoMark} alt="" style={S.authMark} />
        <div style={S.authTitle}>오늘의 우리</div>
        <div style={S.authSub}>함께 쌓아가는 날들</div>
      </div>

      {err && <div style={S.authError}>{err}</div>}
      {info && <div style={{ ...S.authError, background: "#EAF6EC", color: "#2E7D32" }}>{info}</div>}

      {mode === "signup" && (
        <div style={S.authField}>
          <label style={S.authLabel}>표시할 이름</label>
          <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 창환" />
        </div>
      )}

      <div style={S.authField}>
        <label style={S.authLabel}>이메일</label>
        <input style={S.input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div style={S.authField}>
        <label style={S.authLabel}>비밀번호</label>
        <input style={S.input} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" />
      </div>

      {mode === "signup" && (
        <>
          <div style={S.authField}>
            <label style={S.authLabel}>내 이모지</label>
            <div style={S.chooserRow}>
              {EMOJI_CHOICES.map((e) => (
                <button key={e} style={{ ...S.chooser, ...(emoji === e ? S.chooserOn : {}) }} onClick={() => setEmoji(e)}>{e}</button>
              ))}
            </div>
          </div>
          <div style={S.authField}>
            <label style={S.authLabel}>내 색</label>
            <div style={S.chooserRow}>
              {COLOR_CHOICES.map((c) => (
                <div key={c} onClick={() => setColor(c)} style={{ ...S.colorDot, background: c, ...(color === c ? S.colorDotOn : {}) }} />
              ))}
            </div>
          </div>
        </>
      )}

      <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} onClick={submit} disabled={busy}>
        {busy ? "잠시만요…" : mode === "signup" ? "가입하기" : "로그인"}
      </button>

      <div style={S.authSwap}>
        {mode === "signup" ? "이미 계정이 있나요? " : "처음이신가요? "}
        <button style={S.authSwapLink} onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setErr(""); setInfo(""); }}>
          {mode === "signup" ? "로그인" : "가입하기"}
        </button>
      </div>
    </div>
  );
}

function translate(msg = "") {
  if (msg.includes("Invalid login")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (msg.includes("already registered")) return "이미 가입된 이메일이에요. 로그인해주세요.";
  if (msg.includes("at least 6")) return "비밀번호는 6자 이상이어야 해요.";
  if (msg.includes("valid email")) return "이메일 형식을 확인해주세요.";
  return "문제가 발생했어요. 잠시 후 다시 시도해주세요.";
}
