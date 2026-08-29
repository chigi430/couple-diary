import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import { loadKakaoMaps } from "./kakaoMap";
import { IconX } from "./Icons";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청 (위치 정보를 못 가져올 때 기본값)

function simplifyRegion1(name = "") {
  return name.replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, "") || name;
}

function simplifyAddress(addr) {
  if (!addr) return "";
  const region1 = simplifyRegion1(addr.region_1depth_name);
  const region3 = (addr.region_3depth_name || addr.region_2depth_name || "").replace(/\d+가$/, "");
  return [region1, region3].filter(Boolean).join(", ");
}

const near = (a, b) => Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

// 지도에서 장소를 여러 개 찍을 수 있는 선택기. onPick(places) 로 [{ name, lat, lng }] 배열을 돌려준다.
export default function PlacePicker({ initialPlaces = [], onPick, onCancel }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const kakaoRef = useRef(null);
  const mapObjRef = useRef(null);
  const [selected, setSelected] = useState(
    (initialPlaces || []).filter((p) => p && p.lat != null && p.lng != null)
  );
  const [mapReady, setMapReady] = useState(false);
  const [err, setErr] = useState("");
  const [locErr, setLocErr] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const addPlace = (p) => {
    setSelected((cur) => (cur.some((q) => near(q, p)) ? cur : [...cur, p]));
  };
  const removePlace = (i) => setSelected((cur) => cur.filter((_, idx) => idx !== i));

  useEffect(() => {
    let alive = true;

    loadKakaoMaps()
      .then((kakao) => {
        if (!alive || !mapRef.current) return;
        kakaoRef.current = kakao;
        const geocoder = new kakao.maps.services.Geocoder();

        const first = selected[0];
        const startCenter = new kakao.maps.LatLng(
          first ? first.lat : DEFAULT_CENTER.lat,
          first ? first.lng : DEFAULT_CENTER.lng
        );
        const map = new kakao.maps.Map(mapRef.current, { center: startCenter, level: 4 });
        mapObjRef.current = map;
        setMapReady(true);

        if (!first && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!alive) return;
              map.setCenter(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            },
            (geoErr) => {
              console.warn("현재 위치를 가져오지 못했습니다:", geoErr.code, geoErr.message);
              if (alive) setLocErr(geoErr.message || "현재 위치를 가져오지 못했어요.");
            },
            { timeout: 8000, maximumAge: 60000 }
          );
        }

        // 지도를 탭하면 그 지점의 주소를 읽어서 목록에 추가
        kakao.maps.event.addListener(map, "click", (mouseEvent) => {
          const ll = mouseEvent.latLng;
          const base = { name: "", lat: ll.getLat(), lng: ll.getLng() };
          addPlace(base);
          geocoder.coord2Address(ll.getLng(), ll.getLat(), (result, status) => {
            if (status !== kakao.maps.services.Status.OK) return;
            const addr = simplifyAddress(result[0]?.address);
            if (!addr) return;
            setSelected((cur) => cur.map((p) => (near(p, base) && !p.name ? { ...p, name: addr } : p)));
          });
        });
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

  // selected 가 바뀔 때마다 마커를 다시 그린다
  useEffect(() => {
    const kakao = kakaoRef.current;
    const map = mapObjRef.current;
    if (!kakao || !map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = selected.map(
      (p) => new kakao.maps.Marker({ position: new kakao.maps.LatLng(p.lat, p.lng), map })
    );
    if (selected.length > 1) {
      const bounds = new kakao.maps.LatLngBounds();
      selected.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds);
    }
  }, [selected, mapReady]);

  const runSearch = (ev) => {
    if (ev) ev.preventDefault();
    const q = query.trim();
    const kakao = kakaoRef.current;
    if (!q || !kakao) return;
    setSearching(true);
    new kakao.maps.services.Places().keywordSearch(q, (data, status) => {
      setSearching(false);
      setResults(status === kakao.maps.services.Status.OK ? data.slice(0, 12) : []);
    });
  };

  const pickResult = (r) => {
    const kakao = kakaoRef.current;
    const lat = Number(r.y);
    const lng = Number(r.x);
    if (mapObjRef.current && kakao) {
      mapObjRef.current.setLevel(3);
      mapObjRef.current.setCenter(new kakao.maps.LatLng(lat, lng));
    }
    addPlace({ name: r.place_name, lat, lng });
    setResults(null);
    setQuery("");
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
                  <button key={r.id} type="button" style={S.placeSearchItem} onClick={() => pickResult(r)}>
                    <span style={S.placeSearchName}>{r.place_name}</span>
                    <span style={S.placeSearchAddr}>{r.road_address_name || r.address_name}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <div ref={mapRef} style={S.placePickMap} />

          {selected.length > 0 ? (
            <div style={S.placeChips}>
              {selected.map((p, i) => (
                <span key={i} style={S.placeChipEditable}>
                  📍 {p.name || "찍은 위치"}
                  <button style={S.placeChipX} onClick={() => removePlace(i)} aria-label="빼기">
                    <IconX size={10} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={S.placePickHint}>
              {locErr
                ? `현재 위치를 못 가져왔어요. 검색하거나 지도를 탭해서 장소를 추가해주세요.`
                : "검색하거나 지도를 탭해서 장소를 추가하세요. 여러 곳 추가할 수 있어요."}
            </div>
          )}
        </>
      )}
      <div style={S.placePickConfirmRow}>
        <button style={S.smallActionBtn} onClick={onCancel}>취소</button>
        <button
          style={{ ...S.smallActionBtn, background: "#D98763", color: "#fff", border: "none" }}
          onClick={() => onPick(selected)}
        >
          {selected.length ? `선택 완료 (${selected.length}곳)` : "장소 비우기"}
        </button>
      </div>
    </div>
  );
}
