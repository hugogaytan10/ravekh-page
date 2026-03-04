import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { URL as API_URL } from "../../Const/Const";
import { FeedbackModal } from "../components/FeedbackModal";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";
import { URL } from "../../Const/Const";
import { DynamicVisitQrToken, generateDynamicVisitQr } from "../Petitions";

type DynamicStreamStatus = "closed" | "connecting" | "open" | "error";

const buildEventStreamUrl = (businessId: number, token?: string) => {
  const streamUrl = new window.URL("visits/qr/dynamic/stream", API_URL);
  streamUrl.searchParams.set("businessId", String(businessId));

  if (token) {
    streamUrl.searchParams.set("token", token);
  }

  return streamUrl.toString();
};

const resolveDomain = () =>
  WEB_COUPONS_DOMAIN && WEB_COUPONS_DOMAIN !== "https://TU_DOMINIO"
    ? WEB_COUPONS_DOMAIN
    : window.location.origin;

export const VisitsDynamicQrScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;
  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;

  const [dynamicQr, setDynamicQr] = useState<DynamicVisitQrToken | null>(null);
  const [isDynamicLoading, setIsDynamicLoading] = useState(false);
  const [dynamicStreamStatus, setDynamicStreamStatus] = useState<DynamicStreamStatus>("closed");
  const [dynamicLastUpdateAt, setDynamicLastUpdateAt] = useState<number | null>(null);
  const [showDynamicUpdated, setShowDynamicUpdated] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  const dynamicStreamRef = useRef<EventSource | null>(null);
  const dynamicReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dynamicRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dynamicHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dynamicReconnectAttemptsRef = useRef(0);
  const isDynamicActiveRef = useRef(false);
  const fetchDynamicVisitQrRef = useRef<(() => void) | null>(null);

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const closeDynamicStream = useCallback(() => {
    if (dynamicReconnectTimeoutRef.current) {
      clearTimeout(dynamicReconnectTimeoutRef.current);
      dynamicReconnectTimeoutRef.current = null;
    }
    if (dynamicRefreshTimeoutRef.current) {
      clearTimeout(dynamicRefreshTimeoutRef.current);
      dynamicRefreshTimeoutRef.current = null;
    }
    if (dynamicHighlightTimeoutRef.current) {
      clearTimeout(dynamicHighlightTimeoutRef.current);
      dynamicHighlightTimeoutRef.current = null;
    }
    if (dynamicStreamRef.current) {
      dynamicStreamRef.current.close();
      dynamicStreamRef.current = null;
    }
    dynamicReconnectAttemptsRef.current = 0;
    setDynamicStreamStatus("closed");
    setShowDynamicUpdated(false);
  }, []);

  const scheduleDynamicRefresh = useCallback((seconds?: number | null) => {
    if (dynamicRefreshTimeoutRef.current) {
      clearTimeout(dynamicRefreshTimeoutRef.current);
      dynamicRefreshTimeoutRef.current = null;
    }

    if (!seconds || seconds <= 0) {
      return;
    }

    dynamicRefreshTimeoutRef.current = setTimeout(() => {
      if (isDynamicActiveRef.current && fetchDynamicVisitQrRef.current) {
        fetchDynamicVisitQrRef.current();
      }
    }, seconds * 1000);
  }, []);

  const applyDynamicQr = useCallback((nextQr: DynamicVisitQrToken) => {
    setDynamicQr(nextQr);
    setDynamicLastUpdateAt(Date.now());
    setShowDynamicUpdated(true);

    if (dynamicHighlightTimeoutRef.current) {
      clearTimeout(dynamicHighlightTimeoutRef.current);
    }

    dynamicHighlightTimeoutRef.current = setTimeout(() => {
      setShowDynamicUpdated(false);
    }, 2500);

    scheduleDynamicRefresh(nextQr?.refreshAfterSeconds);
  }, [scheduleDynamicRefresh]);

  const fetchDynamicVisitQr = useCallback(async () => {
    if (!businessId) {
      return;
    }

    try {
      setIsDynamicLoading(true);

      const data = await generateDynamicVisitQr(
        {
          businessId,
          domain: resolveDomain(),
        },
        token,
      );

      applyDynamicQr(data);
    } catch (error) {
      setDynamicStreamStatus("error");
      showFeedback("Error", error instanceof Error ? error.message : "No se pudo cargar el QR dinámico.");
    } finally {
      setIsDynamicLoading(false);
    }
  }, [applyDynamicQr, businessId, token]);

  useEffect(() => {
    fetchDynamicVisitQrRef.current = fetchDynamicVisitQr;
  }, [fetchDynamicVisitQr]);

  const openDynamicStream = useCallback(() => {
    if (!businessId || typeof window === "undefined" || typeof window.EventSource === "undefined") {
      return;
    }

    closeDynamicStream();
    isDynamicActiveRef.current = true;
    setDynamicStreamStatus("connecting");

    const stream = new window.EventSource(buildEventStreamUrl(businessId, token));
    dynamicStreamRef.current = stream;

    stream.onopen = () => {
      dynamicReconnectAttemptsRef.current = 0;
      setDynamicStreamStatus("open");
    };

    const handlePayload = (rawData?: string) => {
      try {
        const payload = rawData ? (JSON.parse(rawData) as DynamicVisitQrToken) : null;
        if (payload?.qrUrl) {
          applyDynamicQr(payload);
        }
      } catch {
        // noop
      }
    };

    stream.addEventListener("nextQr", (event) => {
      const customEvent = event as MessageEvent<string>;
      handlePayload(customEvent.data);
    });

    stream.onmessage = (event) => {
      handlePayload(event.data);
    };

    stream.onerror = () => {
      setDynamicStreamStatus("error");
      if (!isDynamicActiveRef.current || dynamicReconnectTimeoutRef.current) {
        return;
      }

      stream.close();
      dynamicStreamRef.current = null;

      const attempt = dynamicReconnectAttemptsRef.current + 1;
      dynamicReconnectAttemptsRef.current = attempt;
      const delayMs = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));

      dynamicReconnectTimeoutRef.current = setTimeout(() => {
        dynamicReconnectTimeoutRef.current = null;
        if (isDynamicActiveRef.current) {
          openDynamicStream();
        }
      }, delayMs);
    };
  }, [applyDynamicQr, businessId, closeDynamicStream, token]);

  useEffect(() => {
    isDynamicActiveRef.current = true;
    openDynamicStream();
    void fetchDynamicVisitQr();

    return () => {
      isDynamicActiveRef.current = false;
      closeDynamicStream();
    };
  }, [closeDynamicStream, fetchDynamicVisitQr, openDynamicStream]);

  const dynamicStatusLabel = useMemo(() => {
    if (dynamicStreamStatus === "open") {
      return "Conectado en tiempo real";
    }
    if (dynamicStreamStatus === "connecting") {
      return "Conectando al stream...";
    }
    if (dynamicStreamStatus === "error") {
      return "Conexión inestable, reintentando...";
    }
    return "Sin conexión en tiempo real";
  }, [dynamicStreamStatus]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/cuponespv/visitas");
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="mx-auto max-w-xl px-5 py-5">
        <header className="mb-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full p-1 transition hover:bg-gray-200"
            aria-label="Regresar"
          >
            <ChevronBack width={24} height={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-[#565656]">QR dinámico</h1>
        </header>

        <p className="mb-2 text-[13px] text-[#7A7A7A]">Este QR se actualiza al escanearse en tiempo real.</p>
        <p className="mb-4 text-xs font-semibold" style={{ color: accentColor }}>
          {dynamicStatusLabel}
        </p>

        <section
          className={`rounded-2xl border bg-white p-4 shadow-sm transition ${showDynamicUpdated ? "ring-2" : ""}`}
          style={{
            borderColor: showDynamicUpdated ? accentColor : "#e5e7eb",
            boxShadow: showDynamicUpdated ? `0 0 0 2px ${accentColor}20` : undefined,
          }}
        >
          {!!dynamicQr?.qrUrl && (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="rounded-xl p-1 transition hover:bg-gray-100"
                onClick={() => setIsQrZoomed(true)}
                aria-label="Ampliar QR dinámico"
              >
                <QRCodeSVG value={dynamicQr.qrUrl} size={190} level="M" />
              </button>
              <p className="text-xs text-[#7A7A7A]">Toca el QR para ampliarlo.</p>
              <p className="break-all text-center text-xs font-semibold text-[#565656]">{dynamicQr.qrUrl}</p>
            </div>
          )}

          {!dynamicQr && !isDynamicLoading && (
            <p className="text-sm text-[#565656]">No hay un QR dinámico activo todavía.</p>
          )}

          {isDynamicLoading && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              <p className="text-sm text-[#565656]">Cargando...</p>
            </div>
          )}

          {dynamicLastUpdateAt && (
            <p className="mt-3 text-xs text-[#7A7A7A]">
              Última actualización: {new Date(dynamicLastUpdateAt).toLocaleTimeString()}
            </p>
          )}
        </section>
      </div>

      <FeedbackModal
        visible={feedbackVisible}
        title={feedbackTitle}
        message={feedbackMessage}
        onClose={() => setFeedbackVisible(false)}
        accentColor={accentColor}
      />

      {isQrZoomed && !!dynamicQr?.qrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
          onClick={() => setIsQrZoomed(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
              setIsQrZoomed(false);
            }
          }}
          aria-label="Cerrar vista ampliada del QR"
        >
          <div className="rounded-2xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <QRCodeSVG value={dynamicQr.qrUrl} size={300} level="M" />
            <button
              type="button"
              className="mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: accentColor }}
              onClick={() => setIsQrZoomed(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
