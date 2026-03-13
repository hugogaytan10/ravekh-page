import { useEffect, useRef, useState } from "react";

export const useSectionTextAnimation = (threshold = 0.6) => {
  const sectionRef = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    let timeoutId;

    if (!sectionNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldAnimate(false);
        timeoutId = window.setTimeout(() => {
          setShouldAnimate(true);
        }, 50);
      },
      { threshold }
    );

    observer.observe(sectionNode);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      observer.unobserve(sectionNode);
      observer.disconnect();
    };
  }, [threshold]);

  return { sectionRef, shouldAnimate };
};
