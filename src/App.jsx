import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { S, css } from "./styles";
import { anniversaryInfo } from "./utils";
import { useEntries } from "./useEntries";
import { useSchedules } from "./useSchedules";
import { useHideOnScroll } from "./useHideOnScroll";
import Auth from "./Auth";
import CoupleGate from "./CoupleGate";
import Today from "./Today";
import Calendar from "./Calendar";
import Timeline from "./Timeline";
import Wishlist from "./Wishlist";
import DaySheet from "./DaySheet";
import Settings from "./Settings";
import Avatar from "./Avatar";
import ToastHost from "./ToastHost";
import { IconToday, IconCalendar, IconList, IconStar, IconSettings } from "./Icons";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [couple, setCouple] = useState(null);
  const [people, setPeople] = useState({}); // { userId: profile }
  const [loadingProfile, setLoadingProfile] = useState(false);

  const wantsRecap = new URLSearchParams(window.location.search).get("recap");
  const [tab, setTab] = useState(wantsRecap ? "timeline" : "today");
  const [autoRecap, setAutoRecap] = useState(() => (wantsRecap ? Date.now() : null));
  const [selected, setSelected] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const tabbarHidden = useHideOnScroll();

  // 리캡 알림 클릭으로 들어온 경우, 주소창의 ?recap=1 은 한 번 쓰고 지운다
  useEffect(() => {
    if (wantsRecap) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // 초대코드 만료 표시 갱신용
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

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
  const { schedules, byDate: scheduleByDate, addSchedule, updateSchedule, deleteSchedule } = useSchedules(coupleId);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const regenerateCode = async () => {
    const { error } = await supabase.rpc("regenerate_invite_code");
    if (!error) await loadProfile();
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
  const partnerInfo = Object.values(people).find((p) => p.id !== userId) || null;
  const inviteExpiresAt = couple?.invite_code_expires_at ? new Date(couple.invite_code_expires_at).getTime() : null;
  const inviteExpired = inviteExpiresAt !== null && inviteExpiresAt <= nowTick;
  const inviteMinsLeft = inviteExpiresAt !== null ? Math.max(0, Math.ceil((inviteExpiresAt - nowTick) / 60000)) : null;

  return (
    <div style={S.root}>
      <style>{css}</style>
      <ToastHost />

      <header style={S.header}>
        <div style={S.brandRow}>
          <span style={S.brandMark}>◍</span>
          <div style={{ flex: 1 }}>
            <div style={S.brandName}>오늘의 우리</div>
            <div style={S.brandSub}>함께 쌓아가는 날들</div>
          </div>
          <div style={{ ...S.userChip, cursor: "pointer" }} onClick={() => setTab("settings")}>
            <Avatar person={meInfo} size={24} />
            <span style={S.userName}>{meInfo.display_name || "나"}</span>
          </div>
        </div>
      </header>

      {/* 상대가 아직 참여 안 했으면 초대코드 안내 */}
      {memberCount < 2 && couple?.invite_code && (
        <div style={S.inviteBanner}>
          {inviteExpired ? (
            <>
              <div style={S.inviteText}>초대코드가 만료됐어요 (1시간 유효)</div>
              <button style={S.copyBtn} onClick={regenerateCode}>새 코드 받기</button>
            </>
          ) : (
            <>
              <div style={S.inviteText}>
                상대를 초대하세요 · {inviteMinsLeft}분 후 만료<br />
                <span style={S.inviteCode}>{couple.invite_code}</span>
              </div>
              <button style={S.copyBtn} onClick={() => navigator.clipboard?.writeText(couple.invite_code)}>코드 복사</button>
            </>
          )}
        </div>
      )}

      {/* 기념일 */}
      <div style={S.anniStrip} onClick={setAnniversary}>
        {anni ? (
          <>
            <div style={S.anniMain}>
              {partnerInfo ? (
                <span style={S.anniCoupleNames}>
                  {meInfo.display_name || "나"}
                  <span style={S.anniHeart}>♥</span>
                  {partnerInfo.display_name || "상대"}
                </span>
              ) : (
                <span style={S.anniHeart}>♥</span>
              )}
              <span style={S.anniBig}>· 함께한 지 <b>{anni.daysTogether}</b>일</span>
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
        <Today byDate={byDate} people={people} onOpen={(d) => setSelected({ date: d, initialTab: "diary", onlyDiary: true })} />
      ) : tab === "calendar" ? (
        <Calendar
          byDate={byDate}
          schedules={schedules}
          people={people}
          onOpen={(d) => setSelected({ date: d, initialTab: "schedule" })}
        />
      ) : tab === "timeline" ? (
        <Timeline
          byDate={byDate}
          people={people}
          onOpen={(d) => setSelected({ date: d, initialTab: "diary", onlyDiary: true })}
          autoOpenRecap={autoRecap}
          onAutoRecapConsumed={() => setAutoRecap(null)}
        />
      ) : tab === "wishlist" ? (
        <Wishlist coupleId={coupleId} userId={userId} people={people} />
      ) : (
        <Settings profile={profile} onSaved={loadProfile} onSignOut={signOut} />
      )}

      <nav
        style={{
          ...S.tabbar,
          transform: `translateX(-50%) translateY(${tabbarHidden ? "140%" : "0"})`,
          transition: "transform .25s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <button style={{ ...S.tabBtn, ...(tab === "today" ? S.tabOn : {}) }} onClick={() => setTab("today")}>
          <IconToday size={17} /><span>오늘</span>
        </button>
        <button style={{ ...S.tabBtn, ...(tab === "calendar" ? S.tabOn : {}) }} onClick={() => setTab("calendar")}>
          <IconCalendar size={17} /><span>달력</span>
        </button>
        <button style={{ ...S.tabBtn, ...(tab === "timeline" ? S.tabOn : {}) }} onClick={() => setTab("timeline")}>
          <IconList size={17} /><span>타임라인</span>
        </button>
        <button style={{ ...S.tabBtn, ...(tab === "wishlist" ? S.tabOn : {}) }} onClick={() => setTab("wishlist")}>
          <IconStar size={17} /><span>위시리스트</span>
        </button>
        <button style={{ ...S.tabBtn, ...(tab === "settings" ? S.tabOn : {}) }} onClick={() => setTab("settings")}>
          <IconSettings size={17} /><span>설정</span>
        </button>
      </nav>

      {selected && (
        <DaySheet
          date={selected.date}
          initialTab={selected.initialTab}
          onlyDiary={selected.onlyDiary}
          entry={byDate[selected.date]}
          me={userId}
          people={people}
          saveEntry={saveEntry}
          uploadPhotos={uploadPhotos}
          deletePhoto={deletePhoto}
          daySchedules={scheduleByDate(selected.date)}
          addSchedule={addSchedule}
          updateSchedule={updateSchedule}
          deleteSchedule={deleteSchedule}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
