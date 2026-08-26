import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import { loadKakaoMaps } from "./kakaoMap";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청 (위치 정보를 못 가져올 때 기본값)

// "서울특별시" → "서울", "경기도" → "경기" 처럼 시/도 표기를 간단하게
function simplifyRegion1(name = "") {
  return name.replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, "") || name;
}

// 카카오 좌표→주소 결과에서 "서울, 성수동" 같은 짧은 표시용 문자열 생성
function simplifyAddress(addr) {
  if (!addr) return "";
  const region1 = simplifyRegion1(addr.region_1depth_name);
  const region3 = (addr.region_3depth_name || addr.region_2depth_name || "").replace(/\d+가$/, "");
  return [region1, region3].filter(Boolean).join(", ");
}

export default function PlacePicker({ initialLat, initialLng, onPick, onCancel }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [picked, setPicked] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng, address: "" } : null
  );
  const [err, setErr] = useState("");
  const [locErr, setLocErr] = useState("");

  useEffect(() => {
    let alive = true;

    loadKakaoMaps()
      .then((kakao) => {
        if (!alive || !mapRef.current) return;
        const geocoder = new kakao.maps.services.Geocoder();

        const placeAt = (map, latlng) => {
          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = new kakao.maps.Marker({ position: latlng, map });
          setPicked({ lat: latlng.getLat(), lng: latlng.getLng(), address: "주소 확인 중…" });

          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status !== kakao.maps.services.Status.OK) return;
            const addr = simplifyAddress(result[0]?.address);
            setPicked((p) => (p ? { ...p, address: addr } : p));
          });
        };

        const startCenter = new kakao.maps.LatLng(
          initialLat || DEFAULT_CENTER.lat,
          initialLng || DEFAULT_CENTER.lng
        );
        const map = new kakao.maps.Map(mapRef.current, { center: startCenter, level: 4 });

        if (initialLat && initialLng) {
          markerRef.current = new kakao.maps.Marker({ position: startCenter, map });
        } else if (navigator.geolocation) {
          // 신규 등록이면 내 현재 위치를 기반으로 자동으로 찍어준다.
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!alive) return;
              const here = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              map.setCenter(here);
              placeAt(map, here);
            },
            (geoErr) => {
              // 권한 거부/실패 시 기본 위치 지도만 보여주되, 원인은 콘솔에 남겨서 진단 가능하게
              console.warn("현재 위치를 가져오지 못했습니다:", geoErr.code, geoErr.message);
              if (alive) setLocErr(geoErr.message || "현재 위치를 가져오지 못했어요.");
            },
            { timeout: 8000, maximumAge: 60000 }
          );
        }

        kakao.maps.event.addListener(map, "click", (mouseEvent) => placeAt(map, mouseEvent.latLng));
      })
      .catch((e) => {
        console.error("지도 로드 실패:", e);
        setErr("지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={S.placePickBox}>
      {err ? (
        <div style={S.mapErrorBox}>{err}</div>
      ) : (
        <>
          <div ref={mapRef} style={S.placePickMap} />
          <div style={S.placePickHint}>
            {picked
              ? picked.address || "지도를 탭해서 위치를 찍어주세요."
              : locErr
              ? `현재 위치를 못 가져왔어요 (${locErr}). 지도를 탭해서 직접 선택해주세요.`
              : "지도를 탭해서 위치를 찍어주세요. (현재 위치를 불러오는 중일 수 있어요)"}
          </div>
        </>
      )}
      <div style={S.placePickConfirmRow}>
        <button style={S.smallActionBtn} onClick={onCancel}>취소</button>
        <button
          style={{ ...S.smallActionBtn, background: "#D98763", color: "#fff", border: "none" }}
          disabled={!picked}
          onClick={() => picked && onPick({ place: picked.address || "", lat: picked.lat, lng: picked.lng })}
        >
          이 위치로 선택
        </button>
      </div>
    </div>
  );
}
