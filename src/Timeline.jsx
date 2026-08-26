import React, { useEffect, useMemo, useState } from "react";
import { S } from "./styles";
import { STAMPS } from "./constants";
import { prettyDate, prettyTime, hasAny } from "./utils";
import SignedImage from "./SignedImage";
import Avatar from "./Avatar";
import PlacesMap from "./PlacesMap";
import Stats from "./Stats";
import Recap from "./Recap";

export default function Timeline({ byDate, people, onOpen, autoOpenRecap, onAutoRecapConsumed }) {
  const [view, setView] = useState(autoOpenRecap ? "stats" : "list"); // list | grid | map | stats
  const [mapOpen, setMapOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  useEffect(() => {
    if (autoOpenRecap) {
      setRecapOpen(true);
      onAutoRecapConsumed && onAutoRecapConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const places = useMemo(
    () =>
      dates
        .filter((k) => byDate[k].place_lat != null && byDate[k].place_lng != null)
        .map((k) => ({ date: k, lat: byDate[k].place_lat, lng: byDate[k].place_lng, place: byDate[k].place })),
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
        <button style={{ ...S.segBtn, ...(view === "map" ? S.segBtnOn : {}) }} onClick={() => setView("map")}>
          지도
        </button>
        <button style={{ ...S.segBtn, ...(view === "stats" ? S.segBtnOn : {}) }} onClick={() => setView("stats")}>
          통계
        </button>
      </div>

      {view === "stats" ? (
        <Stats byDate={byDate} people={people} onOpenRecap={() => setRecapOpen(true)} />
      ) : view === "map" ? (
        places.length === 0 ? (
          <div style={S.tlEmpty}>좌표가 있는 장소 기록이 없어요. 일기에서 "지도에서 선택"으로 장소를 찍어보세요.</div>
        ) : (
          <>
            <button style={S.mapToggleBtn} onClick={() => setMapOpen((v) => !v)}>
              🗺 {mapOpen ? "지도 접기" : "지도로 보기"}
            </button>
            {mapOpen && <PlacesMap places={places} onOpen={onOpen} />}
            <div style={S.placeListWrap}>
              {places.map((p) => (
                <button key={p.date} style={S.placeListItem} onClick={() => onOpen(p.date)}>
                  <span style={S.placeListDate}>{p.date.slice(5).replace("-", ".")}</span>
                  <span style={S.placeListName}>📍 {p.place || "장소 미상"}</span>
                </button>
              ))}
            </div>
          </>
        )
      ) : view === "list" ? (
        dates.length === 0 ? (
          <div style={S.tlEmpty}>아직 기록이 없어요.</div>
        ) : (
          dates.map((k, i) => {
            const e = byDate[k];
            const authorId = e.note ? e.note_by : e.photos && e.photos[0] ? e.photos[0].uploaded_by : null;
            const author = who(authorId);
            const cover = e.photos && e.photos[0];
            return (
              <button
                key={k}
                style={{ ...S.tlCard, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}
                onClick={() => onOpen(k)}
              >
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
          {photoDates.map((k, i) => (
            <button
              key={k}
              style={{ ...S.memCell, ...S.listPop, animationDelay: `${Math.min(i * 25, 275)}ms` }}
              onClick={() => onOpen(k)}
            >
              <SignedImage path={byDate[k].photos[0].storage_path} style={S.memImg} />
              <span style={S.memDateTag}>{k.slice(5).replace("-", ".")}</span>
            </button>
          ))}
        </div>
      )}

      {recapOpen && <Recap byDate={byDate} people={people} onClose={() => setRecapOpen(false)} />}
    </div>
  );
}
