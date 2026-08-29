import React, { useState } from "react";
import { S } from "./styles";
import { IconX } from "./Icons";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";
import { useScrollLock } from "./scrollLock";

export default function AnniversarySheet({ initial, onSave, onClose }) {
  const [date, setDate] = useState(initial || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { handleProps, handleStyle, sheetStyle, overlayStyle, sheetRef, overlayRef } = useSheetDrag(onClose);
  useScrollLock();

  const submit = async (val) => {
    setErr("");
    setBusy(true);
    const { error } = await onSave(val);
    setBusy(false);
    if (error) {
      console.error("기념일 저장 실패:", error);
      setErr("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    onClose();
  };

  const items = initial
    ? [{ label: "저장", onClick: () => submit(date || null) }, { label: "삭제", onClick: () => submit(null), danger: true }]
    : [{ label: "저장", onClick: () => submit(date || null) }];

  return (
    <div ref={overlayRef} style={{ ...S.overlay, ...overlayStyle }} onClick={onClose}>
      <div ref={sheetRef} style={{ ...S.sheetCompact, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={{ ...S.sheetHead, ...handleStyle }} {...handleProps}>
          <div style={S.sheetDate}>사귀기 시작한 날</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MoreMenu items={items} />
            <button style={S.closeBtn} onClick={onClose}><IconX size={14} /></button>
          </div>
        </div>

        {err && <div style={S.authError}>{err}</div>}

        <div style={S.authField}>
          <label style={S.authLabel}>날짜</label>
          <input
            style={{ ...S.input, maxWidth: "100%", opacity: busy ? 0.7 : 1 }}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );
}
