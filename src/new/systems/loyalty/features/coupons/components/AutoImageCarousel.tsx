import React, { useEffect, useMemo, useState } from "react";

interface AutoImageCarouselProps {
  images: string[];
  intervalMs?: number;
  className?: string;
}

const AutoImageCarousel: React.FC<AutoImageCarouselProps> = ({ images, intervalMs = 3200, className }) => {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs, safeImages.length]);

  if (safeImages.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full max-w-[280px] h-48 ${className ?? ""}`}>
      {safeImages.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt="Ilustración de beneficios"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
};

export { AutoImageCarousel };
