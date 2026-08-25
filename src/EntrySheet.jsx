import React, { useRef, useState } from "react";
import { S } from "./styles";
import { MOODS, STAMPS, HOLIDAYS } from "./constants";
import { prettyDate } from "./utils";
import SignedImage from "./SignedImage";

export default function EntrySheet({ date, entry, me, people, onClose, saveEntry, uploadPhotos, deletePhoto }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const e = entry || {};
  const stamps = e.stamps || [];
  const photos = e.photos || [];

  const set = (patch) => saveEntry(date, patch);

  const toggleStamp = (k) => {
    const next = stamps.includes(k) ? stamps.filter((s) => s !== k) : [...stamps, k];
    set({ stamps: next });
  };

  const onPick = async (ev) => {
    const files = ev.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    try {
      await uploadPhotos(date, files);
    } catch (e) {
      console.error("사진 업로드 실패:", e);
    } finally {
      setUploading(false);
      ev.target.value = "";
    }
  };

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };
  const myInfo = who(me);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={(ev) => ev.stopPropagation()}>
        <div style={S.sheetHandle} />
        <div style={S.sheetHead}>
          <div>
            <div style={S.sheetDate}>
              {prettyDate(date)}
              {HOLIDAYS[date] && <span style={S.holidayTag}>{HOLIDAYS[date]}</span>}
            </div>
            <div style={S.sheetSub}>
              <span style={{ ...S.byDot, background: myInfo.color }}>{myInfo.emoji}</span>
              {myInfo.display_name}(으)로 기록 중
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.fieldLabel}>오늘의 기분</div>
        <div style={S.moodRow}>
          {MOODS.map((mo) => (
            <button key={mo} onClick={() => set({ mood: e.mood === mo ? null : mo })} style={{ ...S.moodPick, ...(e.mood === mo ? S.moodPickOn : {}) }}>{mo}</button>
          ))}
        </div>

        <div style={S.fieldLabel}>둘만의 스탬프</div>
        <div style={S.stampWrap}>
          {STAMPS.map((s) => {
            const on = stamps.includes(s.k);
            return (
              <button key={s.k} onClick={() => toggleStamp(s.k)} style={{ ...S.stamp, ...(on ? S.stampOn : {}) }}>
                <span>{s.emoji}</span><span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div style={S.fieldLabel}>사진</div>
        <div style={S.photoStrip}>
          {photos.map((p) => (
            <div key={p.id} style={S.photoItem}>
              <SignedImage path={p.storage_path} style={S.photoImg} />
              <span style={{ ...S.photoBy, background: who(p.uploaded_by).color }}>{who(p.uploaded_by).emoji}</span>
              <button style={S.photoDel} onClick={() => deletePhoto(p)}>✕</button>
            </div>
          ))}
          {uploading && <div style={S.photoLoading}>올리는 중…</div>}
          <button style={S.addPhoto} onClick={() => fileRef.current && fileRef.current.click()}>
            <span style={S.addPhotoPlus}>＋</span><span style={S.addPhotoTxt}>추가</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPick} onClick={(ev) => { ev.target.value = null; }} style={{ display: "none" }} />
        </div>

        <div style={S.twoCol}>
          <div style={{ flex: 1 }}>
            <div style={S.fieldLabel}>장소</div>
            <input style={S.input} placeholder="예: 성수동" defaultValue={e.place || ""} onBlur={(ev) => set({ place: ev.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.fieldLabel}>오늘 먹은 것</div>
            <input style={S.input} placeholder="예: 로제 파스타" defaultValue={e.food || ""} onBlur={(ev) => set({ food: ev.target.value })} />
          </div>
        </div>

        <div style={S.fieldLabel}>일정</div>
        <input style={S.input} placeholder="예: 저녁 7시 예약" defaultValue={e.schedule || ""} onBlur={(ev) => set({ schedule: ev.target.value })} />

        <div style={S.fieldLabel}>그날의 이야기</div>
        <textarea style={S.textarea} rows={4} placeholder="오늘 있었던 일, 느낀 것들을 적어두면 나중에 함께 꺼내볼 수 있어요." defaultValue={e.note || ""} onBlur={(ev) => set({ note: ev.target.value, note_by: me })} />
        {e.note && e.note_by && (
          <div style={S.noteBy}>
            <span style={{ ...S.byDot, background: who(e.note_by).color }}>{who(e.note_by).emoji}</span>
            {who(e.note_by).display_name}이(가) 씀
          </div>
        )}

        <button style={S.saveBtn} onClick={onClose}>담아두기</button>
        <p style={{ fontSize: 11.5, color: "#C0B2A8", textAlign: "center", marginTop: 10 }}>
          입력하면 자동으로 저장돼요. (칸을 벗어날 때 저장됩니다.)
        </p>
      </div>
    </div>
  );
}
