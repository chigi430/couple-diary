import React, { useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { S } from "./styles";
import { EMOJI_CHOICES, COLOR_CHOICES } from "./constants";
import { compressImage, uuid } from "./utils";
import Avatar from "./Avatar";

export default function Settings({ profile, onSaved, onSignOut }) {
  const fileRef = useRef(null);
  const [name, setName] = useState(profile?.display_name || "");
  const [emoji, setEmoji] = useState(profile?.emoji || EMOJI_CHOICES[0]);
  const [color, setColor] = useState(profile?.color || COLOR_CHOICES[0]);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  const onPickAvatar = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const { blob, ext } = await compressImage(file, 512, 0.85);
      const path = `${profile.id}/${uuid()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      if (dbErr) throw dbErr;
      setAvatarUrl(url);
      await onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setErr("표시할 이름을 입력해주세요.");
      return;
    }
    setErr("");
    setSaved(false);
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim(), emoji, color })
      .eq("id", profile.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    await onSaved();
    setSaved(true);
  };

  return (
    <div style={S.body}>
      <div style={S.settingsCard}>
        {err && <div style={S.authError}>{err}</div>}

        <div style={S.avatarPickWrap}>
          <button style={S.avatarPickBtn} onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}>
            <Avatar person={{ avatar_url: avatarUrl, emoji, color }} size={84} />
            <span style={S.avatarEditBadge}>{uploading ? "…" : "📷"}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} style={{ display: "none" }} />
        </div>

        <div style={S.authField}>
          <label style={S.authLabel}>표시할 이름</label>
          <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 창환" />
        </div>

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

        <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} onClick={save} disabled={busy}>
          {busy ? "저장 중…" : saved ? "저장됨 ✓" : "저장하기"}
        </button>

        <button style={S.settingsSignOut} onClick={onSignOut}>로그아웃</button>
      </div>
    </div>
  );
}
