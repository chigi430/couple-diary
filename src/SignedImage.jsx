import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

// signed URL 캐시 (같은 사진을 매번 다시 요청하지 않도록).
//
// 세 가지를 한다:
//  1) 여러 사진의 URL 요청을 한 틱(16ms) 모아서 createSignedUrls로 한 번에 발급 —
//     그리드/피드에서 사진이 30장이면 예전엔 왕복이 30번이었는데 이제 1번.
//  2) 발급받은 URL을 메모리 + localStorage 양쪽에 캐시 — 앱을 껐다 켜도(새로고침 포함)
//     아직 안 만료된 URL은 다시 발급받지 않는다.
//  3) URL은 발급 후 1시간이 지나면 서버에서 만료돼 더 이상 안 열리므로, 만료 5분 전부터는
//     캐시를 못 믿는 걸로 치고 새로 발급받는다 — 안 그러면 앱을 오래 켜둘 때 사진이
//     간헐적으로 나오다가(발급 직후) 말아버리는(만료 후에도 캐시값을 계속 씀) 문제가 생김.
// 7일짜리로 발급 — 그동안 같은 URL이 재사용되므로 브라우저가 사진 바이트 자체를
// 디스크에 캐시해서 재방문 시 네트워크 없이 즉시 뜬다 (스토리지 객체엔 1년 cache-control).
const SIGNED_URL_TTL_SEC = 7 * 24 * 3600;
const REFRESH_MARGIN_MS = 60 * 60 * 1000; // 만료 1시간 전부터 새로 발급
const LS_PREFIX = "su:";
// auth 세션도 같은 localStorage에 사니 넉넉히 잡을 이유가 없다 (300개 ≈ 150KB).
const MAX_LS_ENTRIES = 300;

const mem = new Map(); // path -> { url, expiresAt }

// ── localStorage 캐시 ──
function lsGet(path) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + path);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || Date.now() >= c.expiresAt) {
      localStorage.removeItem(LS_PREFIX + path);
      return null;
    }
    return c;
  } catch {
    return null;
  }
}

function lsSet(path, entry) {
  try {
    localStorage.setItem(LS_PREFIX + path, JSON.stringify(entry));
  } catch {
    // 용량 초과 등 — 만료·오래된 항목 정리 후 1회 재시도, 그래도 안 되면 포기(메모리 캐시로 동작)
    pruneLs(true);
    try {
      localStorage.setItem(LS_PREFIX + path, JSON.stringify(entry));
    } catch {
      /* ignore */
    }
  }
}

