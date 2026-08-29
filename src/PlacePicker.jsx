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
  const kakaoRef = useRef(null);
  const mapObjRef = useRef(null);
  const placeAtRef = useRef(null);
  const [picked, setPicked] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng, address: "" } : null
  );
  const [err, setErr] = useState("");
  const [locErr, setLocErr] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null=검색 전, []=결과 없음
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let alive = true;

    loadKakaoMaps()
      .then((kakao) => {
        if (!alive || !mapRef.current) return;
        kakaoRef.current = kakao;
        const geocoder = new kakao.maps.services.Geocoder();

        // label 이 있으면(검색 결과) 그 이름을 그대로 쓰고, 없으면(지도 탭) 좌표→주소로 채운다.
        const placeAt = (latlng, label) => {
          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = new kakao.maps.Marker({ position: latlng, map: mapObjRef.current });
          setPicked({ lat: latlng.getLat(), lng: latlng.getLng(), address: label || "주소 확인 중…" });
          if (label) return;
          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status !== kakao.maps.services.Status.OK) return;
            const addr = simplifyAddress(result[0]?.address);
            setPicked((p) => (p ? { ...p, address: addr } : p));
          });
        };
        placeAtRef.current = placeAt;

        const startCenter = new kakao.maps.LatLng(
          initialLat || DEFAULT_CENTER.lat,
          initialLng || DEFAULT_CENTER.lng
        );
        const map = new kakao.maps.Map(mapRef.current, { center: startCenter, level: 4 });
        mapObjRef.current = map;

        if (initialLat && initialLng) {
          markerRef.current = new kakao.maps.Marker({ position: startCenter, map });
        } else if (navigator.geolocation) {
          // 신규 등록이면 내 현재 위치를 기반으로 자동으로 찍어준다.
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!alive) return;
              const here = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              map.setCenter(here);
              placeAt(here);
            },
            (geoErr) => {
              console.warn("현재 위치를 가져오지 못했습니다:", geoErr.code, geoErr.message);
              if (alive) setLocErr(geoErr.message || "현재 위치를 가져오지 못했어요.");
            },
            { timeout: 8000, maximumAge: 60000 }
          );
        }

        kakao.maps.event.addListener(map, "click", (mouseEvent) => placeAt(mouseEvent.latLng));
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

  const runSearch = (ev) => {
    if (ev) ev.preventDefault();
    const q = query.trim();
    const kakao = kakaoRef.current;
    if (!q || !kakao) return;
    setSearching(true);
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      setSearching(false);
      setResults(status === kakao.maps.services.Status.OK ? data.slice(0, 12) : []);
    });
  };

  const pickResult = (r) => {
    const kakao = kakaoRef.current;
    if (!kakao || !mapObjRef.current || !placeAtRef.current) return;
    const latlng = new kakao.maps.LatLng(Number(r.y), Number(r.x));
    mapObjRef.current.setLevel(3);
    mapObjRef.current.setCenter(latlng);
    placeAtRef.current(latlng, r.place_name);
    setResults(null);
    setQuery(r.place_name);
  };

  return (
    <div style={S.placePickBox}>
      {err ? (
        <div style={S.mapErrorBox}>{err}</div>
      ) : (
        <>
          <form style={S.placeSearchRow} onSubmit={runSearch}>
            <input
              style={S.placeSearchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소 검색 (예: 성수동 카페)"
            />
            <button type="submit" style={S.placeSearchBtn} disabled={searching}>
              {searching ? "…" : "검색"}
            </button>
          </form>

          {results && (
            <div style={S.placeSearchResults}>
              {results.length === 0 ? (
                <div style={S.placeSearchEmpty}>검색 결과가 없어요.</div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    style={S.placeSearchItem}
                    onClick={() => pickResult(r)}
                  >
                    <span style={S.placeSearchName}>{r.place_name}</span>
                    <span style={S.placeSearchAddr}>{r.road_address_name || r.address_name}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <div ref={mapRef} style={S.placePickMap} />
          <div style={S.placePickHint}>
            {picked
              ? picked.address || "지도를 탭해서 위치를 찍어주세요."
              : locErr
              ? `현재 위치를 못 가져왔어요 (${locErr}). 검색하거나 지도를 탭해서 선택해주세요.`
              : "검색하거나 지도를 탭해서 위치를 찍어주세요."}
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
