import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export const ProductCarousel: React.FC<Props> = ({ images, alt, className }) => {
  const validImages = (images ?? []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setIndex((i) => (i + 1) % validImages.length);
  const prev = () => setIndex((i) => (i - 1 + validImages.length) % validImages.length);
  const go = (i: number) => setIndex(i);

  // soporte teclado (← →)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const isInside = containerRef.current.contains(document.activeElement);
      if (!isInside) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // swipe (touch)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let delta = 0;

    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchMove = (e: TouchEvent) => { delta = e.touches[0].clientX - startX; };
    const onTouchEnd = () => {
      if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
      delta = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (validImages.length === 0) {
    return (
      <div className={`w-full aspect-[4/5] bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] ${className ?? ""}`} />
    );
  }

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="relative w-full select-none"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Galería de imágenes del producto"
      >
        <div className="w-full aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-subtle)]">
          <AnimatePresence mode="wait">
            <motion.img
              key={validImages[index]}
              src={validImages[index]}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-[var(--text-primary)]"
                  : "w-2 bg-[var(--border-default)]"
              }`}
            />
          ))}
          <div className="ml-auto flex gap-2 text-[var(--text-secondary)]">
            <button
              onClick={prev}
              aria-label="Imagen anterior"
              className="w-9 h-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] grid place-content-center"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Imagen siguiente"
              className="w-9 h-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] grid place-content-center"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
