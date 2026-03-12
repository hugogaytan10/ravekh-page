const FALLBACK_COLOR = "#6D01D1";

export const getThemeColorFromSection = (section) => {
  if (!section?.dataset?.endcolor) {
    return FALLBACK_COLOR;
  }

  return `rgb(${section.dataset.endcolor})`;
};

export const landingFallbackColor = FALLBACK_COLOR;
