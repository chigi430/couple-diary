import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { S } from "./styles";
import Avatar from "./Avatar";
import { IconX } from "./Icons";
import { toast } from "./toast";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";

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
      console.error("일정 저장 실패:", error);
      setErr("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    // 새 일정 등록을 마쳤을 때만 상대에게 알림 1회 (수정은 알림 안 감 — 기존 동작 유지)
    if (!existing) {
      supabase.rpc("notify_partner_activity", { p_kind: "schedule", p_detail: title.trim() });
    }
    onClose();
    toast(existing ? "일정을 수정했어요 ✓" : "일정을 등록했어요 ✓");
  };

  const remove = async () => {
    setBusy(true);
    await onDelete(existing.id);
    setBusy(false);
    onClose();
    toast("일정을 삭제했어요");
  };

  const { handleProps, handleStyle, sheetStyle, overlayStyle, sheetRef, overlayRef } = useSheetDrag(onClose);

  return (
    <div ref={overlayRef} style={{ ...S.overlay, ...overlayStyle }} onClick={(ev) => { ev.stopPropagation(); onClose(); }}>
      <div ref={sheetRef} style={{ ...S.sheet, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>{existing ? "일정 수정" : "일정 등록"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MoreMenu
              items={
                existing
                  ? [{ label: "저장", onClick: save }, { label: "삭제", onClick: remove, danger: true }]
                  : [{ label: "저장", onClick: save }]
              }
            />
            <button style={S.closeBtn} onClick={onClose}><IconX size={14} /></button>
          </div>
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
            style={{ ...S.toggleSwitch, background: allDay ? "#D98763" : "var(--border)" }}
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
      </div>
    </div>
  );
}
