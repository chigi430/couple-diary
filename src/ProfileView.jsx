import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabaseClient";
import { compressImage, uuid } from "./utils";
import { toast } from "./toast";
import Avatar from "./Avatar";
import MoreMenu from "./MoreMenu";
import { IconX, IconCalendar, IconList } from "./Icons";

// 카카오톡 프로필처럼 전체화면으로 상대(또는 내) 프로필을 보여주는 오버레이.
// 전체화면 fixed 오버레이라 CLAUDE.md 규칙대로 반드시 Portal 로 렌더한다.
export default function ProfileView({
  person,
  isMe,
  onEditProfile,
  onGoTimeline,
  onOpenAnniversary,
  onRefresh,
  onClose,
}) {
  const fileRef = useRef(null);
  const [cover, setCover] = useState(person?.cover_url || "");
  const [uploading, setUploading] = useState(false);
  const [poking, setPoking] = useState(false);
  const [zoom, setZoom] = useState(false);

  const name = person?.display_name || (isMe ? "나" : "상대");
  const color = person?.color || "#D98763";
  const status = (person?.status_message || "").trim();
  const bday = birthdayLabel(person?.birthday);

  const pickCover = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { blob, ext } = await compressImage(file, 1280, 0.8);
      const path = `${person.id}/cover-${uuid()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ cover_url: url }).eq("id", person.id);
      if (dbErr) throw dbErr;
      setCover(url);
      onRefresh && onRefresh();
      toast("배경 사진을 바꿨어요 ✓");
    } catch (e) {
      console.error("배경 사진 업로드 실패:", e);
      toast("배경 사진을 올리지 못했어요.");
    } finally {
      setUploading(false);
    }
  };

  const removeCover = async () => {
    const { error } = await supabase.from("profiles").update({ cover_url: null }).eq("id", person.id);
    if (error) {
      toast("배경 사진을 지우지 못했어요.");
      return;
    }
    setCover("");
    onRefresh && onRefresh();
    toast("배경 사진을 기본으로 되돌렸어요 ✓");
  };

  const poke = async () => {
    if (poking) return;
    setPoking(true);
    try {
      const { data, error } = await supabase.rpc("poke_partner");
      if (error) throw error;
      if (data === "ok") toast("콕 찔렀어요 💗");
      else if (data === "cooldown") toast("방금 보냈어요. 잠시 후 다시 보낼 수 있어요.");
      else toast("아직 연결된 상대가 없어요.");
    } catch (e) {
      console.error("콕 찌르기 실패:", e);
      toast("잠시 후 다시 시도해주세요.");
    } finally {
      setTimeout(() => setPoking(false), 1500);
    }
  };

  const moreItems = [
    { label: uploading ? "올리는 중…" : "배경 사진 바꾸기", onClick: () => fileRef.current && fileRef.current.click() },
    ...(cover ? [{ label: "배경 사진 없애기", onClick: removeCover, danger: true }] : []),
  ];

  return createPortal(
    <div style={st.overlay} onClick={(e) => e.stopPropagation()}>
      {cover ? (
        <img src={cover} alt="" style={st.coverImg} />
      ) : (
        <div style={{ ...st.coverImg, background: `linear-gradient(160deg, ${color} 0%, ${color}22 65%, #000 100%)` }} />
      )}
      <div style={st.scrim} />

      <div style={st.topBar}>
        <button style={st.roundBtn} onClick={onClose} aria-label="닫기"><IconX size={16} /></button>
        {isMe && <MoreMenu items={moreItems} btnStyle={st.roundBtn} />}
      </div>

      <div style={st.spacer} />

      <div style={st.info}>
        <button
          style={st.avatarBtn}
          onClick={() => person?.avatar_url && setZoom(true)}
          aria-label="프로필 사진"
        >
          <Avatar person={person} size={104} style={{ border: "3px solid rgba(255,255,255,0.9)" }} />
        </button>
        <div style={st.nameRow}>
          <span style={st.name}>{name}</span>
          {person?.emoji && <span style={st.emoji}>{person.emoji}</span>}
        </div>
        {status && <div style={st.status}>{status}</div>}
        {bday && <div style={st.bday}>🎂 {bday}</div>}
      </div>

      <div style={st.actions}>
        {isMe ? (
          <button style={st.actionBtn} onClick={onEditProfile}>
            <span style={st.actionIcon}>✎</span>
            <span>프로필 편집</span>
          </button>
        ) : (
          <>
            <button style={st.actionBtn} onClick={onGoTimeline}>
              <IconList size={20} />
              <span>기록 보기</span>
            </button>
            <button style={st.actionBtn} onClick={onOpenAnniversary}>
              <IconCalendar size={20} />
              <span>기념일</span>
            </button>
            <button style={{ ...st.actionBtn, opacity: poking ? 0.5 : 1 }} onClick={poke} disabled={poking}>
              <span style={st.actionIcon}>💗</span>
              <span>생각나서 콕</span>
            </button>
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={pickCover} style={{ display: "none" }} />

      {zoom && (
        <div style={st.zoomOverlay} onClick={() => setZoom(false)}>
          <img src={person.avatar_url} alt={name} style={st.zoomImg} />
        </div>
      )}
    </div>,
    document.body
  );
}

function birthdayLabel(birthday) {
  if (!birthday) return "";
  const s = String(birthday);
  const m = s.slice(5, 7);
  const d = s.slice(8, 10);
  if (!m || !d) return "";
  const mn = parseInt(m, 10);
  const dn = parseInt(d, 10);
  if (!mn || !dn) return "";

  const today = new Date();
  const y = today.getFullYear();
  let next = new Date(y, mn - 1, dn);
  const startOfToday = new Date(y, today.getMonth(), today.getDate());
  if (next < startOfToday) next = new Date(y + 1, mn - 1, dn);
  const left = Math.round((next - startOfToday) / 86400000);
  const base = `${mn}월 ${dn}일`;
  if (left === 0) return `${base} · 오늘이에요!`;
  return `${base} · D-${left}`;
}

const st = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "#000",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  coverImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  scrim: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.78) 100%)",
  },
  topBar: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "max(14px, env(safe-area-inset-top)) 14px 0",
  },
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(2px)",
  },
  spacer: { flex: 1 },
  info: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 24px 22px",
  },
  avatarBtn: { border: "none", background: "none", padding: 0, cursor: "pointer", lineHeight: 0 },
  nameRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 14 },
  name: { fontSize: 21, fontWeight: 800, color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.5)" },
  emoji: { fontSize: 19 },
  status: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    textShadow: "0 1px 6px rgba(0,0,0,0.5)",
    maxWidth: 320,
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bday: {
    marginTop: 10,
    fontSize: 12.5,
    fontWeight: 700,
    color: "#fff",
    background: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    padding: "5px 12px",
    backdropFilter: "blur(2px)",
  },
  actions: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    padding: "0 20px max(20px, env(safe-area-inset-bottom))",
  },
  actionBtn: {
    flex: "1 1 0",
    maxWidth: 130,
    minWidth: 88,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "13px 8px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(4px)",
  },
  actionIcon: { fontSize: 19, lineHeight: "20px" },
  zoomOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    background: "rgba(0,0,0,0.94)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  zoomImg: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 },
};
