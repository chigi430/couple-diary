import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { S } from "./styles";
import { EMOJI_CHOICES, COLOR_CHOICES } from "./constants";
import { compressImage, uuid } from "./utils";
import { pushSupported, isPushSubscribed, subscribePush, unsubscribePush } from "./push";
import { isDarkActive, setTheme } from "./theme";
import { toast } from "./toast";
import Avatar from "./Avatar";
import { IconX, IconPlus } from "./Icons";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";

const IS_IOS = /iP(hone|od|ad)/.test(navigator.userAgent);
const IS_STANDALONE = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;

export default function Settings({ profile, onSaved, onSignOut }) {
  const fileRef = useRef(null);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(profile?.display_name || "");
  const [emoji, setEmoji] = useState(profile?.emoji || EMOJI_CHOICES[0]);
  const [color, setColor] = useState(profile?.color || COLOR_CHOICES[0]);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [darkOn, setDarkOn] = useState(() => isDarkActive());
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState("");
  const [isLatest, setIsLatest] = useState(null); // null=확인 중/실패, true/false=최신 여부
  const [prefs, setPrefs] = useState({
    notify_activity: profile?.notify_activity !== false,
    notify_reminder: profile?.notify_reminder !== false,
    notify_anniversary: profile?.notify_anniversary !== false,
    notify_wishlist: profile?.notify_wishlist !== false,
  });

  useEffect(() => {
    if (!pushSupported()) return;
    isPushSubscribed().then(setPushOn);
  }, []);

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsLatest(d.version === __APP_VERSION__))
      .catch(() => setIsLatest(null));
  }, []);

  const { handleProps, handleStyle, sheetStyle, overlayStyle } = useSheetDrag(() => setEditOpen(false));

  const openEdit = () => {
    setName(profile?.display_name || "");
    setEmoji(profile?.emoji || EMOJI_CHOICES[0]);
    setColor(profile?.color || COLOR_CHOICES[0]);
    setAvatarUrl(profile?.avatar_url || "");
    setErr("");
    setEditOpen(true);
  };

  const toggleDark = () => {
    const next = !darkOn;
    setDarkOn(next);
    setTheme(next ? "dark" : "light");
  };

  const togglePush = async () => {
    setPushBusy(true);
    setPushMsg("");
    try {
      if (pushOn) {
        await unsubscribePush();
        setPushOn(false);
      } else {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setPushMsg("알림 권한이 필요해요.");
          return;
        }
        await subscribePush(profile.id);
        setPushOn(true);
      }
    } catch (e) {
      setPushMsg(e.message);
    } finally {
      setPushBusy(false);
    }
  };

  const togglePref = async (key) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    const { error } = await supabase.from("profiles").update({ [key]: next }).eq("id", profile.id);
    if (error) {
      setPrefs((p) => ({ ...p, [key]: !next }));
      setPushMsg(error.message);
    } else {
      await onSaved();
    }
  };

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

  const forceUpdate = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } finally {
      window.location.reload();
    }
  };

  const leaveCouple = async () => {
    const ok = window.confirm(
      "정말 커플 연결을 해제할까요?\n\n" +
        "내 계정만 이 커플 공간에서 빠져나가요. 지금까지 쌓인 기록은 삭제되지 않고 그대로 남아있고, 나중에 상대에게 새 초대코드를 받으면 다시 들어올 수 있어요."
    );
    if (!ok) return;
    setErr("");
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ couple_id: null }).eq("id", profile.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    await onSaved();
  };

  const save = async () => {
    if (!name.trim()) {
      setErr("표시할 이름을 입력해주세요.");
      return;
    }
    setErr("");
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
    setEditOpen(false);
    toast("프로필을 저장했어요 ✓");
  };

  return (
    <div style={S.body}>
      <div style={S.profileDetailCard}>
        <div style={S.profileTopMenu}>
          <MoreMenu
            btnStyle={S.settingsMoreBtn}
            items={[
              { label: "최신 버전으로 업데이트", onClick: forceUpdate },
              { label: "로그아웃", onClick: onSignOut },
              { label: "커플 연결 해제", onClick: leaveCouple, danger: true },
            ]}
          />
        </div>
        <div style={S.profileAvatarWrap}>
          <Avatar person={profile} size={134} />
          <button style={S.profileEditFab} onClick={openEdit} aria-label="프로필 수정"><IconPlus size={16} /></button>
        </div>
        <div style={S.profileDetailName}>{profile?.display_name || "나"}</div>
        <div style={S.profileDetailMeta}>
          <span style={S.profileEmojiTag}>{profile?.emoji}</span>
          <span style={{ ...S.profileColorTag, background: profile?.color || "#D98763" }} />
        </div>
      </div>

      <div style={S.settingsCard}>
        <div style={S.authField}>
          <label style={S.authLabel}>화면</label>
          <div style={S.toggleRow}>
            <span style={S.toggleLabel}>다크모드</span>
            <button
              style={{ ...S.toggleSwitch, background: darkOn ? "#D98763" : "var(--border)" }}
              onClick={toggleDark}
            >
              <span style={{ ...S.toggleKnob, left: darkOn ? 21 : 3 }} />
            </button>
          </div>
        </div>

        {pushSupported() ? (
          <div style={S.authField}>
            <label style={S.authLabel}>알림</label>
            <div style={S.toggleRow}>
              <span style={S.toggleLabel}>상대방 소식 알림 받기</span>
              <button
                style={{ ...S.toggleSwitch, background: pushOn ? "#D98763" : "var(--border)", opacity: pushBusy ? 0.7 : 1 }}
                onClick={togglePush}
                disabled={pushBusy}
              >
                <span style={{ ...S.toggleKnob, left: pushOn ? 21 : 3 }} />
              </button>
            </div>
            {IS_IOS && !IS_STANDALONE && (
              <div style={S.authSub}>iOS에서 알림을 받으려면 먼저 공유 → 홈 화면에 추가로 앱을 설치해주세요.</div>
            )}

            {pushOn && (
              <div style={S.prefList}>
                <div style={S.toggleRow}>
                  <span style={S.toggleLabel}>상대방 활동 알림</span>
                  <button
                    style={{ ...S.toggleSwitch, background: prefs.notify_activity ? "#D98763" : "var(--border)" }}
                    onClick={() => togglePref("notify_activity")}
                  >
                    <span style={{ ...S.toggleKnob, left: prefs.notify_activity ? 21 : 3 }} />
                  </button>
                </div>
                <div style={S.toggleRow}>
                  <span style={S.toggleLabel}>오늘 기록 깜빡하면 알려주기</span>
                  <button
                    style={{ ...S.toggleSwitch, background: prefs.notify_reminder ? "#D98763" : "var(--border)" }}
                    onClick={() => togglePref("notify_reminder")}
                  >
                    <span style={{ ...S.toggleKnob, left: prefs.notify_reminder ? 21 : 3 }} />
                  </button>
                </div>
                <div style={S.toggleRow}>
                  <span style={S.toggleLabel}>기념일/D-day 알림</span>
                  <button
                    style={{ ...S.toggleSwitch, background: prefs.notify_anniversary ? "#D98763" : "var(--border)" }}
                    onClick={() => togglePref("notify_anniversary")}
                  >
                    <span style={{ ...S.toggleKnob, left: prefs.notify_anniversary ? 21 : 3 }} />
                  </button>
                </div>
                <div style={S.toggleRow}>
                  <span style={S.toggleLabel}>위시리스트 완료 알림</span>
                  <button
                    style={{ ...S.toggleSwitch, background: prefs.notify_wishlist ? "#D98763" : "var(--border)" }}
                    onClick={() => togglePref("notify_wishlist")}
                  >
                    <span style={{ ...S.toggleKnob, left: prefs.notify_wishlist ? 21 : 3 }} />
                  </button>
                </div>
              </div>
            )}
            {pushMsg && <div style={S.authSub}>{pushMsg}</div>}
          </div>
        ) : (
          <div style={S.authField}>
            <label style={S.authLabel}>알림</label>
            <div style={S.authSub}>이 브라우저는 푸시 알림을 지원하지 않아요.</div>
          </div>
        )}
      </div>

      <div style={S.versionFooter}>
        버전 {__APP_VERSION__}
        {isLatest === true && " · 최신 버전이에요"}
        {isLatest === false && (
          <>
            {" · 새 버전이 있어요 · "}
            <button style={S.versionUpdateLink} onClick={forceUpdate}>지금 업데이트</button>
          </>
        )}
      </div>

      {editOpen && (
        <div style={{ ...S.overlay, ...overlayStyle }} onClick={() => setEditOpen(false)}>
          <div style={{ ...S.sheet, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
            <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
              <div style={S.sheetHandle} />
            </div>
            <div style={S.sheetHead}>
              <div style={S.sheetDate}>프로필 수정</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MoreMenu items={[{ label: "저장", onClick: save }]} />
                <button style={S.closeBtn} onClick={() => setEditOpen(false)}><IconX size={14} /></button>
              </div>
            </div>

            {err && <div style={S.authError}>{err}</div>}

            <div style={S.avatarPickWrap}>
              <button style={S.avatarPickBtn} onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}>
                <Avatar person={{ avatar_url: avatarUrl, emoji, color }} size={96} />
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
          </div>
        </div>
      )}
    </div>
  );
}
