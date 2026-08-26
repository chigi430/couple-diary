import React, { useState } from "react";
import { S } from "./styles";
import { HOLIDAYS } from "./constants";
import { prettyDate, hasAny } from "./utils";
import Avatar from "./Avatar";
import DiaryTab from "./DiaryTab";
import ScheduleForm from "./ScheduleForm";
import { IconX, IconPlus } from "./Icons";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";

export default function DaySheet({
  date,
  initialTab = "schedule",
  onlyDiary = false,
  entry,
  me,
  people,
  saveEntry,
  uploadPhotos,
  deletePhoto,
  daySchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  onClose,
}) {
  const [subTab, setSubTab] = useState(onlyDiary ? "diary" : initialTab);
  const [form, setForm] = useState(null); // null | { date } | { editing }
  const [diaryMode, setDiaryMode] = useState(() => (hasAny(entry) ? "view" : "edit"));
  const effectiveTab = onlyDiary ? "diary" : subTab;
  const diaryHasContent = hasAny(entry);

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };
  const meInfo = who(me);
  const { handleProps, handleStyle, sheetStyle, overlayStyle } = useSheetDrag(onClose);

  return (
    <div style={{ ...S.overlay, ...overlayStyle }} onClick={onClose}>
      <div style={{ ...S.sheet, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>
            {prettyDate(date)}
            {HOLIDAYS[date] && <span style={S.holidayTag}>{HOLIDAYS[date]}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {effectiveTab === "diary" && diaryHasContent && (
              <MoreMenu
                items={
                  diaryMode === "view"
                    ? [{ label: "수정", onClick: () => setDiaryMode("edit") }]
                    : [{ label: "완료", onClick: () => setDiaryMode("view") }]
                }
              />
            )}
            <button style={S.closeBtn} onClick={onClose}><IconX size={14} /></button>
          </div>
        </div>

        {!onlyDiary && (
          <div style={{ ...S.segRow, ...S.daySheetSubTabs }}>
            <button style={{ ...S.segBtn, ...(subTab === "schedule" ? S.segBtnOn : {}) }} onClick={() => setSubTab("schedule")}>
              일정보기
            </button>
            <button style={{ ...S.segBtn, ...(subTab === "diary" ? S.segBtnOn : {}) }} onClick={() => setSubTab("diary")}>
              오늘의 우리
            </button>
          </div>
        )}

        {effectiveTab === "schedule" ? (
          <>
            <div style={S.viewActionsRow}>
              <button style={S.schedAddFab} onClick={() => setForm({ date })}><IconPlus size={18} /></button>
            </div>
            {daySchedules.length === 0 ? (
              <div style={S.viewEmpty}>등록된 일정이 없어요.</div>
            ) : (
              <div style={S.schedList}>
                {daySchedules.map((s) => {
                  const mine = s.user_id === me;
                  const timeLabel = s.all_day
                    ? "종일"
                    : s.start_time && s.end_time
                    ? `${s.start_time}~${s.end_time}`
                    : s.start_time || "";
                  return (
                    <button
                      key={s.id}
                      style={{ ...S.schedItem, cursor: mine ? "pointer" : "default" }}
                      onClick={() => mine && setForm({ editing: s })}
                    >
                      <span style={{ ...S.schedItemBar, background: who(s.user_id).color }} />
                      <span style={S.schedItemTime}>{timeLabel}</span>
                      <span style={S.schedItemTitle}>{s.title}</span>
                      <Avatar person={who(s.user_id)} size={22} />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <DiaryTab
            date={date}
            entry={entry}
            me={me}
            people={people}
            saveEntry={saveEntry}
            uploadPhotos={uploadPhotos}
            deletePhoto={deletePhoto}
            mode={diaryMode}
            setMode={setDiaryMode}
          />
        )}
      </div>

      {form && (
        <ScheduleForm
          date={form.date || form.editing?.start_date}
          existing={form.editing || null}
          meInfo={meInfo}
          onSave={(payload) =>
            form.editing
              ? updateSchedule(form.editing.id, payload)
              : addSchedule({ userId: me, ...payload })
          }
          onDelete={deleteSchedule}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
