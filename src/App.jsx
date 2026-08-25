import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { S, css } from "./styles";
import { anniversaryInfo } from "./utils";
import { useEntries } from "./useEntries";
import Auth from "./Auth";
import CoupleGate from "./CoupleGate";
import Today from "./Today";
import Calendar from "./Calendar";
import EntrySheet from "./EntrySheet";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [couple, setCouple] = useState(null);
  const [people, setPeople] = useState({}); // { userId: profile }
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [tab, setTab] = useState("today");
  const [selected, setSelected] = useState(null);

  // 세션 감시
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 프로필 + 커플 로딩
  const loadProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      setCouple(null);
      setPeople({});
      return;
    }
    setLoadingProfile(true);
    const uid = session.user.id;

    // 내 프로필 (트리거로 생성되지만, 혹시 없으면 만들어 준다)
    let { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!prof) {
      const meta = session.user.user_metadata || {};
      await supabase.from("profiles").upsert({
        id: uid,
        display_name: meta.display_name || "나",
        emoji: meta.emoji || "🙂",
        color: meta.color || "#D98763",
      });
      const r = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      prof = r.data;
    }
    setProfile(prof);

    if (prof?.couple_id) {
      const { data: c } = await supabase.from("couples").select("*").eq("id", prof.couple_id).maybeSingle();
      setCouple(c);
      const { data: members } = await supabase.from("profiles").select("*").eq("couple_id", prof.couple_id);
      const map = {};
      (members || []).forEach((m) => (map[m.id] = m));
      setPeople(map);
    } else {
      setCouple(null);
      setPeople({});
    }
    setLoadingProfile(false);
  }, [session]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const coupleId = couple?.id || null;
  const userId = session?.user?.id || null;
  const { byDate, saveEntry, uploadPhotos, deletePhoto } = useEntries(coupleId, userId);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const setAnniversary = async () => {
    const val = window.prompt("사귀기 시작한 날을 입력하세요 (예: 2025-03-14)", couple?.anniversary_date || "");
    if (val === null) return;
    const trimmed = val.trim();
    if (trimmed && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      window.alert("YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }
    const { data } = await supabase.from("couples").update({ anniversary_date: trimmed || null }).eq("id", coupleId).select().single();
    if (data) setCouple(data);
  };

  // ── 화면 분기 ──
  if (!ready) return <div style={S.center}>불러오는 중…</div>;
  if (!session) return <Auth />;
  if (loadingProfile && !profile) return <div style={S.center}>불러오는 중…</div>;
  if (profile && !profile.couple_id) return <CoupleGate onDone={loadProfile} onSignOut={signOut} />;

  const anni = anniversaryInfo(couple?.anniversary_date);
  const memberCount = Object.keys(people).length;
  const meInfo = people[userId] || profile || {};

  return (
    <div style={S.root}>
      <style>{css}</style>

      <header style={S.header}>
        <div style={S.brandRow}>
          <span style={S.brandMark}>◍</span>
          <div style={{ flex: 1 }}>
            <div style={S.brandName}>오늘의 우리</div>
            <div style={S.brandSub}>함께 쌓아가는 날들</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <div style={S.userChip}>
              <span style={{ ...S.userDot, background: meInfo.color || "#D98763" }}>{meInfo.emoji || "🙂"}</span>
              <span style={S.userName}>{meInfo.display_name || "나"}</span>
            </div>
            <button style={S.signOut} onClick={signOut}>로그아웃</button>
          </div>
        </div>
      </header>

      {/* 상대가 아직 참여 안 했으면 초대코드 안내 */}
      {memberCount < 2 && couple?.invite_code && (
        <div style={S.inviteBanner}>
          <div style={S.inviteText}>
            상대를 초대하세요<br />
            <span style={S.inviteCode}>{couple.invite_code}</span>
          </div>
          <button style={S.copyBtn} onClick={() => navigator.clipboard?.writeText(couple.invite_code)}>코드 복사</button>
        </div>
      )}

      {/* 기념일 */}
      <div style={S.anniStrip} onClick={setAnniversary}>
        {anni ? (
          <>
            <div style={S.anniMain}>
              <span style={S.anniHeart}>♥</span>
              <span style={S.anniBig}>함께한 지 <b>{anni.daysTogether}</b>일</span>
            </div>
            <div style={S.anniChips}>
              <span style={S.chip}>{anni.nextHundredN}일까지 <b style={S.chipD}>D-{anni.hundredLeft}</b></span>
              <span style={S.chip}>{anni.annNo}주년 <b style={S.chipD}>D-{anni.annLeft}</b></span>
            </div>
          </>
        ) : (
          <div style={S.anniEmpty}>♥ 사귀기 시작한 날을 설정해보세요 (눌러서 입력)</div>
        )}
      </div>

      {tab === "today" ? (
        <Today byDate={byDate} onOpen={setSelected} />
      ) : (
        <Calendar byDate={byDate} onOpen={setSelected} />
      )}

      <nav style={S.tabbar}>
        <button style={{ ...S.tabBtn, ...(tab === "today" ? S.tabOn : {}) }} onClick={() => setTab("today")}>
          <span style={S.tabIcon}>◉</span><span>오늘</span>
        </button>
        <button style={{ ...S.tabBtn, ...(tab === "calendar" ? S.tabOn : {}) }} onClick={() => setTab("calendar")}>
          <span style={S.tabIcon}>▦</span><span>달력</span>
        </button>
      </nav>

      {selected && (
        <EntrySheet
          date={selected}
          entry={byDate[selected]}
          me={userId}
          people={people}
          onClose={() => setSelected(null)}
          saveEntry={saveEntry}
          uploadPhotos={uploadPhotos}
          deletePhoto={deletePhoto}
        />
      )}
    </div>
  );
}
