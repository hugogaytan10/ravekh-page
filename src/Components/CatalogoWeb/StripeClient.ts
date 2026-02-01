const STRIPE_JS_SRC = "https://js.stripe.com/v3/";

type StripeJs = {
  redirectToCheckout: (opts: { sessionId: string }) => Promise<{ error?: { message?: string } }>;
  initEmbeddedCheckout: (opts: { clientSecret: string }) => Promise<{
    mount: (element: HTMLElement) => void;
    unmount?: () => void;
    destroy?: () => void;
  }>;
};

declare global {
  interface Window {
    Stripe?: (key: string) => StripeJs;
  }
}

let stripePromise: Promise<StripeJs> | null = null;
let stripeKey: string | null = null;

const loadStripeScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${STRIPE_JS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar Stripe.js")));
      return;
    }

    const script = document.createElement("script");
    script.src = STRIPE_JS_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("No se pudo cargar Stripe.js")));
    document.head.appendChild(script);
  });

export const getStripe = async (publishableKey: string): Promise<StripeJs> => {
  if (!publishableKey) {
    throw new Error("Falta la publishable key de Stripe");
  }

  if (stripePromise && stripeKey === publishableKey) {
    return stripePromise;
  }

  stripeKey = publishableKey;
  stripePromise = loadStripeScript().then(() => {
    if (!window.Stripe) {
      throw new Error("Stripe.js no está disponible");
    }
    return window.Stripe(publishableKey);
  });

  return stripePromise;
};

export {};
