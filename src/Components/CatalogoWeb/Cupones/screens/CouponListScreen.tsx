import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { FeedbackModal } from "../components/FeedbackModal";

import { URL } from "../../Const/Const";
import { getCouponId, parseValidDate } from "../shared/couponsUtils";
import { getCouponsByBusiness } from "../Petitions";
import { Coupon } from "../types";
import { CouponIcon } from "../icons/CouponIcon";

export const CouponListScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const loadCoupons = async (refresh = false) => {
    if (!businessId) {
      showFeedback("Error", "Sesión inválida");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!token) {
      showFeedback("Error", "Falta token");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await getCouponsByBusiness(businessId, token);
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      showFeedback("Error", "No se pudieron cargar los cupones");
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCoupons(false);
  }, [businessId, token]);

  const couponsDomain = URL || window.location.origin;

  const groupedCoupons = useMemo(() => {
    const now = new Date();

    const isActive = (coupon: Coupon) => {
      const total = Number(coupon.TotalUsers || 0);
      const limit = Number(coupon.LimitUsers || 0);
      const under = total < limit;
      const valid = parseValidDate(coupon.Valid);
      return under && (!valid || valid >= now);
    };

    return coupons.reduce(
      (acc, coupon) => {
        if (isActive(coupon)) {
          acc.actives.push(coupon);
        } else {
          acc.inactives.push(coupon);
        }

        return acc;
      },
      { actives: [] as Coupon[], inactives: [] as Coupon[] },
    );
  }, [coupons]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/cuponespv/cupones");
  };

  const handleCopyLink = async (coupon: Coupon) => {
    const suffix = getCouponId(coupon) ?? coupon.QR;
    const link = `${couponsDomain}/cupones/${suffix}`;

    try {
      await navigator.clipboard.writeText(link);
      showFeedback("Éxito", "Link copiado al portapapeles.");
    } catch {
      showFeedback("Error", "No se pudo copiar el link.");
    }
  };

  const handleCouponPress = (coupon: Coupon) => {
    const id = getCouponId(coupon);
    if (!id) {
      showFeedback("Error", "Este cupón no tiene Id");
      return;
    }

    navigate(`/cuponespv/editar/${id}`, {
      state: { hideMainCouponsTabs: true },
    });
  };

  const renderCouponItem = (coupon: Coupon, isCouponActive: boolean) => {
    const totalUsers = Number(coupon.TotalUsers || 0);
    const limitUsers = Number(coupon.LimitUsers || 0);

    return (
      <button
        type="button"
        key={`${coupon.QR}-${getCouponId(coupon) ?? "no-id"}`}
        onClick={() => handleCouponPress(coupon)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center">
              <CouponIcon stroke={accentColor} width={22} height={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#565656]">{coupon.Description || "Cupón"}</p>
              <p className="text-xs text-gray-600 mt-1">
                {totalUsers}/{limitUsers} usuarios
              </p>
              <p className="text-xs text-gray-500 mt-1">{coupon.Valid || "Sin vigencia"}</p>
            </div>
          </div>

          <span
            className="rounded-full px-2 py-1 text-[10px] font-semibold"
            style={{
              color: isCouponActive ? accentColor : "#6B7280",
              backgroundColor: isCouponActive ? `${accentColor}20` : "#E5E7EB",
            }}
          >
            {isCouponActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCopyLink(coupon);
            }}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            Copiar link
          </button>
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
        <div className="mx-auto max-w-xl px-5 py-5">
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-12">
            <div className="flex items-center gap-3 text-[#565656]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="text-sm font-semibold">Cargando cupones…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="mx-auto max-w-xl px-5 py-5">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full p-1 transition hover:bg-gray-200"
              aria-label="Regresar"
            >
              <ChevronBack width={24} height={24} />
            </button>
            <h1 className="text-[18px] font-semibold text-[#565656]">Lista de cupones</h1>
          </div>

          <button
            type="button"
            onClick={() => loadCoupons(true)}
            className="rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Actualizando
              </span>
            ) : (
              "Actualizar"
            )}
          </button>
        </header>

        <p className="mb-4 text-[13px] text-[#7A7A7A]">Configura tu nuevo cupón para tus clientes</p>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-5">
          <h2 className="mb-3 text-sm font-semibold text-[#565656]">Activos</h2>
          <div className="space-y-3">
            {groupedCoupons.actives.length > 0 ? (
              groupedCoupons.actives.map((coupon) => renderCouponItem(coupon, true))
            ) : (
              <p className="text-xs text-gray-500">No hay cupones activos.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#565656]">Cupones inactivos</h2>
          <div className="space-y-3">
            {groupedCoupons.inactives.length > 0 ? (
              groupedCoupons.inactives.map((coupon) => renderCouponItem(coupon, false))
            ) : (
              <p className="text-xs text-gray-500">No hay cupones inactivos.</p>
            )}
          </div>
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
