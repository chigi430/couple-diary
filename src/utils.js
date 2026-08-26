import { DOW } from "./constants";

// ── 날짜 ──
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const ymd = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
export const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const diffDays = (a, b) =>
  Math.round((parseDate(a) - parseDate(b)) / 86400000);
export const prettyDate = (str) => {
  const d = parseDate(str);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`;
};
export const prettyTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
};

// 기념일 계산: 함께한 날수 + 다음 100일 / 다음 주년 D-day
export function anniversaryInfo(anniversary) {
  if (!anniversary) return null;
  const t = todayStr();
  const daysTogether = diffDays(t, anniversary) + 1;
  const passed = diffDays(t, anniversary);
  const nextHundredN = (Math.floor(passed / 100) + 1) * 100;
  const hundredDate = new Date(parseDate(anniversary).getTime() + nextHundredN * 86400000);
  const hundredKey = `${hundredDate.getFullYear()}-${String(hundredDate.getMonth() + 1).padStart(2, "0")}-${String(hundredDate.getDate()).padStart(2, "0")}`;
  const hundredLeft = diffDays(hundredKey, t);

  const a = parseDate(anniversary);
  const now = new Date();
  let annThis = new Date(now.getFullYear(), a.getMonth(), a.getDate());
  if (annThis < parseDate(t)) annThis = new Date(now.getFullYear() + 1, a.getMonth(), a.getDate());
  const annKey = `${annThis.getFullYear()}-${String(annThis.getMonth() + 1).padStart(2, "0")}-${String(annThis.getDate()).padStart(2, "0")}`;
  const annLeft = diffDays(annKey, t);
  const annNo = annThis.getFullYear() - a.getFullYear();

  return { daysTogether, nextHundredN, hundredLeft, annLeft, annNo };
}

// ── 이미지 압축 (업로드 전에 용량 줄이기) ──
function readAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// 성공 시 { blob, ext } 반환. 실패(예: HEIC 등 브라우저가 못 그림) 시 원본 그대로.
export async function compressImage(file, maxDim = 1280, quality = 0.8) {
  try {
    if (!file.type.startsWith("image/")) return { blob: file, ext: extOf(file.name) };
    const dataUrl = await readAsDataURL(file);
    const img = await loadImage(dataUrl);
    let { width, height } = img;
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) return { blob: file, ext: extOf(file.name) };
    return { blob, ext: "jpg" };
  } catch {
    return { blob: file, ext: extOf(file.name) };
  }
}

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || "");
  return m ? m[1].toLowerCase() : "jpg";
}

// 일기 기록에 실제 내용이 하나라도 있는지 (사진/메모/일정/기분/스탬프)
export function hasAny(entry) {
  return !!(
    entry &&
    ((entry.photos && entry.photos.length) ||
      entry.note ||
      entry.schedule ||
      entry.mood ||
      (entry.stamps && entry.stamps.length))
  );
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
