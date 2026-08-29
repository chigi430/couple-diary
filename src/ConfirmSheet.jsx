import React from "react";
import { S } from "./styles";
import { IconX } from "./Icons";
import { useSheetDrag } from "./useSheetDrag";
import { useScrollLock } from "./scrollLock";

// 위험하거나 되돌리기 어려운 액션을 실행하기 전에 확인받는 공용 시트.
// window.confirm/alert 대신 앱 디자인에 맞는 모달로 통일하기 위해 사용.
export default function ConfirmSheet({ title, children, confirmLabel = "확인", danger = false, onConfirm, onClose }) {
  const { handleProps, handleStyle, sheetStyle, overlayStyle, sheetRef, overlayRef } = useSheetDrag(onClose);
  useScrollLock();

  return (
    <div ref={overlayRef} style={{ ...S.overlay, ...overlayStyle }} onClick={onClose}>
      <div ref={sheetRef} style={{ ...S.sheetCompact, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>{title}</div>
          <button style={S.closeBtn} onClick={onClose}><IconX size={14} /></button>
        </div>

        <div style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.6 }}>{children}</div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button style={{ ...S.editBtn, flex: 1 }} onClick={onClose}>취소</button>
          <button style={{ ...(danger ? S.deleteBtn : S.saveBtn), flex: 1, marginTop: 0 }} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
