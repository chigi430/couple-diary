import React from "react";
import { S } from "./styles";
import { STAMPS, HOLIDAYS } from "./constants";
import { todayStr, prettyDate } from "./utils";
import SignedImage from "./SignedImage";

export default function Today({ byDate, onOpen }) {
  const t = todayStr();
  const e = byDate[t];
  const has = e && ((e.photos && e.photos.length) || e.note || e.schedule || e.mood || (e.stamps && e.stamps.length));
  const hol = HOLIDAYS[t];

  const recent = Object.keys(byDate)
    .filter((k) => byDate[k].photos && byDate[k].photos.length)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 6);

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
            {e.photos && e.photos.length > 0 && (
              <div style={S.todayPhotos}>
                {e.photos.slice(0, 3).map((p) => (
                  <SignedImage key={p.id} path={p.storage_path} style={S.todayPhoto} />
                ))}
              </div>
            )}
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
        <div style={S.recentWrap}>
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
    </div>
  );
}
