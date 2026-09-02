import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import SignedImage, { prefetchSignedUrls } from "./SignedImage";
import PhotoLightbox from "./PhotoLightbox";
import Avatar from "./Avatar";

const MIN_RATIO = 0.8; // 4:5 세로 한계
const MAX_RATIO = 1.91; // 파노라마 가로 한계
const clampRatio = (w, h) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h));

// 사진이 여러 장이면 인스타그램 피드처럼 옆으로 슬라이드해서 넘겨볼 수 있는 뷰어.
// 사진마다 원본 비율을 읽어서 박스 높이를 그 비율에 맞춰주고(잘리지 않음), 탭하면 원본 확대 보기가 열림.
export default function PhotoCarousel({ photos, who }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const [ratios, setRatios] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // active가 바뀌면 wrapRatio(=박스 aspect-ratio)가 바뀌어 박스 높이가 변하는데,
  // 스크롤 이벤트마다(=스와이프 도중에도 계속) 바로 반영해버리면 손가락으로 밀고 있는 중에
  // 박스 높이가 움직여서 네이티브 스크롤 스냅이랑 싸우다가 절반만 슬라이드된 채 멈추는
  // 문제가 있었음. 스와이프가 멈춘 뒤(디바운스)로 미뤄서 이 문제를 피한다.
  // 이 묶음의 서명 URL을 한 배치로 미리 받아둔다 (바이트가 아니라 URL만 — 가벼움).
  // 슬라이드를 넘길 때 사진마다 서명 요청 왕복이 붙던 걸 없앤다.
  useEffect(() => {
    prefetchSignedUrls(photos.map((p) => p.storage_path));
  }, [photos]);

  const scrollTimer = useRef(null);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      setActive(Math.round(el.scrollLeft / el.clientWidth));
    }, 100);
  };
  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  const onImgLoad = (id) => (ev) => {
    const { naturalWidth: w, naturalHeight: h } = ev.target;
    if (!w || !h) return;
    const r = clampRatio(w, h);
    setRatios((prev) => (prev[id] === r ? prev : { ...prev, [id]: r }));
  };

  const wrapRatio = ratios[photos[active]?.id] || 1;

  return (
    <>
      <div style={{ ...S.carouselWrap, aspectRatio: wrapRatio }}>
        <div ref={scrollRef} className="no-scrollbar" style={S.carouselScroll} onScroll={onScroll}>
          {photos.map((p, i) => (
            <div key={p.id} style={S.carouselSlide}>
              {/* 피드에 카드가 여러 장 뜰 때 안 보이는 슬라이드까지 한꺼번에 다운로드되지 않도록 창을 두되,
                  넘길 때 바로 뜨도록 앞뒤 2장까지는 미리 받는다 */}
              {Math.abs(i - active) <= 2 && (
                <SignedImage
                  path={p.storage_path}
                  style={S.carouselImg}
                  onLoad={onImgLoad(p.id)}
                  onClick={() => setLightboxIndex(i)}
                />
              )}
              {who && p.uploaded_by && (
                <div style={S.photoByAv}>
                  <Avatar person={who(p.uploaded_by)} size={26} style={{ border: "2px solid #fff" }} />
                </div>
              )}
            </div>
          ))}
        </div>
        {photos.length > 1 && <span style={S.carouselCount}>{active + 1}/{photos.length}</span>}
        {photos.length > 1 && (
          <div style={S.carouselDots}>
            {photos.map((_, i) => (
              <span key={i} style={{ ...S.carouselDot, ...(i === active ? S.carouselDotOn : {}) }} />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex != null && (
        <PhotoLightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
