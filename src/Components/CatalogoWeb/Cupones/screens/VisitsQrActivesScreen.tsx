import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useParams } from "react-router-dom";
import { VisitsSharedScreen } from "./VisitsSharedScreen";
import { AppContext } from "../../Context/AppContext";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";
import { URL } from "../../Const/Const";

const VISITS_OFFLINE_POOL_KEY = "ravekh-visits-offline-qr-pool";

const normalizeTokenText = (item: unknown): string => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const tokenValue = (item as { token?: string; qr?: string; url?: string }).token;
    if (tokenValue) {
      return tokenValue;
    }

    const qrValue = (item as { token?: string; qr?: string; url?: string }).qr;
    if (qrValue) {
      return qrValue;
    }

    const urlValue = (item as { token?: string; qr?: string; url?: string }).url;
    if (urlValue) {
      return urlValue;
    }
  }

  return "";
};

const buildVisitQrUrl = (tokenText: string): string => {
  if (!tokenText) {
    return "";
  }

  if (/^https?:\/\//i.test(tokenText)) {
    return tokenText;
  }

  const domain = URL;

  return `${domain}/visit/redeem?token=${encodeURIComponent(tokenText)}`;
};

const printQrTicket = (svgMarkup: string, qrUrl: string) => {
  const printWindow = window.open("", "_blank", "width=420,height=720");

  if (!printWindow) {
    throw new Error("No fue posible abrir la ventana de impresión.");
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Imprimir QR</title>
        <style>
          @page { size: 80mm auto; margin: 6mm; }
          html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .ticket {
            width: 68mm;
            margin: 0 auto;
            text-align: center;
            color: #111827;
          }
          .title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
          .qr { margin: 10px auto; }
          .url { font-size: 10px; word-break: break-all; margin-top: 8px; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="title">QR visita online</div>
          <div class="qr">${svgMarkup}</div>
          <div class="url">${qrUrl}</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isTouchDevice = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

  return isTouchDevice || isMobileUserAgent;
};

const sendVisitQrToPrintEndpoint = async (qrUrl: string): Promise<void> => {
  const response = await fetch(`${URL}/print`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `QR visita online:\n${qrUrl}`,
      model: "XPrinter XP-80",
    }),
  });

  if (!response.ok) {
    const result = await response.text().catch(() => "");
    throw new Error(result || "No se pudo enviar la impresión al endpoint /print.");
  }
};

export const VisitsQrActivesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const businessId = Number(context.user?.Business_Id || 0);
  const accentColor = context.store?.Color ?? "#2934D0";
  const qrWrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [mobilePrintMarkup, setMobilePrintMarkup] = useState<{ svgMarkup: string; qrUrl: string } | null>(null);

  const stateTokens = (location.state as { tokens?: unknown[] } | null)?.tokens ?? [];

  const offlineTokens = useMemo(() => {
    if (mode !== "offline" || !businessId) {
      return [];
    }

    const raw = localStorage.getItem(VISITS_OFFLINE_POOL_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown[]>;
      return Array.isArray(parsed?.[String(businessId)]) ? parsed[String(businessId)] : [];
    } catch {
      return [];
    }
  }, [businessId, mode]);

  const tokensToRender = mode === "offline" ? (stateTokens.length ? stateTokens : offlineTokens) : stateTokens;
  const isOnlineMode = mode === "online";
  const screenTitle = isOnlineMode ? "QRs online activos" : "QRs offline activos";
  const screenSubtitle = isOnlineMode
    ? "Consulta e imprime el código QR para canjes en línea."
    : "Consulta e imprime los códigos QR disponibles para operar sin internet.";

  useEffect(() => {
    if (!mobilePrintMarkup) {
      return undefined;
    }

    const onAfterPrint = () => setMobilePrintMarkup(null);
    window.addEventListener("afterprint", onAfterPrint);
    const timerId = window.setTimeout(() => window.print(), 80);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [mobilePrintMarkup]);

  const handlePrintQr = async (key: string, qrUrl: string) => {
    try {
      const svgMarkup = qrWrapperRefs.current[key]?.querySelector("svg")?.outerHTML;
      if (!svgMarkup || !qrUrl) {
        return;
      }

      if (isMobileDevice()) {
        try {
          await sendVisitQrToPrintEndpoint(qrUrl);
          window.alert("QR enviado a /print correctamente.");
          return;
        } catch {
          setMobilePrintMarkup({ svgMarkup, qrUrl });
        }

        return;
      }

      printQrTicket(svgMarkup, qrUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar la impresión.";
      window.alert(message);
    }
  };

  return (
    <>
      <style>
        {`
          @media print {
            .visits-qr-screen-root { display: none !important; }
            .mobile-print-ticket { display: block !important; }
          }
        `}
      </style>
      <div className="visits-qr-screen-root">
        <VisitsSharedScreen
          title={screenTitle}
          subtitle={screenSubtitle}
        >
          <p className="mb-3 text-sm text-[#565656]">
            Mostrando códigos activos en modo <strong>{mode ?? "offline"}</strong>.
          </p>
          {tokensToRender.length === 0 ? (
            <p className="text-sm text-[#7A7A7A]">No hay códigos QR disponibles todavía.</p>
          ) : (
            <ul className="space-y-3">
              {tokensToRender.map((item, index) => {
                const normalizedToken = normalizeTokenText(item);
                const qrUrl = buildVisitQrUrl(normalizedToken);
                const qrKey = `${normalizedToken}-${index}`;

                return (
                  <li key={qrKey} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    {normalizedToken ? (
                      <div className="flex flex-col items-center gap-3">
                        <div ref={(element) => {
                          qrWrapperRefs.current[qrKey] = element;
                        }}>
                          <QRCodeSVG value={qrUrl} size={170} level="M" />
                        </div>
                        <p className="break-all text-center text-xs font-semibold text-[#565656]">{qrUrl}</p>
                        {isOnlineMode && (
                          <button
                            type="button"
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                            style={{ backgroundColor: accentColor }}
                            onClick={() => handlePrintQr(qrKey, qrUrl)}
                          >
                            Imprimir QR (80 mm)
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="break-all text-xs font-semibold text-[#565656]">QR generado</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </VisitsSharedScreen>
      </div>

      {mobilePrintMarkup && (
        <div className="mobile-print-ticket hidden">
          <div style={{ width: "68mm", margin: "0 auto", textAlign: "center", color: "#111827", fontFamily: "Arial, sans-serif" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>QR visita online</p>
            <div dangerouslySetInnerHTML={{ __html: mobilePrintMarkup.svgMarkup }} />
            <p style={{ fontSize: "10px", wordBreak: "break-all", marginTop: "8px", color: "#4b5563" }}>{mobilePrintMarkup.qrUrl}</p>
          </div>
        </div>
      )}
    </>
  );
};
