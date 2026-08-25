// 카카오맵 JS SDK를 실제로 지도가 필요한 화면에서만 동적으로 불러온다.
let loadPromise = null;

export function loadKakaoMaps() {
  if (typeof window !== "undefined" && window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao);
  }
  if (loadPromise) return loadPromise;

  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  if (!appKey) {
    return Promise.reject(new Error("VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다."));
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("카카오맵을 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
