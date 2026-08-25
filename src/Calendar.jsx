import React, { useMemo, useState } from "react";
import { S } from "./styles";
import { MONTHS, DOW, HOLIDAYS } from "./constants";
import { ymd, todayStr } from "./utils";
import SignedImage from "./SignedImage";

export default function Calendar({ byDate, onOpen }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const grid = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startPad = first.getDay();
    const dim = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const filledCount = useMemo(
    () => Object.keys(byDate).filter((k) => k.startsWith(`${view.y}-${String(view.m + 1).padStart(2, "0")}`)).length,
    [byDate, view]
  );

  const move = (delta) => {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  return (
    <div style={S.body}>
      <div style={S.card}>
        <div style={S.monthNav}>
          <button style={S.navBtn} onClick={() => move(-1)} aria-label="이전 달">‹</button>
          <div style={S.monthTitleWrap}>
            <div style={S.monthTitle}>{view.y} <span style={S.monthAccent}>{MONTHS[view.m]}</span></div>
            <div style={S.monthMeta}>이번 달 {filledCount}일의 기록</div>
          </div>
          <button style={S.navBtn} onClick={() => move(1)} aria-label="다음 달">›</button>
        </div>

        <div style={S.dowRow}>
          {DOW.map((d, i) => (
            <div key={d} style={{ ...S.dowCell, color: i === 0 ? "#c96f5b" : i === 6 ? "#7d8ba8" : "#9a8f88" }}>{d}</div>
          ))}
        </div>

        <div style={S.gridWrap}>
          {grid.map((d, i) => {
            if (d === null) return <div key={i} style={S.emptyCell} />;
            const key = ymd(view.y, view.m, d);
            const dow = new Date(view.y, view.m, d).getDay();
            const entry = byDate[key];
            const hol = HOLIDAYS[key];
            const photos = entry && entry.photos ? entry.photos : [];
            const hasPhoto = photos.length > 0;
            const hasAny = entry && (hasPhoto || entry.note || entry.schedule || entry.mood || (entry.stamps && entry.stamps.length));
            const isToday = key === todayStr();
            const numColor = hol || dow === 0 ? "#d1584a" : dow === 6 ? "#7d8ba8" : "#6B5D55";
            const contributors = collectContributors(entry);
            return (
              <button key={i} onClick={() => onOpen(key)} style={{ ...S.dayCell, ...(hasAny ? S.dayFilled : {}), ...(isToday ? S.dayToday : {}) }}>
                {hasPhoto ? (
                  <div style={S.thumbWrap}>
                    <SignedImage path={photos[0].storage_path} style={S.thumb} />
                    <span style={S.thumbShade} />
                    <span style={S.dayNumOnPhoto}>{d}</span>
                    {entry.mood && <span style={S.moodBadge}>{entry.mood}</span>}
                    {contributors >= 2 && <span style={S.bothDot}>♥</span>}
                  </div>
                ) : (
                  <div style={S.dayInner}>
                    <span style={{ ...S.dayNum, color: numColor }}>{d}</span>
                    {hol && <span style={S.holMini}>{hol.length > 4 ? hol.slice(0, 3) + "…" : hol}</span>}
                    {hasAny && !hol && <span style={S.dot} />}
                    {entry && entry.mood && !hol && <span style={S.moodQuiet}>{entry.mood}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p style={S.hint}>날짜를 눌러 그날의 사진과 이야기를 남겨보세요.</p>
    </div>
  );
}

// 사진 올린 사람 + 메모 쓴 사람이 서로 다르면 2명이 참여한 것으로 표시
function collectContributors(entry) {
  if (!entry) return 0;
  const set = new Set();
  if (entry.note_by) set.add(entry.note_by);
  (entry.photos || []).forEach((p) => p.uploaded_by && set.add(p.uploaded_by));
  return set.size;
}
