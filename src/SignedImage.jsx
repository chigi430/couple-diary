import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// signed URL 캐시 (같은 사진을 매번 다시 요청하지 않도록)
const cache = new Map();

export default function SignedImage({ path, style, alt = "" }) {
  const [url, setUrl] = useState(() => cache.get(path));

  useEffect(() => {
    let alive = true;
    if (!path) return;
    if (cache.has(path)) {
      setUrl(cache.get(path));
      return;
    }
    supabase.storage
      .from("photos")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (alive && data) {
          cache.set(path, data.signedUrl);
          setUrl(data.signedUrl);
        }
      });
    return () => {
      alive = false;
    };
  }, [path]);

  if (!url) return <div style={{ ...style, background: "#F4EAE3" }} />;
  return <img src={url} alt={alt} style={style} />;
}
