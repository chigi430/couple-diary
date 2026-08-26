import React, { useState } from "react";
import { S } from "./styles";
import Avatar from "./Avatar";
import { useBucketList } from "./useBucketList";
import { IconX, IconCheck } from "./Icons";

export default function Wishlist({ coupleId, userId, people }) {
  const { items, addItem, toggleItem, deleteItem } = useBucketList(coupleId);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const todo = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const onAdd = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    const { error } = await addItem(draft.trim(), userId);
    setBusy(false);
    if (error) {
      window.alert("추가하지 못했어요: " + error.message);
      return;
    }
    setDraft("");
  };

  const onToggle = async (id, done) => {
    const { error } = await toggleItem(id, done, userId);
    if (error) window.alert("변경하지 못했어요: " + error.message);
  };

  const onDelete = async (id) => {
    const { error } = await deleteItem(id);
    if (error) window.alert("삭제하지 못했어요: " + error.message);
  };

  return (
    <div style={S.body}>
      <div style={S.card}>
        <div style={S.fieldLabel}>같이 하고 싶은 것</div>
        <div style={S.twoCol}>
          <input
            style={S.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder="예: 제주도 한 달 살기"
          />
          <button style={S.wlAddBtn} onClick={onAdd} disabled={busy || !draft.trim()}>
            추가
          </button>
        </div>

        {todo.length === 0 && done.length === 0 ? (
          <div style={S.tlEmpty}>
            아직 등록한 목록이 없어요.
            <br />
            같이 하고 싶은 걸 적어보세요.
          </div>
        ) : (
          <>
            {todo.length > 0 && (
              <div style={S.wlList}>
                {todo.map((it, i) => (
                  <div key={it.id} style={{ ...S.wlItem, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                    <button style={S.wlCheck} onClick={() => onToggle(it.id, true)} aria-label="완료 표시" />
                    <span style={S.wlTitle}>{it.title}</span>
                    <Avatar person={people?.[it.created_by]} size={18} />
                    <button style={S.wlDel} onClick={() => onDelete(it.id)}>
                      <IconX size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {done.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={S.recentHead}>완료 {done.length}개 🎉</div>
                <div style={S.wlList}>
                  {done.map((it, i) => (
                    <div key={it.id} style={{ ...S.wlItem, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                      <button
                        style={{ ...S.wlCheck, ...S.wlCheckOn }}
                        onClick={() => onToggle(it.id, false)}
                        aria-label="완료 취소"
                      >
                        <IconCheck size={13} />
                      </button>
                      <span style={{ ...S.wlTitle, ...S.wlTitleDone }}>{it.title}</span>
                      <Avatar person={people?.[it.done_by]} size={18} />
                      <button style={S.wlDel} onClick={() => onDelete(it.id)}>
                        <IconX size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
