import { useEffect, useState } from "react";
import {
  getThemeColorFromSection,
  landingFallbackColor,
} from "../service/getThemeColorFromSection";

export const useLandingStatusBar = (containerRef) => {
  const [statusBarColor, setStatusBarColor] = useState(landingFallbackColor);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const sections = containerRef.current.querySelectorAll("section[data-endcolor]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const color = getThemeColorFromSection(entry.target);
          setStatusBarColor(color);
          entry.target.style.backgroundColor = color;
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [containerRef]);

  return statusBarColor;
};
