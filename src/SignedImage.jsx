import React, { useEffect, useState } from "react";
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
const MAX_LS_ENTRIES = 800;

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

// ── 요청 배칭 ──
let queue = new Map(); // path -> [resolve, ...]
let flushTimer = null;

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

  if (paths.length === 1) {
    supabase.storage
      .from("photos")
      .createSignedUrl(paths[0], SIGNED_URL_TTL_SEC)
      .then(({ data }) => settle(paths[0], data?.signedUrl))
      .catch(() => settle(paths[0], null));
    return;
  }

  supabase.storage
    .from("photos")
    .createSignedUrls(paths, SIGNED_URL_TTL_SEC)
    .then(({ data, error }) => {
      if (error || !data) {
        for (const p of paths) settle(p, null);
        return;
      }
      const got = new Map(data.map((d) => [d.path, d.signedUrl]));
      for (const p of paths) settle(p, got.get(p) || null);
    })
    .catch(() => {
      for (const p of paths) settle(p, null);
    });
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

// 시작 직후 한가할 때 만료된 캐시 정리
if (typeof window !== "undefined") {
  setTimeout(() => pruneLs(), 3000);
}

export default function SignedImage({ path, style, alt = "", onLoad, onClick, loading = "lazy" }) {
  const [url, setUrl] = useState(() => (path ? freshCached(path) : null));

  useEffect(() => {
    let alive = true;
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
      if (alive && signedUrl) setUrl(signedUrl);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  if (!url) return <div style={{ ...style, background: "#F4EAE3" }} />;
  return (
    <img
      src={url}
      alt={alt}
      style={style}
      onLoad={onLoad}
      onClick={onClick}
      loading={loading}
      decoding="async"
    />
  );
}
