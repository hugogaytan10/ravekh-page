import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { FeedbackModal } from "../components/FeedbackModal";
import { QRCodeSVG } from "qrcode.react";
import { Coupon } from "../types";
import { deleteCoupon, getCouponById, updateCoupon } from "../Petitions";
import { hasCuponesSession } from "../../../../coupons/services/session";
import { formatDateTime, getCouponId, mergeDateAndTime, parseValidDate, toDatetimeLocalValue } from "../shared/couponsUtils";
import {Trash} from "../../../../assets/POS/Trash";

const fromBackendDate = (value?: string): string => {
  const parsed = parseValidDate(value);
  return parsed ? toDatetimeLocalValue(parsed) : "";
};

const isValidPositiveInt = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
};

const mapCouponResponse = (coupon: Coupon): Coupon => {
  const normalizedId = getCouponId(coupon);

  return {
    ...coupon,
    ...(normalizedId ? { Id: normalizedId } : {}),
  };
};

const formatDisplayDate = (value: string): string => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // similar a “formatDateTime” del RN (fecha + hora)
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};


const CuponesEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CouponId } = useParams();
  const context = useContext(AppContext);

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;

  const couponId = useMemo(() => Number(CouponId), [CouponId]);
  const isCouponIdInvalid = !Number.isInteger(couponId) || couponId <= 0;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("1");
  const [validDate, setValidDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate("/cuponespv");
      return;
    }
    navigate("/cuponespv/cupones");
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    // Chrome/Edge soportan showPicker
    // Safari no, pero click abre igual
    // @ts-expect-error: showPicker es experimental
    if (typeof input.showPicker === "function") input.showPicker();
    else input.click();
  };

  useEffect(() => {
    const isCouponsPublicFlow = location.pathname.startsWith("/cupones/");

    if (isCouponsPublicFlow && !hasCuponesSession()) {
      navigate("/cupones", { replace: true });
      return;
    }

    if (isCouponIdInvalid) {
      setErrorMessage("Cupón inválido");
      setIsLoading(false);
      return;
    }

    const loadCoupon = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getCouponById(couponId, token);
        if (!data) {
          setErrorMessage("No se encontró el cupón.");
          setCoupon(null);
          return;
        }

        const normalized = mapCouponResponse(data);
        setCoupon(normalized);
        setDescription(normalized.Description || "");
        setLimitUsers(String(normalized.LimitUsers || 1));
        setValidDate(fromBackendDate(normalized.Valid));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el cupón.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCoupon();
  }, [couponId, isCouponIdInvalid, location.pathname, navigate, token]);

  const handleSave = async () => {
    if (!coupon || isCouponIdInvalid) {
      showFeedback("Error", "Cupón inválido");
      return;
    }

    if (!description.trim()) {
      showFeedback("Error", "La descripción es obligatoria.");
      return;
    }

    if (!isValidPositiveInt(limitUsers)) {
      showFeedback("Error", "El número de usuarios debe ser mayor a 0.");
      return;
    }

    setIsUpdating(true);

    try {
      const parsedValidDate = validDate ? new Date(validDate) : null;
      const mergedDate = parsedValidDate ? mergeDateAndTime(parsedValidDate) : "";
      const payload: Coupon = {
        Business_Id: Number(coupon.Business_Id) || businessId,
        QR: coupon.QR,
        Description: description.trim(),
        LimitUsers: Number(limitUsers),
        ...(mergedDate ? { Valid: formatDateTime(new Date(mergedDate)) } : {}),
      };

      const updated = await updateCoupon(couponId, payload, token);
      const updatedCouponData = typeof updated === "object" && updated ? updated : {};
      const normalized = mapCouponResponse({
        ...payload,
        ...updatedCouponData,
        ...(getCouponId(updated) ? { Id: getCouponId(updated) } : {}),
      });

      setCoupon(normalized);
      setDescription(normalized.Description || "");
      setLimitUsers(String(normalized.LimitUsers || 1));
      setValidDate(fromBackendDate(normalized.Valid));
      showFeedback("Éxito", "Cupón actualizado correctamente.");
    } catch (error) {
      showFeedback("Error", error instanceof Error ? error.message : "No se pudo actualizar el cupón.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isCouponIdInvalid) {
      showFeedback("Error", "Cupón inválido");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCoupon(couponId, token);
      showFeedback("Éxito", "Cupón eliminado correctamente.");
      navigate("/cupones/admin", { replace: true });
    } catch (error) {
      showFeedback("Error", error instanceof Error ? error.message : "No se pudo eliminar el cupón.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        {/* Header (RN-like) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-[0_10px_25px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/5 hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.45)] transition"
              aria-label="Regresar"
            >
              <ChevronBack width={22} height={22} />
            </button>

            <h1 className="text-[18px] font-semibold text-[#1F2937]">Editar cupón</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isUpdating || isDeleting || isLoading}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.35)] text-[#565656] hover:text-[#111827] disabled:opacity-50 transition"
            aria-label="Eliminar"
            title="Eliminar"
          >
            <Trash width={22} height={22} />
          </button>
        </div>

        <p className="mt-2 text-sm text-[#6B7280]">
          Configura tu nuevo cupón para tus clientes
        </p>

        {/* Error */}
        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Card */}
        <section className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-black/5 shadow-[0_18px_35px_-25px_rgba(0,0,0,0.35)]">
          {isLoading ? (
            <div className="flex items-center gap-3 py-8">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
              <span className="text-sm font-semibold text-[#111827]">Cargando cupón...</span>
            </div>
          ) : !coupon ? (
            <p className="py-8 text-sm font-semibold text-[#111827]">
              No se pudo cargar la información del cupón.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Descripción */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#111827]">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full min-h-28 resize-none rounded-2xl border border-black/10 bg-[#F7F7F8] px-3 py-3 text-sm font-medium text-[#111827] placeholder:text-black/40 outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5"
                  placeholder="Ej: 2x1 en café mate"
                />
              </div>

              {/* LimitUsers */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#111827]">
                  Número de usuarios válidos
                </label>
                <input
                  type="number"
                  min={1}
                  value={limitUsers}
                  onChange={(event) => setLimitUsers(event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#F7F7F8] px-3 py-3 text-sm font-medium text-[#111827] outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5"
                  inputMode="numeric"
                />
              </div>

              {/* Fecha (pressable estilo RN) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#111827]">
                  Fecha límite de cupón
                </label>

                <button
                  type="button"
                  onClick={openDatePicker}
                  className="w-full rounded-2xl border border-black/10 bg-[#F7F7F8] px-3 py-3 text-left outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={[
                        "text-sm font-medium",
                        validDate ? "text-[#111827]" : "text-black/45",
                      ].join(" ")}
                    >
                      {validDate ? formatDisplayDate(validDate) : "Fecha límite de cupón"}
                    </span>
                    <span className="text-[#111827] text-base leading-none">◷</span>
                  </div>

                  {/* input oculto pero funcional */}
                  <input
                    ref={dateInputRef}
                    type="datetime-local"
                    value={validDate}
                    onChange={(event) => setValidDate(event.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </button>
              </div>

              {/* QR */}
              {!!coupon.QR && (
                <div className="rounded-3xl border border-black/10 bg-white p-4">
                  <div className="flex justify-center">
                    <QRCodeSVG value={coupon.QR} size={140} level="M" />
                  </div>
                </div>
              )}

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating || isDeleting}
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-25px_rgba(0,0,0,0.6)] disabled:opacity-60 transition"
                style={{ backgroundColor: accentColor }}
              >
                {isUpdating ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Delete bottom sheet (RN-like) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9998]">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-[9999] mx-auto w-full max-w-[480px] px-4 pb-6">
            <div className="rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
              <h3 className="text-[18px] font-semibold text-[#111827]">Eliminar cupón</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Esta acción es irreversible</p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-black/[0.02] transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 transition"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default CuponesEdit;
