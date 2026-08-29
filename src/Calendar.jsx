import React, { useMemo, useState } from "react";
import { S } from "./styles";
import { MONTHS, DOW, HOLIDAYS } from "./constants";
import { ymd, todayStr, diffDays, hasAny as hasAnyEntry } from "./utils";
import SignedImage from "./SignedImage";

const BAR_H = 17;
const GAP = 3;

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export default function Calendar({ byDate, onOpen, schedules = [], people = {} }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const weeks = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startPad = first.getDay();
    const dim = new Date(view.y, view.m + 1, 0).getDate();
    const totalCells = Math.ceil((startPad + dim) / 7) * 7;
    const gridStartDate = addDays(ymd(view.y, view.m, 1), -startPad);
    const monthPrefix = ymd(view.y, view.m, 1).slice(0, 7);

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dateStr = addDays(gridStartDate, i);
      cells.push({ date: dateStr, day: Number(dateStr.slice(8, 10)), inMonth: dateStr.slice(0, 7) === monthPrefix });
    }

    const ws = [];
    for (let w = 0; w < cells.length / 7; w++) {
      const weekCells = cells.slice(w * 7, w * 7 + 7);
      const weekStart = weekCells[0].date;
      const weekEnd = weekCells[6].date;

      const overlapping = schedules
        .filter((s) => s.start_date <= weekEnd && s.end_date >= weekStart)
        .map((s) => ({
          s,
          startCol: Math.max(0, diffDays(s.start_date, weekStart)),
          endCol: Math.min(6, diffDays(s.end_date, weekStart)),
        }))
        .sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);

      const laneEnds = [];
      const bars = [];
      for (const item of overlapping) {
        let lane = laneEnds.findIndex((end) => end < item.startCol);
        if (lane === -1) {
          lane = laneEnds.length;
          laneEnds.push(item.endCol);
        } else {
          laneEnds[lane] = item.endCol;
        }
        bars.push({ ...item, lane });
      }
      ws.push({ weekCells, bars, laneCount: laneEnds.length });
    }
    return ws;
  }, [view, schedules]);

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

  const who = (id) => people[id] || { color: "#D98763" };

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

        {weeks.map((week, wi) => (
          <div key={wi}>
            <div style={S.gridWrap}>
              {week.weekCells.map((c) => {
                if (!c.inMonth) return <div key={c.date} style={S.emptyCell} />;
                const key = c.date;
                const d = c.day;
                const dow = new Date(view.y, view.m, d).getDay();
                const entry = byDate[key];
                const hol = HOLIDAYS[key];
                const photos = entry && entry.photos ? entry.photos : [];
                const hasPhoto = photos.length > 0;
                const hasAny = hasAnyEntry(entry);
                const isToday = key === todayStr();
                const numColor = hol || dow === 0 ? "#d1584a" : dow === 6 ? "#7d8ba8" : "#6B5D55";
                const contributors = collectContributors(entry);
                return (
                  <button key={key} onClick={() => onOpen(key)} style={{ ...S.dayCell, ...(hasAny ? S.dayFilled : {}), ...(isToday ? S.dayToday : {}) }}>
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

            {week.laneCount > 0 && (
              <div style={{ ...S.weekBarsWrap, height: week.laneCount * (BAR_H + GAP) + GAP }}>
                {week.bars.map(({ s, startCol, endCol, lane }) => (
                  <div
                    key={s.id}
                    style={{
                      ...S.weekBar,
                      left: `${(startCol / 7) * 100}%`,
                      width: `${((endCol - startCol + 1) / 7) * 100}%`,
                      top: lane * (BAR_H + GAP) + GAP,
                      background: who(s.user_id).color,
                    }}
                    onClick={() => onOpen(s.start_date)}
                  >
                    {s.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={S.hint}>날짜를 눌러 그날의 사진·이야기와 일정을 확인해보세요.</p>
    </div>
  );
}

// 사진 올린 사람 + 메모 쓴 사람이 서로 다르면 2명이 참여한 것으로 표시
function collectContributors(entry) {
  if (!entry) return 0;
  const set = new Set();
  const notes = entry.notes && typeof entry.notes === "object" ? entry.notes : null;
  if (notes) {
    Object.entries(notes).forEach(([uid, t]) => (t || "").trim() && set.add(uid));
  } else if (entry.note_by) {
    set.add(entry.note_by);
  }
  (entry.photos || []).forEach((p) => p.uploaded_by && set.add(p.uploaded_by));
  return set.size;
}
