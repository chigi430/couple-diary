import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import { IconMore } from "./Icons";

// items: [{ label, onClick, danger?: boolean }]
export default function MoreMenu({ items, btnStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div style={S.moreMenuWrap} ref={ref}>
      <button style={{ ...S.moreMenuBtn, ...btnStyle }} onClick={() => setOpen((v) => !v)} aria-label="더보기">
        <IconMore size={16} />
      </button>
      {open && (
        <div style={S.moreMenuDropdown}>
          {items.map((it, i) => (
            <button
              key={i}
              style={{
                ...S.moreMenuItem,
                ...(it.danger ? S.moreMenuItemDanger : {}),
                ...(i === items.length - 1 ? { borderBottom: "none" } : {}),
              }}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