function pruneLs(force) {
  if (pruneLs.done && !force) return;
  pruneLs.done = true;
  try {
    const now = Date.now();
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key.indexOf(LS_PREFIX) !== 0) continue;
      let exp = 0;
      try {
        exp = JSON.parse(localStorage.getItem(key)).expiresAt || 0;
      } catch {
        exp = 0;
      }
      found.push([key, exp]);
    }
    const alive = [];
    for (const [key, exp] of found) {
      if (exp <= now) localStorage.removeItem(key);
      else alive.push([key, exp]);
    }
    if (alive.length > MAX_LS_ENTRIES) {
      alive.sort((a, b) => a[1] - b[1]); // 만료 임박 순
      for (const [key] of alive.slice(0, alive.length - MAX_LS_ENTRIES)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}

function freshCached(path) {
  const c = mem.get(path);
  if (c && Date.now() < c.expiresAt) return c.url;
  const ls = lsGet(path);
  if (ls) {
    mem.set(path, ls);
    return ls.url;
  }
  return null;
}

function store(path, url) {
  const entry = { url, expiresAt: Date.now() + SIGNED_URL_TTL_SEC * 1000 - REFRESH_MARGIN_MS };
  mem.set(path, entry);
  lsSet(path, entry);
}

// 로그아웃 시 호출 — 서명 URL은 7일간 유효하므로 기기에 남겨두면
// 다음 사용자가 이전 사용자의 사진을 열어볼 수 있다.
export function clearSignedUrlCache() {
  mem.clear();
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf(LS_PREFIX) === 0) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ── 요청 배칭 ──
// 한 틱에 모인 요청을 CHUNK개씩 나눠 보낸다. 한 덩어리로 몰아 보내면 화면에 사진이
// 많을 때 요청 하나가 실패했을 때 화면 전체가 빈 상태가 되므로, 나눠서 피해를 줄이고
// 실패한 덩어리는 한 번 더 시도한다.
const CHUNK = 100;
const RETRY_DELAY_MS = 800;

let queue = new Map(); // path -> [resolve, ...]
let flushTimer = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 성공하면 path -> url Map, 실패하면 throw
async function signChunk(paths) {
  if (paths.length === 1) {
    const { data, error } = await supabase.storage.from("photos").createSignedUrl(paths[0], SIGNED_URL_TTL_SEC);
    if (error || !data?.signedUrl) throw error || new Error("sign failed");
    return new Map([[paths[0], data.signedUrl]]);
  }
  const { data, error } = await supabase.storage.from("photos").createSignedUrls(paths, SIGNED_URL_TTL_SEC);
  if (error || !data) throw error || new Error("sign failed");
  return new Map(data.map((d) => [d.path, d.signedUrl]));
}

async function runChunk(paths, settle) {
  let got = null;
  for (let attempt = 0; attempt < 2 && !got; attempt++) {
    try {
      got = await signChunk(paths);
    } catch {
      if (attempt === 0) await sleep(RETRY_DELAY_MS);
    }
  }
  for (const p of paths) settle(p, got ? got.get(p) : null);
}

function flush() {
  flushTimer = null;
  const batch = queue;
  queue = new Map();
  const paths = [...batch.keys()];
  if (!paths.length) return;

  const settle = (path, url) => {
    if (url) store(path, url);
    for (const resolve of batch.get(path) || []) resolve(url || null);
  };

  for (let i = 0; i < paths.length; i += CHUNK) {
    runChunk(paths.slice(i, i + CHUNK), settle);
  }
}

export function getSignedUrl(path) {
  const cached = freshCached(path);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve) => {
    if (!queue.has(path)) queue.set(path, []);
    queue.get(path).push(resolve);
    if (!flushTimer) flushTimer = setTimeout(flush, 16);
  });
}

// 곧 보게 될 사진들의 서명 URL을 미리 한 배치로 받아둔다 (상세보기 진입 등).
// 이미 캐시에 있으면 아무 일도 안 함.
export function prefetchSignedUrls(paths) {
  for (const p of paths || []) if (p) getSignedUrl(p);
}

// 시작 직후 한가할 때 만료된 캐시 정리
if (typeof window !== "undefined") {
  setTimeout(() => pruneLs(), 3000);
}

export default function SignedImage({ path, style, alt = "", onLoad, onClick, loading = "lazy" }) {
  const [url, setUrl] = useState(() => (path ? freshCached(path) : null));
  // 발급이 끝내 실패하면(끊긴 네트워크 등) 잠시 뒤 한 번 더 — 안 그러면 다른 화면에
  // 갔다 돌아올 때까지 회색 자리만 남는다.
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState("loading"); // loading | done | error
  const imgRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let retryTimer = null;
    if (!path) {
      setUrl(null);
      return;
    }
    const cached = freshCached(path);
    if (cached) {
      setUrl(cached);
      return;
    }
    getSignedUrl(path).then((signedUrl) => {
      if (!alive) return;
      if (signedUrl) setUrl(signedUrl);
      else if (attempt < 1) retryTimer = setTimeout(() => setAttempt((a) => a + 1), 3000);
    });
    return () => {
      alive = false;
      clearTimeout(retryTimer);
    };
  }, [path, attempt]);

  useEffect(() => {
    setAttempt(0);
    setState("loading");
  }, [path]);

  // 브라우저 캐시에 이미 있으면 onLoad가 안 뜰 수 있으니 마운트 직후 한 번 확인
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setState("done");
      onLoad && onLoad({ target: el });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // URL을 아직 못 받았을 때 — 자리표시(스켈레톤)
  if (!url) return <div className="img-skel" style={style} aria-hidden />;

  return (
    <img
      ref={imgRef}
      src={url}
      alt={alt}
      // 이미지 바이트가 그려지기 전엔 <img> 배경으로 스켈레톤이 비치고, 다 받으면 페이드인
      className={state === "done" ? "img-in" : state === "loading" ? "img-skel" : undefined}
      style={style}
      onLoad={(e) => {
        setState("done");
        onLoad && onLoad(e);
      }}
      onError={() => setState("error")}
      onClick={onClick}
      loading={loading}
      decoding="async"
    />
  );
}
