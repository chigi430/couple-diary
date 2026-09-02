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

// 아이폰에서 찍은 사진은 기본이 HEIC인데, 브라우저 <canvas>/<img>가 못 그리는 경우가 많아서
// (사파리는 되지만 크롬/안드로이드는 안 됨) 미리 JPEG로 변환해줘야 함 — 안 하면 압축도 실패하고
// 업로드된 원본도 다른 기기에서 영영 안 보임.
function isHeic(file) {
  const type = (file.type || "").toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

// 성공 시 { blob, ext } 반환. 실패 시 원본 그대로.
export async function compressImage(file, maxDim = 1280, quality = 0.8) {
  try {
    let workFile = file;
    if (isHeic(file)) {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality });
      workFile = Array.isArray(converted) ? converted[0] : converted;
    } else if (!file.type.startsWith("image/")) {
      return { blob: file, ext: extOf(file.name) };
    }
    const dataUrl = await readAsDataURL(workFile);
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
    // WebP가 같은 화질에 JPEG보다 30%가량 작다. 아주 오래된 브라우저는 인코딩을 못 해
    // null이나 다른 타입을 주므로 그때만 JPEG로 폴백.
    const toBlob = (type) => new Promise((res) => canvas.toBlob(res, type, quality));
    let blob = await toBlob("image/webp");
    if (blob && blob.type === "image/webp") return { blob, ext: "webp" };
    blob = await toBlob("image/jpeg");
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

// 하루 기록의 장소 목록을 정규화해서 반환 (신규 places 배열 우선, 없으면 레거시 place_lat/lng)
export function placesOf(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.places) && entry.places.length) {
    return entry.places.filter((p) => p && p.lat != null && p.lng != null);
  }
  if (entry.place_lat != null && entry.place_lng != null) {
    return [{ name: entry.place || "", lat: entry.place_lat, lng: entry.place_lng }];
  }
  return [];
}

// 미리보기용 짧은 장소 문구: "성수동" 또는 "성수동 외 2곳"
export function placeSummary(entry) {
  const ps = placesOf(entry);
  if (ps.length) {
    const first = ps[0].name || "장소";
    return ps.length > 1 ? `${first} 외 ${ps.length - 1}곳` : first;
  }
  return (entry && entry.place) || "";
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
