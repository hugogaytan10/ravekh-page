import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { FeedbackModal } from "../components/FeedbackModal";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";
import { URL } from "../../Const/Const";
import { generateVisitQrTokens } from "../Petitions";

const VISITS_OFFLINE_POOL_KEY = "ravekh-visits-offline-qr-pool";

const saveOfflineTokens = (businessId: number, tokens: unknown[]) => {
  const currentRaw = localStorage.getItem(VISITS_OFFLINE_POOL_KEY);
  const current = currentRaw ? JSON.parse(currentRaw) : {};
  const prevTokens = Array.isArray(current?.[businessId]) ? current[businessId] : [];

  localStorage.setItem(
    VISITS_OFFLINE_POOL_KEY,
    JSON.stringify({
      ...current,
      [businessId]: [...prevTokens, ...tokens],
    }),
  );
};

export const VisitsGenerateScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { mode } = useParams<{ mode: string }>();
  const modeLabel = mode === "offline" ? "offline" : "online";
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;
  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const [quantity, setQuantity] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const qrTitle = modeLabel === "offline" ? "Generar lote de QR" : "Generar QR para visita";
  const qrSubtitle = "Configura la cantidad para crear un código QR canjeable";
  const offlineSubtitle =
    "Los QR generados en este apartado serán utilizados para el modo de ventas offline dentro del ticket.";

  const domain = useMemo(
    () => (WEB_COUPONS_DOMAIN && WEB_COUPONS_DOMAIN !== "https://TU_DOMINIO" ? WEB_COUPONS_DOMAIN : window.location.origin),
    [],
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/cuponespv/visitas");
  };

  const handleGenerate = async () => {
    if (!businessId) {
      showFeedback("Error", "No se encontró el negocio para generar los QR.");
      return;
    }

    const parsedQuantity = Number(quantity || "1");
    const safeQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;

    try {
      setIsGenerating(true);

      const data = await generateVisitQrTokens(
        {
          businessId,
          quantity: safeQuantity,
          ttlMinutes: modeLabel === "offline" ? 20160 : 800,
          domain,
        },
        token,
      );

      if (!data?.tokens?.length) {
        throw new Error("No se recibieron códigos QR.");
      }

      if (modeLabel === "offline") {
        saveOfflineTokens(businessId, data.tokens);
      }

      navigate(`/cuponespv/visitas/qrs-activos/${modeLabel}`, {
        replace: true,
        state: { tokens: data.tokens },
      });
    } catch (error) {
      showFeedback("Error", error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setIsGenerating(false);
    }
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
          <h1 className="text-[18px] font-semibold text-[#565656]">{qrTitle}</h1>
        </header>

        <p className="mb-4 text-[13px] text-[#7A7A7A]">{modeLabel === "offline" ? offlineSubtitle : qrSubtitle}</p>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#565656]">Cantidad de QRs</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 font-semibold text-[#111827]"
              placeholder="1"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {isGenerating ? "Generando..." : "Generar QR"}
          </button>

          {modeLabel === "offline" && (
            <button
              type="button"
              onClick={() =>
                navigate(`/cuponespv/visitas/qrs-activos/${modeLabel}`, {
                  replace: true,
                })
              }
              className="w-full rounded-xl border px-4 py-3 text-sm font-semibold"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Ver QRs disponibles
            </button>
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
    </div>
  );
};
