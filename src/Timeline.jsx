import React, { useMemo, useState } from "react";
import { S } from "./styles";
import { STAMPS } from "./constants";
import { prettyDate, prettyTime } from "./utils";
import SignedImage from "./SignedImage";
import Avatar from "./Avatar";

export default function Timeline({ byDate, people, onOpen }) {
  const [view, setView] = useState("list"); // list | grid

  const dates = useMemo(
    () =>
      Object.keys(byDate)
        .filter((k) => hasAny(byDate[k]))
        .sort((a, b) => (a < b ? 1 : -1)),
    [byDate]
  );

  const photoDates = useMemo(
    () => dates.filter((k) => byDate[k].photos && byDate[k].photos.length > 0),
    [dates, byDate]
  );

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };

  return (
    <div style={S.body}>
      <div style={S.segRow}>
        <button style={{ ...S.segBtn, ...(view === "list" ? S.segBtnOn : {}) }} onClick={() => setView("list")}>
          타임라인
        </button>
        <button style={{ ...S.segBtn, ...(view === "grid" ? S.segBtnOn : {}) }} onClick={() => setView("grid")}>
          추억 모아보기
        </button>
      </div>

      {view === "list" ? (
        dates.length === 0 ? (
          <div style={S.tlEmpty}>아직 기록이 없어요.</div>
        ) : (
          dates.map((k) => {
            const e = byDate[k];
            const authorId = e.note ? e.note_by : e.photos && e.photos[0] ? e.photos[0].uploaded_by : null;
            const author = who(authorId);
            const cover = e.photos && e.photos[0];
            return (
              <button key={k} style={S.tlCard} onClick={() => onOpen(k)}>
                {cover ? (
                  <SignedImage path={cover.storage_path} style={S.tlThumb} />
                ) : (
                  <div style={S.tlNoThumb}>{e.mood || "◍"}</div>
                )}
                <div style={S.tlBody}>
                  <div style={S.tlTopRow}>
                    <span style={S.tlDate}>{prettyDate(k)}</span>
                    {e.mood && <span style={S.tlMood}>{e.mood}</span>}
                  </div>
                  {authorId && (
                    <div style={S.tlByRow}>
                      <Avatar person={author} size={18} />
                      {author.display_name}
                      <span style={S.tlByTime}>· {prettyTime(e.updated_at)}</span>
                    </div>
                  )}
                  {e.note && <p style={S.tlNote}>{e.note}</p>}
                  {(e.stamps && e.stamps.length > 0) || e.place || e.food ? (
                    <div style={S.tlChips}>
                      {e.place && <span style={S.tlChip}>📍 {e.place}</span>}
                      {e.food && <span style={S.tlChip}>🍽 {e.food}</span>}
                      {(e.stamps || []).map((sk) => {
                        const s = STAMPS.find((x) => x.k === sk);
                        return s ? <span key={sk} style={S.tlChip}>{s.emoji} {s.label}</span> : null;
                      })}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )
      ) : photoDates.length === 0 ? (
        <div style={S.tlEmpty}>아직 사진이 없어요.</div>
      ) : (
        <div style={S.memGrid}>
          {photoDates.map((k) => (
            <button key={k} style={S.memCell} onClick={() => onOpen(k)}>
              <SignedImage path={byDate[k].photos[0].storage_path} style={S.memImg} />
              <span style={S.memDateTag}>{k.slice(5).replace("-", ".")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function hasAny(entry) {
  return entry && ((entry.photos && entry.photos.length) || entry.note || entry.schedule || entry.mood || (entry.stamps && entry.stamps.length));
}
