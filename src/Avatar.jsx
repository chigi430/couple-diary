import React from "react";

// 프로필 사진이 있으면 사진을, 없으면 이모지+색상 원을 보여주는 공용 컴포넌트.
export default function Avatar({ person, size = 18, style }) {
  const p = person || { emoji: "🙂", color: "#D98763" };
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Math.round(size * 0.56),
    flexShrink: 0,
    overflow: "hidden",
    ...style,
  };
  if (p.avatar_url) {
    return <img src={p.avatar_url} alt={p.display_name || ""} style={{ ...base, objectFit: "cover" }} />;
  }
  return <span style={{ ...base, background: p.color || "#D98763" }}>{p.emoji || "🙂"}</span>;
}
