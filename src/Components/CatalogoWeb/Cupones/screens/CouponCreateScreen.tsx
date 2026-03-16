import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { FeedbackModal } from "../components/FeedbackModal";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";
import { buildQrCode, formatDateTime, getCouponId, mergeDateAndTime } from "../shared/couponsUtils";
import { createCoupon, updateCoupon } from "../Petitions";
import { Coupon } from "../types";

export const CouponCreateScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;

  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("");
  const [validDateTime, setValidDateTime] = useState("");
  const [generatedCoupon, setGeneratedCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const couponsDomain = WEB_COUPONS_DOMAIN || window.location.origin;
  const couponLink = useMemo(() => {
    if (!generatedCoupon) {
      return "";
    }

    const couponId = getCouponId(generatedCoupon);
    const suffix = couponId || generatedCoupon.QR;
    return `${couponsDomain}/cupones/${suffix}`;
  }, [couponsDomain, generatedCoupon]);

  const qrDisplayValue = useMemo(() => {
    if (!generatedCoupon?.QR) {
      return "";
    }

    return couponLink || generatedCoupon.QR;
  }, [couponLink, generatedCoupon?.QR]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate("/cuponespv/cupones");
      return;
    }

    navigate("/cuponespv/cupones");
  };

  const handleSaveCoupon = async () => {
    const cleanDescription = description.trim();
    const cleanLimit = limitUsers.trim();

    if (!cleanDescription || !cleanLimit) {
      showFeedback("Error", "La descripción y el número de usuarios válidos son obligatorios.");
      return;
    }

    if (!Number.isFinite(Number(cleanLimit)) || Number(cleanLimit) <= 0) {
      showFeedback("Error", "El número de usuarios válidos debe ser mayor a 0.");
      return;
    }

    if (!businessId) {
      showFeedback("Error", "Sesión inválida");
      return;
    }

    if (!token) {
      showFeedback("Error", "Falta token");
      return;
    }

    const validDate = validDateTime ? new Date(validDateTime) : null;
    const mergedDate = validDate ? mergeDateAndTime(validDate) : "";

    const payload: Coupon = {
      Business_Id: businessId,
      QR: generatedCoupon?.QR || buildQrCode(),
      Description: cleanDescription,
      LimitUsers: Number(cleanLimit),
      ...(mergedDate ? { Valid: formatDateTime(new Date(mergedDate)) } : {}),
    };

    setIsSaving(true);

    try {
      const existingId = getCouponId(generatedCoupon);
      const responseCoupon = existingId
        ? await updateCoupon(existingId, payload, token)
        : await createCoupon(payload, token);

      const responseCouponData =
        typeof responseCoupon === "object" && responseCoupon ? responseCoupon : {};

      const resolvedId =
        getCouponId(responseCoupon) || existingId || getCouponId(generatedCoupon);

      const resolvedQr =
        (responseCouponData as Partial<Coupon>).QR || generatedCoupon?.QR || payload.QR;

      const normalizedCoupon: Coupon = {
        ...payload,
        ...responseCouponData,
        ...(resolvedId ? { Id: resolvedId } : {}),
        QR: resolvedQr,
      };

      setGeneratedCoupon(normalizedCoupon);
      showFeedback(
        "Éxito",
        resolvedId ? "Cupón actualizado correctamente." : "Cupón generado correctamente.",
      );
    } catch (error) {
      showFeedback("Error", error instanceof Error ? error.message : "No se pudo guardar el cupón.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!couponLink) {
      showFeedback("Error", "Primero genera un cupón para obtener el enlace.");
      return;
    }

    try {
      await navigator.clipboard.writeText(couponLink);
      showFeedback("Éxito", "Link copiado al portapapeles.");
    } catch {
      showFeedback("Error", "No se pudo copiar el link.");
    }
  };

  const handleShareCoupon = async () => {
    if (!couponLink) {
      showFeedback("Error", "Primero genera un cupón para compartirlo.");
      return;
    }

    const shareText = `${description.trim() || "Cupón Ravekh"}
${couponLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cupón Ravekh",
          text: shareText,
          url: couponLink,
        });
        return;
      } catch {
        showFeedback("Error", "No se pudo compartir el cupón.");
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(couponLink);
      showFeedback("Info", "Tu navegador no soporta compartir; se copió el link.");
    } catch {
      showFeedback("Error", "Tu navegador no soporta compartir y no se pudo copiar el link.");
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
          <h1 className="text-[18px] font-semibold text-[#565656]">Generar nuevo cupón</h1>
        </header>

        <p className="mb-4 text-[13px] text-[#7A7A7A]">Configura tu nuevo cupón para tus clientes</p>

        <section className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#565656]">Descripción</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full min-h-24 border border-gray-300 rounded-xl px-3 py-2 text-[#111827] font-semibold"
              placeholder="Describe tu cupón"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#565656]">Número de usuarios válidos</label>
            <input
              type="number"
              min="1"
              value={limitUsers}
              onChange={(event) => setLimitUsers(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[#111827] font-semibold"
              placeholder="Ej. 20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#565656]">Fecha límite de cupón</label>
            <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
              <input
                type="datetime-local"
                value={validDateTime}
                onChange={(event) => setValidDateTime(event.target.value)}
                className="block w-full min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-[#111827] font-semibold outline-none"
              />
            </div>
          </div>

          {generatedCoupon?.QR && (
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="flex justify-center">
                {qrDisplayValue ? (
                  <QRCodeSVG value={qrDisplayValue} size={140} level="M" />
                ) : (
                  <div className="h-[140px] w-[140px] rounded-xl bg-gray-100" />
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Copiar link
                </button>
                <button
                  type="button"
                  onClick={handleShareCoupon}
                  className="rounded-xl border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Compartir cupón
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveCoupon}
            disabled={isSaving}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {isSaving ? "Guardando..." : getCouponId(generatedCoupon) ? "Actualizar cupón" : "Guardar"}
          </button>
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
