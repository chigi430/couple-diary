import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { S } from "./styles";
import { EMOJI_CHOICES, COLOR_CHOICES } from "./constants";
import { compressImage, uuid } from "./utils";
import { pushSupported, subscribePush, unsubscribePush, syncPushSubscription } from "./push";
import { isDarkActive, setTheme } from "./theme";
import { toast } from "./toast";
import Avatar from "./Avatar";
import { IconX, IconPlus, IconFlag } from "./Icons";
import MoreMenu from "./MoreMenu";
import ConfirmSheet from "./ConfirmSheet";
import BugReportSheet from "./BugReportSheet";
import { useSheetDrag } from "./useSheetDrag";
import { useBugReports } from "./useBugReports";

const IS_IOS = /iP(hone|od|ad)/.test(navigator.userAgent);
const IS_STANDALONE = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;

export default function Settings({ profile, coupleId, onSaved, onSignOut }) {
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
  const [changelogEntries, setChangelogEntries] = useState([]);
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { reports } = useBugReports(coupleId);
  const pendingDeployCount = reports.filter((r) => r.status === "pending_deploy").length;
  const [prefs, setPrefs] = useState({
    notify_activity: profile?.notify_activity !== false,
    notify_reminder: profile?.notify_reminder !== false,
    notify_anniversary: profile?.notify_anniversary !== false,
    notify_wishlist: profile?.notify_wishlist !== false,
  });

  useEffect(() => {
    if (!pushSupported()) return;
    // 브라우저엔 구독이 남아있는데 DB 행이 없는 경우(저장 실패/자동정리 등)를
    // 매번 조용히 복구 — 안 그러면 토글은 계속 "켜짐"으로 보이는데 실제 알림은 안 감.
    syncPushSubscription(profile.id).then(setPushOn);
  }, [profile.id]);

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (d) => {
        const latest = d.version === __APP_VERSION__;
        setIsLatest(latest);
        if (latest) return;
        try {
          const res = await fetch("/changelog.json", { cache: "no-store" });
          if (!res.ok) return;
          const list = await res.json();
          const idx = list.findIndex((e) => e.version === __APP_VERSION__);
          // 내 버전이 목록에 없으면(너무 오래됐거나 특정 배포판) 어디까지가 새 내용인지 알 수 없으니
          // 이미 봤을 수도 있는 옛날 내역을 통째로 보여주지 않고 그냥 빈 목록(= 일반 안내 문구)으로 둠
          setChangelogEntries(idx === -1 ? [] : list.slice(0, idx));
        } catch {
          // 변경 내역 조회는 실패해도 업데이트 자체는 진행 가능하게 조용히 무시
        }
      })
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
      console.error("알림 설정 변경 실패:", e);
      setPushMsg("알림 설정을 변경하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPushBusy(false);
    }
  };

  const togglePref = async (key) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    const { error } = await supabase.from("profiles").update({ [key]: next }).eq("id", profile.id);
    if (error) {
      console.error("알림 카테고리 설정 실패:", error);
      setPrefs((p) => ({ ...p, [key]: !next }));
      setPushMsg("설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
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
      console.error("프로필 사진 업로드 실패:", e);
      setErr("사진을 올리지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const groupedChangelog = [];
  changelogEntries.forEach((entry) => {
    const last = groupedChangelog[groupedChangelog.length - 1];
    if (last && last.date === entry.date) {
      last.notes.push(...entry.notes);
    } else {
      groupedChangelog.push({ date: entry.date, notes: [...entry.notes] });
    }
  });

  const confirmAndUpdate = () => {
    if (isLatest === true) {
      toast("이미 최신 버전이에요 ✓");
      return;
    }
    setUpdateConfirmOpen(true);
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
    setLeaveConfirmOpen(false);
    setErr("");
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ couple_id: null }).eq("id", profile.id);
    setBusy(false);
    if (error) {
      console.error("커플 연결 해제 실패:", error);
      toast("연결 해제에 실패했어요. 잠시 후 다시 시도해주세요.");
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
      console.error("프로필 저장 실패:", error);
      setErr("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
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
              { label: "최신 버전으로 업데이트", onClick: confirmAndUpdate },
              { label: "로그아웃", onClick: onSignOut },
              { label: "커플 연결 해제", onClick: () => setLeaveConfirmOpen(true), danger: true },
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

        <div style={S.authField}>
          <label style={S.authLabel}>오류 제보</label>
          <div style={S.reportRow}>
            <span style={S.toggleLabel}>이상한 점을 발견하면 알려주세요</span>
            <button style={{ ...S.editBtn, width: "auto", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setReportOpen(true)}>
              <IconFlag size={14} /> 제보하기
              {pendingDeployCount > 0 && <span style={S.reportBadgeDot}>{pendingDeployCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div style={S.versionFooter}>
        버전 {__APP_VERSION__}
        {isLatest === true && " · 최신 버전이에요"}
        {isLatest === false && (
          <>
            {" · 새 버전이 있어요 · "}
            <button style={S.versionUpdateLink} onClick={confirmAndUpdate}>지금 업데이트</button>
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

      {updateConfirmOpen && (
        <ConfirmSheet
          title="업데이트"
          confirmLabel="업데이트"
          onConfirm={() => {
            setUpdateConfirmOpen(false);
            forceUpdate();
          }}
          onClose={() => setUpdateConfirmOpen(false)}
        >
          {groupedChangelog.length > 0 ? (
            groupedChangelog.map((g) => (
              <div key={g.date} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📌 {g.date}</div>
                {g.notes.map((n, i) => (
                  <div key={i} style={{ color: "var(--text-muted)" }}>· {n}</div>
                ))}
              </div>
            ))
          ) : (
            <div style={{ marginBottom: 10 }}>새 버전이 있어요.</div>
          )}
          <div style={{ fontSize: 12, color: "var(--text-muted2)" }}>캐시를 지우고 새로고침해요.</div>
        </ConfirmSheet>
      )}

      {reportOpen && (
        <BugReportSheet coupleId={coupleId} userId={profile.id} onClose={() => setReportOpen(false)} />
      )}

      {leaveConfirmOpen && (
        <ConfirmSheet
          title="커플 연결 해제"
          confirmLabel="해제"
          danger
          onConfirm={leaveCouple}
          onClose={() => setLeaveConfirmOpen(false)}
        >
          <div>정말 커플 연결을 해제할까요?</div>
          <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-muted2)" }}>
            내 계정만 이 커플 공간에서 빠져나가요. 지금까지 쌓인 기록은 삭제되지 않고 그대로 남아있고, 나중에 상대에게 새 초대코드를 받으면 다시 들어올 수 있어요.
          </div>
        </ConfirmSheet>
      )}
    </div>
  );
}
