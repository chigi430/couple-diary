import React, { useMemo, useState } from "react";
import { S } from "./styles";
import { STAMPS } from "./constants";
import SignedImage from "./SignedImage";

function hasAny(entry) {
  return entry && ((entry.photos && entry.photos.length) || entry.note || entry.schedule || entry.mood || (entry.stamps && entry.stamps.length));
}

function computeYearStats(byDate, year) {
  const prefix = `${year}-`;
  const dates = Object.keys(byDate)
    .filter((k) => k.startsWith(prefix) && hasAny(byDate[k]))
    .sort();

  let photoCount = 0;
  const moodCounts = {};
  const stampCounts = {};
  const monthCounts = {};
  let coverPhoto = null;

  dates.forEach((k) => {
    const e = byDate[k];
    if (e.photos && e.photos.length) {
      photoCount += e.photos.length;
      if (!coverPhoto) coverPhoto = e.photos[0];
    }
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    (e.stamps || []).forEach((s) => {
      stampCounts[s] = (stampCounts[s] || 0) + 1;
    });
    const month = Number(k.slice(5, 7));
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  // 대표 사진은 그 해 중간쯤 기록에서 하나
  const photoDates = dates.filter((k) => byDate[k].photos && byDate[k].photos.length > 0);
  if (photoDates.length) coverPhoto = byDate[photoDates[Math.floor(photoDates.length / 2)]].photos[0];

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0] || null;
  const topStamp = Object.entries(stampCounts).sort((a, b) => b[1] - a[1])[0] || null;
  const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0] || null;

  return { year, totalDays: dates.length, photoCount, coverPhoto, topMood, topStamp, topMonth };
}

export default function Recap({ byDate, people, onClose }) {
  const years = useMemo(() => {
    const set = new Set(Object.keys(byDate).map((k) => k.slice(0, 4)));
    set.add(String(new Date().getFullYear()));
    return Array.from(set).sort();
  }, [byDate]);

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const stats = useMemo(() => computeYearStats(byDate, year), [byDate, year]);
  const names = Object.values(people || {})
    .map((p) => p.display_name)
    .filter(Boolean)
    .join(" ♥ ");

  const yi = years.indexOf(year);
  const prevYear = () => yi > 0 && setYear(years[yi - 1]);
  const nextYear = () => yi < years.length - 1 && setYear(years[yi + 1]);

  const topStampInfo = stats.topStamp ? STAMPS.find((s) => s.k === stats.topStamp[0]) : null;

  const slides = [
    {
      bg: "linear-gradient(160deg,#E0906C 0%,#C96F5B 100%)",
      content: (
        <>
          <div style={S.recapEmoji}>◍</div>
          <div style={S.recapTitle}>{year}년, 우리의 한 해</div>
          <div style={S.recapBig}>{stats.totalDays}<span style={S.recapUnit}>일</span></div>
          <div style={S.recapSub}>함께 기록을 남겼어요</div>
        </>
      ),
    },
    {
      bg: "linear-gradient(160deg,#D9679A 0%,#B0553B 100%)",
      content: stats.coverPhoto ? (
        <>
          <SignedImage path={stats.coverPhoto.storage_path} style={S.recapPhoto} />
          <div style={S.recapBig}>{stats.photoCount}<span style={S.recapUnit}>장</span></div>
          <div style={S.recapSub}>이 해에 남긴 사진</div>
        </>
      ) : (
        <>
          <div style={S.recapEmoji}>📷</div>
          <div style={S.recapSub}>아직 사진이 없어요</div>
        </>
      ),
    },
    {
      bg: "linear-gradient(160deg,#5BA37D 0%,#3F7D5B 100%)",
      content: stats.topMood ? (
        <>
          <div style={S.recapEmojiBig}>{stats.topMood[0]}</div>
          <div style={S.recapTitle}>가장 많이 지은 표정</div>
          <div style={S.recapSub}>{stats.topMood[1]}번이나 기록했어요</div>
        </>
      ) : (
        <>
          <div style={S.recapEmoji}>🙂</div>
          <div style={S.recapSub}>아직 기분 기록이 없어요</div>
        </>
      ),
    },
    {
      bg: "linear-gradient(160deg,#B06AD9 0%,#7A4CAE 100%)",
      content: topStampInfo ? (
        <>
          <div style={S.recapEmojiBig}>{topStampInfo.emoji}</div>
          <div style={S.recapTitle}>제일 많이 함께한 순간</div>
          <div style={S.recapSub}>{topStampInfo.label} · {stats.topStamp[1]}번</div>
        </>
      ) : (
        <>
          <div style={S.recapEmoji}>🏷</div>
          <div style={S.recapSub}>아직 스탬프 기록이 없어요</div>
        </>
      ),
    },
    {
      bg: "linear-gradient(160deg,#4C7BD9 0%,#3457A0 100%)",
      content: stats.topMonth ? (
        <>
          <div style={S.recapBig}>{stats.topMonth[0]}<span style={S.recapUnit}>월</span></div>
          <div style={S.recapTitle}>제일 활발했던 달</div>
          <div style={S.recapSub}>{stats.topMonth[1]}일이나 기록했어요</div>
        </>
      ) : (
        <>
          <div style={S.recapEmoji}>📅</div>
          <div style={S.recapSub}>아직 기록이 없어요</div>
        </>
      ),
    },
    {
      bg: "linear-gradient(160deg,#D98763 0%,#5A2A3A 100%)",
      content: (
        <>
          <div style={S.recapEmoji}>♥</div>
          <div style={S.recapTitle}>{names || "우리"}</div>
          <div style={S.recapSub}>다음 해에도 함께 기록해요</div>
        </>
      ),
    },
  ];

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.recapSheet} onClick={(e) => e.stopPropagation()}>
        <div style={S.sheetHandle} />
        <div style={S.recapHead}>
          <div style={S.recapYearNav}>
            <button style={S.recapYearBtn} onClick={prevYear} disabled={yi <= 0}>‹</button>
            <span style={S.recapYearLabel}>{year}년 리캡</span>
            <button style={S.recapYearBtn} onClick={nextYear} disabled={yi >= years.length - 1}>›</button>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.recapScroll} className="no-scrollbar">
          {slides.map((s, i) => (
            <div key={i} style={{ ...S.recapSlide, background: s.bg }}>
              {s.content}
            </div>
          ))}
        </div>
        <div style={S.recapHint}>옆으로 넘겨보세요 →</div>
      </div>
    </div>
  );
}
