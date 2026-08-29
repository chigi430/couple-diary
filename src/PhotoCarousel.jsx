import React, { useRef, useState } from "react";
import { S } from "./styles";
import SignedImage from "./SignedImage";
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

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

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
              {/* 피드에 카드가 여러 장 뜰 때 안 보이는 슬라이드까지 한꺼번에 다운로드되지 않도록, 현재 슬라이드 앞뒤 1장만 로드 */}
              {Math.abs(i - active) <= 1 && (
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
