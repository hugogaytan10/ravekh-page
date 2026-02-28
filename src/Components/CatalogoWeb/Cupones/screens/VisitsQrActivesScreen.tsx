import React, { useContext, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useParams } from "react-router-dom";
import { VisitsSharedScreen } from "./VisitsSharedScreen";
import { AppContext } from "../../Context/AppContext";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";

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

  const domain = WEB_COUPONS_DOMAIN && WEB_COUPONS_DOMAIN !== "https://TU_DOMINIO"
    ? WEB_COUPONS_DOMAIN
    : window.location.origin;

  return `${domain}/visit/redeem?token=${encodeURIComponent(tokenText)}`;
};

export const VisitsQrActivesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const businessId = Number(context.user?.Business_Id || 0);

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

  return (
    <VisitsSharedScreen
      title="QRs offline activos"
      subtitle="Consulta e imprime los códigos QR disponibles para operar sin internet."
    >
      <p className="mb-3 text-sm text-[#565656]">
        Mostrando códigos activos en modo <strong>{mode ?? "offline"}</strong>.
      </p>
      {tokensToRender.length === 0 ? (
        <p className="text-sm text-[#7A7A7A]">No hay códigos QR disponibles todavía.</p>
      ) : (
        <ul className="space-y-3">
          {tokensToRender.map((item, index) => (
            <li key={`${normalizeTokenText(item)}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              {normalizeTokenText(item) ? (
                <div className="flex flex-col items-center gap-3">
                  <QRCodeSVG value={buildVisitQrUrl(normalizeTokenText(item))} size={170} level="M" />
                  <p className="break-all text-center text-xs font-semibold text-[#565656]">
                    {buildVisitQrUrl(normalizeTokenText(item))}
                  </p>
                </div>
              ) : (
                <p className="break-all text-xs font-semibold text-[#565656]">QR generado</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </VisitsSharedScreen>
  );
};
