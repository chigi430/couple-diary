import React, { useState } from "react";
import { S } from "./styles";
import Avatar from "./Avatar";

export default function ScheduleForm({ date, existing, meInfo, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(existing?.title || "");
  const [allDay, setAllDay] = useState(existing ? existing.all_day : true);
  const [startDate, setStartDate] = useState(existing?.start_date || date);
  const [endDate, setEndDate] = useState(existing?.end_date || date);
  const [startTime, setStartTime] = useState(existing?.start_time || "");
  const [endTime, setEndTime] = useState(existing?.end_time || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      setErr("제목을 입력해주세요.");
      return;
    }
    if (endDate < startDate) {
      setErr("종료일은 시작일 이후여야 해요.");
      return;
    }
    setErr("");
    setBusy(true);
    const { error } = await onSave({ startDate, endDate, allDay, startTime, endTime, title: title.trim() });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onClose();
  };

  const remove = async () => {
    setBusy(true);
    await onDelete(existing.id);
    setBusy(false);
    onClose();
  };

  return (
    <div style={S.overlay} onClick={(ev) => { ev.stopPropagation(); onClose(); }}>
      <div style={S.sheet} onClick={(ev) => ev.stopPropagation()}>
        <div style={S.sheetHandle} />
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>{existing ? "일정 수정" : "일정 등록"}</div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.schedByRow}>
          <Avatar person={meInfo} size={18} />
          {meInfo.display_name}(으)로 등록
        </div>

        {err && <div style={S.authError}>{err}</div>}

        <div style={S.authField}>
          <label style={S.authLabel}>제목</label>
          <input style={S.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 제주도 여행" autoFocus />
        </div>

        <div style={S.toggleRow}>
          <span style={S.toggleLabel}>종일</span>
          <button
            style={{ ...S.toggleSwitch, background: allDay ? "#D98763" : "#E7D9CF" }}
            onClick={() => setAllDay((v) => !v)}
          >
            <span style={{ ...S.toggleKnob, left: allDay ? 21 : 3 }} />
          </button>
        </div>

        <div style={S.authField}>
          <label style={S.authLabel}>기간</label>
          <div style={S.dateRangeRow}>
            <input style={S.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span style={S.dateRangeSep}>~</span>
            <input style={S.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {!allDay && (
          <div style={S.authField}>
            <label style={S.authLabel}>시간</label>
            <div style={S.dateRangeRow}>
              <input style={S.input} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <span style={S.dateRangeSep}>~</span>
              <input style={S.input} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        )}

        <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} onClick={save} disabled={busy}>
          {busy ? "저장 중…" : "저장하기"}
        </button>

        {existing && (
          <button style={S.deleteBtn} onClick={remove} disabled={busy}>삭제하기</button>
        )}
      </div>
    </div>
  );
}
