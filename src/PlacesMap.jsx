import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import { loadKakaoMaps } from "./kakaoMap";

export default function PlacesMap({ places, onOpen }) {
  const mapRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    let markers = [];
    loadKakaoMaps()
      .then((kakao) => {
        if (!alive || !mapRef.current) return;
        const first = places[0];
        const center = new kakao.maps.LatLng(first ? first.lat : 37.5665, first ? first.lng : 126.978);
        const map = new kakao.maps.Map(mapRef.current, { center, level: 6 });

        const bounds = new kakao.maps.LatLngBounds();
        markers = places.map((p) => {
          const pos = new kakao.maps.LatLng(p.lat, p.lng);
          bounds.extend(pos);
          const marker = new kakao.maps.Marker({ position: pos, map, title: p.place });

          const content = document.createElement("div");
          content.style.cssText = "padding:8px 12px;font-size:12.5px;line-height:1.5;max-width:180px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);";
          const dateEl = document.createElement("b");
          dateEl.textContent = p.date;
          const placeEl = document.createElement("div");
          placeEl.textContent = p.place || "";
          const btn = document.createElement("button");
          btn.textContent = "기록 보기";
          btn.style.cssText = "margin-top:6px;border:none;background:#D98763;color:#fff;font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:8px;cursor:pointer;";
          btn.addEventListener("click", () => onOpen(p.date));
          content.append(dateEl, placeEl, btn);

          const info = new kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1.4, clickable: true });
          kakao.maps.event.addListener(marker, "click", () => info.setMap(map));
          kakao.maps.event.addListener(map, "click", () => info.setMap(null));
          return marker;
        });

        if (places.length > 1) map.setBounds(bounds);
        else if (places.length === 1) map.setLevel(4);
      })
      .catch((e) => {
        console.error("지도 로드 실패:", e);
        setErr("지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      });
    return () => {
      alive = false;
      markers.forEach((m) => m.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  if (err) return <div style={S.mapErrorBox}>{err}</div>;

  return (
    <div style={S.mapBox}>
      <div ref={mapRef} style={S.mapCanvas} />
    </div>
  );
}
