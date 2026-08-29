import React, { useMemo } from "react";
import { S } from "./styles";
import { STAMPS } from "./constants";
import Avatar from "./Avatar";
import { hasAny } from "./utils";

export default function Stats({ byDate, people, onOpenRecap }) {
  const stats = useMemo(() => {
    const dates = Object.keys(byDate).filter((k) => hasAny(byDate[k]));

    const moodCounts = {};
    const stampCounts = {};
    const noteCounts = {};
    let photoCount = 0;

    dates.forEach((k) => {
      const e = byDate[k];
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      (e.stamps || []).forEach((s) => {
        stampCounts[s] = (stampCounts[s] || 0) + 1;
      });
      if (e.notes && typeof e.notes === "object" && Object.keys(e.notes).length) {
        Object.entries(e.notes).forEach(([uid, t]) => {
          if ((t || "").trim()) noteCounts[uid] = (noteCounts[uid] || 0) + 1;
        });
      } else if (e.note && e.note_by) {
        noteCounts[e.note_by] = (noteCounts[e.note_by] || 0) + 1;
      }
      photoCount += e.photos ? e.photos.length : 0;
    });

    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const thisMonthCount = dates.filter((k) => k.startsWith(ym)).length;

    const moodList = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const stampList = Object.entries(stampCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const noteList = Object.entries(noteCounts).sort((a, b) => b[1] - a[1]);
    const moodMax = moodList.length ? moodList[0][1] : 0;
    const stampMax = stampList.length ? stampList[0][1] : 0;
    const noteTotal = noteList.reduce((s, [, c]) => s + c, 0);

    return { totalDays: dates.length, photoCount, thisMonthCount, daysInMonth, moodList, moodMax, stampList, stampMax, noteList, noteTotal };
  }, [byDate]);

  const who = (id) => people?.[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };

  if (stats.totalDays === 0) {
    return <div style={S.tlEmpty}>아직 통계를 낼 기록이 없어요.</div>;
  }

  return (
    <div>
      <div style={S.stBigRow}>
        <div style={S.stBig}>
          <div style={S.stBigNum}>{stats.totalDays}</div>
          <div style={S.stBigLabel}>총 기록일</div>
        </div>
        <div style={S.stBig}>
          <div style={S.stBigNum}>{stats.thisMonthCount}<span style={S.stBigUnit}>/{stats.daysInMonth}</span></div>
          <div style={S.stBigLabel}>이번 달 기록</div>
        </div>
        <div style={S.stBig}>
          <div style={S.stBigNum}>{stats.photoCount}</div>
          <div style={S.stBigLabel}>사진</div>
        </div>
      </div>

      {stats.moodList.length > 0 && (
        <div style={S.stSection}>
          <div style={S.stSectionTitle}>기분 분포</div>
          {stats.moodList.map(([mood, count]) => (
            <div key={mood} style={S.stBarRow}>
              <span style={S.stMoodEmoji}>{mood}</span>
              <div style={S.stBarTrack}>
                <div style={{ ...S.stBarFill, width: `${(count / stats.moodMax) * 100}%` }} />
              </div>
              <span style={S.stBarCount}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {stats.stampList.length > 0 && (
        <div style={S.stSection}>
          <div style={S.stSectionTitle}>많이 쓴 스탬프</div>
          {stats.stampList.map(([k, count]) => {
            const s = STAMPS.find((x) => x.k === k);
            return (
              <div key={k} style={S.stBarRow}>
                <span style={S.stMoodEmoji}>{s ? s.emoji : "🏷"}</span>
                <div style={S.stBarTrack}>
                  <div style={{ ...S.stBarFill, width: `${(count / stats.stampMax) * 100}%` }} />
                </div>
                <span style={S.stBarCount}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {stats.noteList.length === 2 && stats.noteTotal > 0 && (
        <div style={S.stSection}>
          <div style={S.stSectionTitle}>누가 더 많이 기록했을까</div>
          <div style={S.stCompareRow}>
            {stats.noteList.map(([id, count]) => (
              <div key={id} style={S.stCompareSide}>
                <Avatar person={who(id)} size={26} />
                <div style={S.stCompareNum}>{count}</div>
                <div style={S.stCompareName}>{who(id).display_name}</div>
              </div>
            ))}
          </div>
          <div style={S.stBarTrack}>
            <div
              style={{
                ...S.stBarFill,
                width: `${(stats.noteList[0][1] / stats.noteTotal) * 100}%`,
                background: who(stats.noteList[0][0]).color || "#D98763",
              }}
            />
          </div>
        </div>
      )}

      {onOpenRecap && (
        <button style={S.editBtn} onClick={onOpenRecap}>
          연말 리캡 보기 🎉
        </button>
      )}
    </div>
  );
}
