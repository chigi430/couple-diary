import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { S, css } from "./styles";

export default function CoupleGate({ onDone, onSignOut }) {
  const [anniversary, setAnniversary] = useState("");
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setErr("");
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("create_couple", {
        anniversary: anniversary || null,
      });
      if (error) throw error;
      setCreatedCode(data); // 초대코드
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    setErr("");
    if (!code.trim()) {
      setErr("초대코드를 입력해주세요.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("join_couple", { code: code.trim() });
      if (error) throw error;
      if (data === "ok") {
        onDone();
      } else if (data === "expired") {
        setErr("이 코드는 유효기간(1시간)이 지났어요. 상대에게 새 코드를 다시 받아주세요.");
      } else {
        setErr("코드를 찾을 수 없어요. 다시 확인해주세요.");
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(createdCode);
  };

  return (
    <div style={{ ...S.root, paddingTop: 40 }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={S.authMark}>◍</div>
        <div style={S.authTitle}>우리 공간 만들기</div>
        <div style={S.authSub}>둘을 하나로 묶을 커플 공간이 필요해요.</div>
      </div>

      {err && <div style={S.authError}>{err}</div>}

      {createdCode ? (
        <div style={S.gateOption}>
          <div style={S.gateTitle}>공간이 만들어졌어요 🎉</div>
          <div style={S.gateDesc}>아래 초대코드를 상대에게 알려주세요. 상대가 가입 후 이 코드로 참여하면 같은 공간에 묶입니다.</div>
          <div style={S.codeBig}>{createdCode}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{ ...S.editBtn, flex: 1 }} onClick={copy}>코드 복사</button>
            <button style={{ ...S.saveBtn, flex: 1, marginTop: 0 }} onClick={onDone}>들어가기</button>
          </div>
        </div>
      ) : (
        <>
          <div style={S.gateOption}>
            <div style={S.gateTitle}>새로 만들기</div>
            <div style={S.gateDesc}>내가 공간을 만들고 상대를 초대해요.</div>
            <label style={S.authLabel}>사귀기 시작한 날 (선택)</label>
            <input style={S.input} type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
            <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} onClick={create} disabled={busy}>
              {busy ? "만드는 중…" : "우리 공간 만들기"}
            </button>
          </div>

          <div style={S.gateOption}>
            <div style={S.gateTitle}>초대코드로 참여</div>
            <div style={S.gateDesc}>상대가 만든 공간에 코드로 들어가요.</div>
            <input style={{ ...S.input, textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center" }} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="예: A1B2C3" maxLength={6} />
            <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} onClick={join} disabled={busy}>
              {busy ? "참여 중…" : "참여하기"}
            </button>
          </div>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button style={S.signOut} onClick={onSignOut}>로그아웃</button>
      </div>
    </div>
  );
}
