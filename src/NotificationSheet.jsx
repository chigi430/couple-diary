import React, { useEffect, useState } from "react";
import { S } from "./styles";
import { IconX } from "./Icons";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";
import { useScrollLock } from "./scrollLock";
import { toast } from "./toast";

function relTime(iso) {
  const t = new Date(iso);
  const sec = Math.max(0, (Date.now() - t.getTime()) / 1000);
  if (sec < 60) return "방금";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  const today = new Date();
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const time = t.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
  if (sameDay(t, today)) return `오늘 ${time}`;
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (sameDay(t, y)) return `어제 ${time}`;
  const md = `${t.getMonth() + 1}월 ${t.getDate()}일`;
  return t.getFullYear() === today.getFullYear() ? `${md} ${time}` : `${t.getFullYear()}년 ${md}`;
}

// items/markAllRead/clearAll 은 App 에서 useNotifications() 로 한 번만 만들어 내려받는다
// (여기서 또 호출하면 같은 realtime 채널을 두 번 구독하게 됨 — BugReportSheet 참고)
export default function NotificationSheet({ items, markAllRead, clearAll, onOpenUrl, onClose }) {
  const { handleProps, handleStyle, sheetStyle, overlayStyle, sheetRef, overlayRef } = useSheetDrag(onClose);
  useScrollLock();
  // 열었을 때 안 읽었던 것들은 이번에 보는 동안엔 강조 표시를 유지하고, 서버엔 바로 읽음 처리
  const [freshIds] = useState(() => new Set(items.filter((n) => !n.read_at).map((n) => n.id)));
  useEffect(() => {
    if (freshIds.size) markAllRead();
  }, [freshIds, markAllRead]);

  const onClear = async () => {
    if (!items.length) return;
    if (!window.confirm("알림 내역을 모두 지울까요?")) return;
    const { error } = await clearAll();
    toast(error ? "지우지 못했어요. 잠시 후 다시 시도해주세요." : "알림 내역을 지웠어요");
  };

  return (
    <div ref={overlayRef} style={{ ...S.overlay, ...overlayStyle }} onClick={onClose}>
      <div ref={sheetRef} style={{ ...S.sheet, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={{ ...S.sheetHead, ...handleStyle }} {...handleProps}>
          <div style={S.sheetDate}>알림</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {items.length > 0 && <MoreMenu items={[{ label: "모두 지우기", onClick: onClear, danger: true }]} />}
            <button style={S.closeBtn} onClick={onClose} aria-label="닫기"><IconX size={14} /></button>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={S.notiEmpty}>아직 받은 알림이 없어요</div>
        ) : (
          <div style={S.notiList}>
            {items.map((n, i) => {
              const fresh = freshIds.has(n.id);
              const clickable = n.url && n.url !== "/";
              return (
                <button
                  key={n.id}
                  type="button"
                  style={{
                    ...S.notiItem,
                    ...(fresh ? S.notiItemUnread : {}),
                    ...S.listPop,
                    animationDelay: `${Math.min(i * 25, 250)}ms`,
                    cursor: clickable ? "pointer" : "default",
                  }}
                  onClick={() => clickable && onOpenUrl(n.url)}
                >
                  <span style={{ ...S.notiDot, ...(fresh ? {} : S.notiDotRead) }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.notiTitle}>{n.title}</div>
                    {n.body && <div style={S.notiBody}>{n.body}</div>}
                    <div style={S.notiTime}>{relTime(n.created_at)}</div>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
