import { useEffect, useMemo, useState } from "react";

const NAVBAR_HEIGHT = 92;

export const usePosMarketingNavigation = (items) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "inicio");

  const sectionIds = useMemo(() => items.map(({ id }) => id), [items]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (intersectingSection?.target?.id) {
          setActiveSection(intersectingSection.target.id);
        }
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  const handleNavigateTo = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    const offsetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return {
    isMenuOpen,
    activeSection,
    setIsMenuOpen,
    handleNavigateTo,
  };
};
