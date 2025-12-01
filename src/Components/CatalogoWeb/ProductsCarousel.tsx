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
      <div className={`w-full h-96 bg-gray-100 rounded-lg ${className ?? ""}`} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className ?? ""}`}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Galería de imágenes del producto"
    >
      <div className="w-full h-96 overflow-hidden rounded-lg bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={validImages[index]}
            src={validImages[index]}
            alt={alt}
            loading="lazy"
            className="w-full h-96 object-cover"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>

      {/* Controles */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 grid place-content-center"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 grid place-content-center"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white shadow" : "w-2 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {validImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border ${i === index ? "border-black/60" : "border-transparent"}`}
              aria-label={`Miniatura ${i + 1}`}
            >
              <img src={src} alt={`${alt} miniatura ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
