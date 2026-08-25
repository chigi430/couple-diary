import React, { useState } from "react";
import { S } from "./styles";
import { HOLIDAYS } from "./constants";
import { prettyDate } from "./utils";
import Avatar from "./Avatar";
import DiaryTab from "./DiaryTab";
import ScheduleForm from "./ScheduleForm";

export default function DaySheet({
  date,
  initialTab = "schedule",
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
  const [subTab, setSubTab] = useState(initialTab);
  const [form, setForm] = useState(null); // null | { date } | { editing }

  const who = (id) => people[id] || { emoji: "🙂", color: "#D98763", display_name: "?" };
  const meInfo = who(me);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={(ev) => ev.stopPropagation()}>
        <div style={S.sheetHandle} />
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>
            {prettyDate(date)}
            {HOLIDAYS[date] && <span style={S.holidayTag}>{HOLIDAYS[date]}</span>}
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ ...S.segRow, ...S.daySheetSubTabs }}>
          <button style={{ ...S.segBtn, ...(subTab === "schedule" ? S.segBtnOn : {}) }} onClick={() => setSubTab("schedule")}>
            일정보기
          </button>
          <button style={{ ...S.segBtn, ...(subTab === "diary" ? S.segBtnOn : {}) }} onClick={() => setSubTab("diary")}>
            오늘의 우리
          </button>
        </div>

        {subTab === "schedule" ? (
          <>
            <div style={S.viewActionsRow}>
              <button style={S.schedAddFab} onClick={() => setForm({ date })}>＋</button>
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
