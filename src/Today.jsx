import React, { useEffect, useMemo, useRef, useState } from "react";
import { S } from "./styles";
import { STAMPS, HOLIDAYS } from "./constants";
import { todayStr, prettyDate, prettyTime, hasAny, placeSummary } from "./utils";
import SignedImage from "./SignedImage";
import PhotoCarousel from "./PhotoCarousel";
import Avatar from "./Avatar";
import { useHideOnScroll } from "./useHideOnScroll";

const PAGE_SIZE = 10;

// '그날의 이야기'를 사람별로 나눠서 [uid, 글] 목록으로 (내 글 먼저). 예전 기록(notes 없음)은 빈 배열.
function notesOf(entry, me) {
  const obj = entry.notes && typeof entry.notes === "object" ? entry.notes : {};
  return Object.entries(obj)
    .filter(([, t]) => (t || "").trim() !== "")
    .sort(([a], [b]) => (a === me ? -1 : b === me ? 1 : 0));
}

// 목록에서도 상세보기처럼 글마다 누가 썼는지 보여준다
function NoteLines({ entry, me, who }) {
  const list = notesOf(entry, me);
  if (!list.length) return entry.note ? <p style={S.todayNote}>{entry.note}</p> : null;
  return (
    <div style={S.noteList}>
      {list.map(([uid, text]) => (
        <div key={uid}>
          <div style={{ ...S.noteBy, marginTop: 0, marginBottom: 3 }}>
            <Avatar person={who(uid)} size={16} />
            {who(uid).display_name}
          </div>
          <p style={S.todayNote}>{text.trim()}</p>
        </div>
      ))}
    </div>
  );
}

export default function Today({ byDate, people, me, onOpen }) {
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
  // 하단 메뉴 탭(App.jsx)보다는 조금 더 쉽게 접히되, 너무 예민하지 않도록 임계값을 넉넉하게 둠
  const recentHidden = useHideOnScroll({ threshold: 30, topGuard: 50 });
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
            {e.photos && e.photos.length > 0 && <PhotoCarousel photos={e.photos} who={who} />}
            <div style={S.todayMetaRow}>
              {e.mood && <span style={S.metaPill}>{e.mood}</span>}
              {placeSummary(e) && <span style={S.metaPill}>📍 {placeSummary(e)}</span>}
              {e.food && <span style={S.metaPill}>🍽 {e.food}</span>}
              {(e.stamps || []).map((k) => {
                const s = STAMPS.find((x) => x.k === k);
                return s ? <span key={k} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
              })}
            </div>
            <NoteLines entry={e} me={me} who={who} />
            <button style={S.editBtn} onClick={() => onOpen(t, { mode: "edit" })}>오늘 기록 이어쓰기</button>
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
            transform: `translateY(${recentHidden ? "-10px" : "0"})`,
            transition:
              "max-height .25s cubic-bezier(.2,.8,.2,1), margin-top .25s cubic-bezier(.2,.8,.2,1), opacity .25s cubic-bezier(.2,.8,.2,1), transform .25s cubic-bezier(.2,.8,.2,1)",
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
            const noteAuthors = notesOf(fe, me).map(([uid]) => uid);
            const authorIds = noteAuthors.length
              ? noteAuthors
              : fe.note && fe.note_by ? [fe.note_by]
              : fe.photos && fe.photos[0] ? [fe.photos[0].uploaded_by] : [];
            const authors = authorIds.map(who);
            return (
              <div key={k} style={{ ...S.feedCard, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <button style={S.feedTopRow} onClick={() => onOpen(k)}>
                  <div>
                    <div style={S.tlDate}>{prettyDate(k)}</div>
                    {authors.length > 0 && (
                      <div style={S.tlByRow}>
                        {authors.map((a, ai) => (
                          <Avatar key={ai} person={a} size={16} style={ai ? { marginLeft: -7 } : undefined} />
                        ))}
                        {authors.map((a) => a.display_name).join(" · ")}
                        <span style={S.tlByTime}>· {prettyTime(fe.updated_at)}</span>
                      </div>
                    )}
                  </div>
                  {fe.mood && <span style={S.feedMood}>{fe.mood}</span>}
                </button>

                {fe.photos && fe.photos.length > 0 && <PhotoCarousel photos={fe.photos} who={who} />}

                <button style={S.feedFootBtn} onClick={() => onOpen(k)}>
                  <div style={S.todayMetaRow}>
                    {placeSummary(fe) && <span style={S.metaPill}>📍 {placeSummary(fe)}</span>}
                    {fe.food && <span style={S.metaPill}>🍽 {fe.food}</span>}
                    {(fe.stamps || []).map((sk) => {
                      const s = STAMPS.find((x) => x.k === sk);
                      return s ? <span key={sk} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
                    })}
                  </div>
                  <NoteLines entry={fe} me={me} who={who} />
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
