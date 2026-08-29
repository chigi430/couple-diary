import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// signed URL 캐시 (같은 사진을 매번 다시 요청하지 않도록).
// URL은 발급 후 1시간이 지나면 서버에서 만료돼 더 이상 안 열리므로, 만료 5분 전부터는
// 캐시를 못 믿는 걸로 치고 새로 발급받는다 — 안 그러면 앱을 오래 켜둘 때 사진이
// 간헐적으로 나오다가(발급 직후) 말아버리는(만료 후에도 캐시값을 계속 씀) 문제가 생김.
const SIGNED_URL_TTL_SEC = 3600;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const cache = new Map(); // path -> { url, expiresAt }

function freshCached(path) {
  const c = cache.get(path);
  return c && Date.now() < c.expiresAt ? c.url : null;
}

export async function getSignedUrl(path) {
  const cached = freshCached(path);
  if (cached) return cached;
  const { data } = await supabase.storage.from("photos").createSignedUrl(path, SIGNED_URL_TTL_SEC);
  if (data) cache.set(path, { url: data.signedUrl, expiresAt: Date.now() + SIGNED_URL_TTL_SEC * 1000 - REFRESH_MARGIN_MS });
  return data?.signedUrl || null;
}

export default function SignedImage({ path, style, alt = "", onLoad, onClick }) {
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
  return <img src={url} alt={alt} style={style} onLoad={onLoad} onClick={onClick} />;
}
