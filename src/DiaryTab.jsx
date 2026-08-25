import React, { useRef, useState } from "react";
import { S } from "./styles";
import { MOODS, STAMPS } from "./constants";
import { prettyTime } from "./utils";
import SignedImage from "./SignedImage";
import Avatar from "./Avatar";
import PlacePicker from "./PlacePicker";
import PhotoCarousel from "./PhotoCarousel";

function hasAny(e) {
  return e && ((e.photos && e.photos.length) || e.note || e.schedule || e.mood || (e.stamps && e.stamps.length));
}

export default function DiaryTab({ date, entry, me, people, saveEntry, uploadPhotos, deletePhoto }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState(() => (hasAny(entry) ? "view" : "edit"));
  const [showPicker, setShowPicker] = useState(false);
  const e = entry || {};
  const stamps = e.stamps || [];
  const photos = e.photos || [];

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };
  const myInfo = who(me);

  const set = async (patch) => {
    const { error } = await saveEntry(date, patch);
    if (error) {
      console.error("저장 실패:", error);
      window.alert(`저장하지 못했어요: ${error.message}`);
    }
  };

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

  const authorId = e.note ? e.note_by : photos[0] ? photos[0].uploaded_by : null;
  const author = authorId ? who(authorId) : null;
  const empty = !hasAny(e);

  if (mode === "view") {
    return (
      <>
        {author && (
          <div style={S.sheetSub}>
            <Avatar person={author} size={18} />
            {author.display_name} · {prettyTime(e.updated_at)}
          </div>
        )}

        {empty ? (
          <>
            <div style={S.viewEmpty}>아직 기록이 없어요.</div>
            <button style={S.saveBtn} onClick={() => setMode("edit")}>기록하기</button>
          </>
        ) : (
          <>
            <div style={S.viewMetaRow}>
              {e.mood && <span style={S.metaPill}>{e.mood}</span>}
              {e.place && <span style={S.metaPill}>📍 {e.place}</span>}
              {e.food && <span style={S.metaPill}>🍽 {e.food}</span>}
              {e.schedule && <span style={S.metaPill}>🗓 {e.schedule}</span>}
              {stamps.map((k) => {
                const s = STAMPS.find((x) => x.k === k);
                return s ? <span key={k} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
              })}
            </div>

            {photos.length > 0 && (
              <PhotoCarousel photos={photos} who={who} />
            )}

            {e.note && <p style={S.viewNote}>{e.note}</p>}

            <div style={S.viewActionsRow}>
              <button style={S.smallActionBtn} onClick={() => setMode("edit")}>✎ 수정</button>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <div style={S.sheetSub}>
        <Avatar person={myInfo} size={18} />
        {myInfo.display_name}(으)로 기록 중
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
          <input key={e.place || ""} style={S.input} placeholder="예: 성수동" defaultValue={e.place || ""} onBlur={(ev) => set({ place: ev.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.fieldLabel}>오늘 먹은 것</div>
          <input style={S.input} placeholder="예: 로제 파스타" defaultValue={e.food || ""} onBlur={(ev) => set({ food: ev.target.value })} />
        </div>
      </div>

      {!showPicker && (
        <button style={S.placePickToggle} onClick={() => setShowPicker(true)}>📍 지도에서 선택</button>
      )}
      {showPicker && (
        <PlacePicker
          initialLat={e.place_lat}
          initialLng={e.place_lng}
          onCancel={() => setShowPicker(false)}
          onPick={({ place, lat, lng }) => {
            set({ place, place_lat: lat, place_lng: lng });
            setShowPicker(false);
          }}
        />
      )}

      <div style={S.fieldLabel}>일정</div>
      <input style={S.input} placeholder="예: 저녁 7시 예약" defaultValue={e.schedule || ""} onBlur={(ev) => set({ schedule: ev.target.value })} />

      <div style={S.fieldLabel}>그날의 이야기</div>
      <textarea style={S.textarea} rows={4} placeholder="오늘 있었던 일, 느낀 것들을 적어두면 나중에 함께 꺼내볼 수 있어요." defaultValue={e.note || ""} onBlur={(ev) => set({ note: ev.target.value, note_by: me })} />
      {e.note && e.note_by && (
        <div style={S.noteBy}>
          <Avatar person={who(e.note_by)} size={18} />
          {who(e.note_by).display_name}이(가) 씀
        </div>
      )}

      {!empty && (
        <div style={S.viewActionsRow}>
          <button style={S.smallActionBtn} onClick={() => setMode("view")}>완료</button>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "#C0B2A8", textAlign: "center", marginTop: 10 }}>
        입력하면 자동으로 저장돼요. (칸을 벗어날 때 저장됩니다.)
      </p>
    </>
  );
}
