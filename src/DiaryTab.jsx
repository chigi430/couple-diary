import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { S } from "./styles";
import { MOODS, STAMPS } from "./constants";
import { prettyTime, hasAny, placesOf } from "./utils";
import SignedImage from "./SignedImage";
import Avatar from "./Avatar";
import PlacePicker from "./PlacePicker";
import PhotoCarousel from "./PhotoCarousel";
import { IconX, IconPlus } from "./Icons";

export default function DiaryTab({ date, entry, me, people, saveEntry, uploadPhotos, deletePhoto, mode, setMode }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const e = entry || {};
  const stamps = e.stamps || [];
  const photos = e.photos || [];
  const placeList = placesOf(e);

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };
  const myInfo = who(me);

  // '그날의 이야기'는 사람별로 저장한다: notes = { "<uid>": "그 사람 글" }
  const notesObj = e.notes && typeof e.notes === "object" ? e.notes : {};
  const partnerId = Object.keys(people).find((id) => id !== me) || null;
  const partnerNote = partnerId ? (notesObj[partnerId] || "").trim() : "";
  const byMeFirst = (a, b) => (a === me ? -1 : b === me ? 1 : 0);
  const noteList = Object.entries(notesObj)
    .filter(([, t]) => (t || "").trim() !== "")
    .sort(([a], [b]) => byMeFirst(a, b));
  // 레거시 소비자(타임라인/통계/리마인더)를 위해 합친 문자열을 note 에 미러링
  const combineNotes = (obj) =>
    Object.keys(obj)
      .sort(byMeFirst)
      .map((id) => (obj[id] || "").trim())
      .filter(Boolean)
      .join("\n\n");

  const saveNote = (text) => {
    if (text === (notesObj[me] || "")) return; // 바뀐 게 없으면 저장 안 함
    const next = { ...notesObj };
    if (text.trim() === "") delete next[me];
    else next[me] = text;
    // 알림 표시는 저장(네트워크) 완료를 기다리지 않고 지금 찍는다.
    // "완료"/닫기가 저장보다 먼저 처리돼서 알림이 통째로 누락되던 문제 방지.
    if (text.trim() !== "") dirtyRef.current.note = true;
    set({ notes: next, note: combineNotes(next), note_by: me });
  };

  // 자동저장은 칸마다 일어나지만, 상대에게 알림은 "편집을 끝냈을 때"(완료 버튼/시트 닫기) 한 번만 보낸다.
  const dirtyRef = useRef({ note: false });
  // 이번 편집에서 사진이 순증가했을 때만 알림 — 올렸다가 도로 지우면(추가 -1) 알림 안 감
  const photoDeltaRef = useRef(0);
  const flushActivity = useCallback(() => {
    const noteChanged = dirtyRef.current.note;
    const photoAdded = photoDeltaRef.current > 0;
    if (!noteChanged && !photoAdded) return;
    dirtyRef.current = { note: false };
    photoDeltaRef.current = 0;
    supabase.rpc("notify_partner_activity", { p_kind: noteChanged ? "diary" : "photo" });
  }, []);

  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (prevModeRef.current === "edit" && mode !== "edit") flushActivity(); // 수정 → 완료
    prevModeRef.current = mode;
  }, [mode, flushActivity]);
  useEffect(() => () => flushActivity(), [flushActivity]); // 시트 닫힘

  const set = async (patch) => {
    const { error } = await saveEntry(date, patch);
    if (error) {
      console.error("저장 실패:", error);
      if ("note" in patch) dirtyRef.current.note = false; // 저장 실패 시 알림 표시 되돌림
      window.alert("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const toggleStamp = (k) => {
    const next = stamps.includes(k) ? stamps.filter((s) => s !== k) : [...stamps, k];
    set({ stamps: next });
  };

  const onDeletePhoto = async (p) => {
    try {
      await deletePhoto(p);
      photoDeltaRef.current -= 1; // 방금 올린 걸 지운 거면 순증가분이 0으로 상쇄돼 알림이 안 나감
    } catch (e) {
      console.error("사진 삭제 실패:", e);
      window.alert("사진을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const onPick = async (ev) => {
    const files = ev.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    const n = files.length;
    photoDeltaRef.current += n; // 업로드 완료를 기다리지 않고 지금 반영 (닫기와의 경쟁 방지)
    try {
      await uploadPhotos(date, files);
    } catch (e) {
      console.error("사진 업로드 실패:", e);
      photoDeltaRef.current -= n; // 실패하면 되돌림
      window.alert("사진을 올리지 못했어요. 잠시 후 다시 시도해주세요.");
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
      <div key="view" style={S.diarySlide}>
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
              {placeList.length > 0
                ? placeList.map((p, i) => <span key={i} style={S.metaPill}>📍 {p.name || "찍은 위치"}</span>)
                : e.place && <span style={S.metaPill}>📍 {e.place}</span>}
              {e.food && <span style={S.metaPill}>🍽 {e.food}</span>}
              {stamps.map((k) => {
                const s = STAMPS.find((x) => x.k === k);
                return s ? <span key={k} style={S.metaPill}>{s.emoji} {s.label}</span> : null;
              })}
            </div>

            {photos.length > 0 && (
              <PhotoCarousel photos={photos} who={who} />
            )}

            {noteList.length > 0 ? (
              <div style={S.noteList}>
                {noteList.map(([uid, text]) => (
                  <div key={uid} style={S.noteBlock}>
                    {noteList.length > 1 && (
                      <div style={S.noteBy}>
                        <Avatar person={who(uid)} size={16} />
                        {who(uid).display_name}
                      </div>
                    )}
                    <p style={S.viewNote}>{text}</p>
                  </div>
                ))}
              </div>
            ) : (
              e.note && <p style={S.viewNote}>{e.note}</p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div key="edit" style={S.diarySlide}>
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
            {p.uploaded_by && (
              <div style={S.photoByAvSm}>
                <Avatar person={who(p.uploaded_by)} size={16} style={{ border: "1.5px solid #fff" }} />
              </div>
            )}
            <button style={S.photoDel} onClick={() => onDeletePhoto(p)}><IconX size={11} /></button>
          </div>
        ))}
        {uploading && <div style={S.photoLoading}>올리는 중…</div>}
        <button style={S.addPhoto} onClick={() => fileRef.current && fileRef.current.click()}>
          <IconPlus size={18} /><span style={S.addPhotoTxt}>추가</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPick} onClick={(ev) => { ev.target.value = null; }} style={{ display: "none" }} />
      </div>

      <div style={S.twoCol}>
        <div style={{ flex: 1 }}>
          <div style={S.fieldLabel}>장소</div>
          {placeList.length > 0 ? (
            <div style={S.placeChips}>
              {placeList.map((p, i) => (
                <span key={i} style={S.placeChip}>📍 {p.name || "찍은 위치"}</span>
              ))}
            </div>
          ) : (
            <input key={e.place || ""} style={S.input} placeholder="예: 성수동" defaultValue={e.place || ""} onBlur={(ev) => set({ place: ev.target.value })} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.fieldLabel}>오늘 먹은 것</div>
          <input style={S.input} placeholder="예: 로제 파스타" defaultValue={e.food || ""} onBlur={(ev) => set({ food: ev.target.value })} />
        </div>
      </div>

      {!showPicker && (
        <button style={S.placePickToggle} onClick={() => setShowPicker(true)}>
          📍 지도에서 {placeList.length > 0 ? "장소 수정" : "선택"}
        </button>
      )}
      {showPicker && (
        <PlacePicker
          initialPlaces={placeList}
          onCancel={() => setShowPicker(false)}
          onPick={(places) => {
            const first = places[0];
            set({
              places,
              place: first ? first.name : "",
              place_lat: first ? first.lat : null,
              place_lng: first ? first.lng : null,
            });
            setShowPicker(false);
          }}
        />
      )}

      <div style={S.fieldLabel}>그날의 이야기</div>
      {partnerNote && (
        <div style={S.partnerNote}>
          <div style={S.noteBy}>
            <Avatar person={who(partnerId)} size={16} />
            {who(partnerId).display_name}님이 쓴 부분
          </div>
          <p style={S.partnerNoteText}>{partnerNote}</p>
        </div>
      )}
      <textarea
        key={"mynote-" + (e.id || "new")}
        style={S.textarea}
        rows={4}
        placeholder={partnerNote ? "이어서 내 이야기를 적어보세요. 상대가 쓴 부분과 구분돼서 보여요." : "오늘 있었던 일, 느낀 것들을 적어두면 나중에 함께 꺼내볼 수 있어요."}
        defaultValue={notesObj[me] || ""}
        onBlur={(ev) => saveNote(ev.target.value)}
      />
      {(notesObj[me] || "").trim() !== "" && (
        <div style={S.noteBy}>
          <Avatar person={myInfo} size={16} />
          내가 쓴 부분
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--text-muted2)", textAlign: "center", marginTop: 10 }}>
        입력하면 자동으로 저장돼요. (칸을 벗어날 때 저장됩니다.)
      </p>
    </div>
  );
}
