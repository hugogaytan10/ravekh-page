type MetaPixelParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      eventName: string,
      params?: MetaPixelParams
    ) => void;
  }
}

export const trackMetaEvent = (
  eventName: string,
  params?: MetaPixelParams
): void => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, params);
};

export const trackMetaCustomEvent = (
  eventName: string,
  params?: MetaPixelParams
): void => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("trackCustom", eventName, params);
};