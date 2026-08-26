import React, { useEffect, useMemo, useRef, useState } from "react";
import { S } from "./styles";
import { STAMPS, HOLIDAYS } from "./constants";
import { todayStr, prettyDate, prettyTime, hasAny } from "./utils";
import SignedImage from "./SignedImage";
import PhotoCarousel from "./PhotoCarousel";
import Avatar from "./Avatar";
import { useHideOnScroll } from "./useHideOnScroll";

const PAGE_SIZE = 5;

export default function Today({ byDate, people, onOpen }) {
  const t = todayStr();
  const e = byDate[t];
  const has = hasAny(e);
  const hol = HOLIDAYS[t];

  const recent = useMemo(
    () =>
      Object.keys(byDate)
        .filter((k) => byDate[k].photos && byDate[k].photos.length)
        .sort((a, b) => (a < b ? 1 : -1))
        .slice(0, 6),
    [byDate]
  );

  // "최근 우리" 아래로, 오늘을 뺀 지난 기록들을 인스타 홈 피드처럼 아래로 계속 스크롤해서 볼 수 있게 함
  const feedDates = useMemo(
    () =>
      Object.keys(byDate)
        .filter((k) => k !== t && hasAny(byDate[k]))
        .sort((a, b) => (a < b ? 1 : -1)),
    [byDate, t]
  );

  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // 아래로 스크롤하면 "최근 우리" 스트립을 접어서 숨기고, 위로 스크롤하면 다시 펼침 (스크롤 거리가 아니라 방향으로 판단)
  const recentHidden = useHideOnScroll();
  const RECENT_MAX_H = 118;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(feedDates.length, v + PAGE_SIZE));
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [feedDates.length]);

  const who = (id) => (people && people[id]) || { emoji: "🙂", color: "#D98763", display_name: "?" };

  return (
    <div style={S.body}>
      <div style={S.todayCard}>
        <div style={S.todayTop}>
          <div style={S.todayLabel}>오늘</div>
          <div style={S.todayDate}>
            {prettyDate(t)}
            {hol && <span style={S.holidayTag}>{hol}</span>}
          </div>
        </div>

        {has ? (
          <div>
            {e.photos && e.photos.length > 0 && <PhotoCarousel photos={e.photos} />}
            <div style={S.todayMetaRow}>
              {e.mood && <span style={S.metaPill}>{e.mood}</span>}
              {e.place && <span style={S.metaPill}>📍 {e.place}</span>}
              {e.food && <span style={S.metaPill}>🍽 {e.food}</span>}
              {(e.stamps || []).map((k) => {
                const s = STAMPS.find((x) => x.k === k);
                return s ? <span key={k} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
              })}
            </div>
            {e.note && <p style={S.todayNote}>{e.note}</p>}
            <button style={S.editBtn} onClick={() => onOpen(t)}>오늘 기록 이어쓰기</button>
          </div>
        ) : (
          <div style={S.emptyToday}>
            <div style={S.emptyIll}>◍</div>
            <div style={S.emptyTxt}>오늘은 아직 비어 있어요.</div>
            <button style={S.saveBtn} onClick={() => onOpen(t)}>오늘 기록하기</button>
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div
          style={{
            ...S.recentWrap,
            overflow: "hidden",
            maxHeight: recentHidden ? 0 : RECENT_MAX_H,
            marginTop: recentHidden ? 0 : 17,
            opacity: recentHidden ? 0 : 1,
            transform: recentHidden ? "translateY(-16px) scale(0.94)" : "translateY(0) scale(1)",
            transition: "max-height .28s ease, margin-top .28s ease, opacity .22s ease, transform .28s ease",
          }}
        >
          <div style={S.recentHead}>최근 우리</div>
          <div style={S.recentStrip}>
            {recent.map((k) => (
              <button key={k} style={S.recentItem} onClick={() => onOpen(k)}>
                <SignedImage path={byDate[k].photos[0].storage_path} style={S.recentImg} />
                <span style={S.recentDate}>{k.slice(5).replace("-", ".")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {feedDates.length > 0 && (
        <div style={S.feedWrap}>
          <div style={S.feedHead}>지난 기록</div>
          {feedDates.slice(0, visible).map((k, i) => {
            const fe = byDate[k];
            const authorId = fe.note ? fe.note_by : fe.photos && fe.photos[0] ? fe.photos[0].uploaded_by : null;
            const author = authorId ? who(authorId) : null;
            return (
              <div key={k} style={{ ...S.feedCard, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <button style={S.feedTopRow} onClick={() => onOpen(k)}>
                  <div>
                    <div style={S.tlDate}>{prettyDate(k)}</div>
                    {author && (
                      <div style={S.tlByRow}>
                        <Avatar person={author} size={16} />
                        {author.display_name}
                        <span style={S.tlByTime}>· {prettyTime(fe.updated_at)}</span>
                      </div>
                    )}
                  </div>
                  {fe.mood && <span style={S.feedMood}>{fe.mood}</span>}
                </button>

                {fe.photos && fe.photos.length > 0 && <PhotoCarousel photos={fe.photos} who={who} />}

                <button style={S.feedFootBtn} onClick={() => onOpen(k)}>
                  <div style={S.todayMetaRow}>
                    {fe.place && <span style={S.metaPill}>📍 {fe.place}</span>}
                    {fe.food && <span style={S.metaPill}>🍽 {fe.food}</span>}
                    {(fe.stamps || []).map((sk) => {
                      const s = STAMPS.find((x) => x.k === sk);
                      return s ? <span key={sk} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
                    })}
                  </div>
                  {fe.note && <p style={S.todayNote}>{fe.note}</p>}
                </button>
              </div>
            );
          })}
          <div ref={sentinelRef} style={S.feedSentinel} />
          {visible >= feedDates.length && <div style={S.feedEnd}>여기까지예요 🌿</div>}
        </div>
      )}
    </div>
  );
}
