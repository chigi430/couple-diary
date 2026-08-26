import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// signed URL 캐시 (같은 사진을 매번 다시 요청하지 않도록)
const cache = new Map();

export async function getSignedUrl(path) {
  if (cache.has(path)) return cache.get(path);
  const { data } = await supabase.storage.from("photos").createSignedUrl(path, 3600);
  if (data) cache.set(path, data.signedUrl);
  return data?.signedUrl || null;
}

export default function SignedImage({ path, style, alt = "", onLoad, onClick }) {
  const [url, setUrl] = useState(() => cache.get(path));

  useEffect(() => {
    let alive = true;
    if (!path) return;
    if (cache.has(path)) {
      setUrl(cache.get(path));
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
