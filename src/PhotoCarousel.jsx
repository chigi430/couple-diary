import React, { useRef, useState } from "react";
import { S } from "./styles";
import SignedImage from "./SignedImage";

// 사진이 여러 장이면 인스타그램 피드처럼 옆으로 슬라이드해서 넘겨볼 수 있는 뷰어.
export default function PhotoCarousel({ photos, who }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div style={S.carouselWrap}>
      <div ref={scrollRef} className="no-scrollbar" style={S.carouselScroll} onScroll={onScroll}>
        {photos.map((p) => (
          <div key={p.id} style={S.carouselSlide}>
            <SignedImage path={p.storage_path} style={S.carouselImg} />
            {who && (
              <span style={{ ...S.photoBy, background: who(p.uploaded_by).color }}>{who(p.uploaded_by).emoji}</span>
            )}
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div style={S.carouselDots}>
          {photos.map((_, i) => (
            <span key={i} style={{ ...S.carouselDot, ...(i === active ? S.carouselDotOn : {}) }} />
          ))}
        </div>
      )}
    </div>
  );
}
