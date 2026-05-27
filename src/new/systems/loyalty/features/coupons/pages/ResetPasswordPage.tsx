import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cuponsito from "../assets/cuponsito.png";
import bolsita from "../assets/bolsita.png";
import cajita from "../assets/cajita.png";
import carterita from "../assets/carterita.png";
import tiendita from "../assets/tiendita.png";
import { AutoImageCarousel } from "../components/AutoImageCarousel";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { resetPassword } from "../services/couponsApi";
import {
  getPendingCouponClaimId,
  getPendingVisitRedeemToken,
  setPendingCouponClaimId,
  setPendingVisitRedeemToken,
} from "../services/session";

type ResetPasswordResponse = {
  Status?: boolean;
  status?: boolean;
  Message?: string;
  message?: string;
  error?: string;
};

const RecoverPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCouponsTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tokenFromQuery = queryParams.get("token")?.trim() ?? "";
  const couponIdFromQuery = Number(queryParams.get("couponId"));

  const effectiveToken = tokenFromQuery || getPendingVisitRedeemToken();
  const effectivePendingCouponId =
    Number.isInteger(couponIdFromQuery) && couponIdFromQuery > 0
      ? couponIdFromQuery
      : getPendingCouponClaimId();

  useEffect(() => {
    if (tokenFromQuery) {
      setPendingVisitRedeemToken(tokenFromQuery);
    }

    if (Number.isInteger(couponIdFromQuery) && couponIdFromQuery > 0) {
      setPendingCouponClaimId(couponIdFromQuery);
    }
  }, [tokenFromQuery, couponIdFromQuery]);

  const loginRoute = useMemo(() => {
    const params = new URLSearchParams();

    if (effectiveToken) {
      params.set("token", effectiveToken);
    }

    if (effectivePendingCouponId) {
      params.set("couponId", String(effectivePendingCouponId));
    }

    const suffix = params.toString();
    return `/coupons${suffix ? `?${suffix}` : ""}`;
  }, [effectivePendingCouponId, effectiveToken]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 4px ${theme.accent}40`;
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = "none";
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    setErrorMessage("");
    setSuccessMessage("");

    if (!normalizedEmail || !normalizedPassword || !normalizedConfirmPassword) {
      setErrorMessage("Todos los campos son requeridos.");
      return;
    }

    if (normalizedPassword.length < 4) {
      setErrorMessage("Tu contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      setErrorMessage("La confirmación de contraseña no coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = (await resetPassword({
        Email: normalizedEmail,
        Password: normalizedPassword,
      })) as ResetPasswordResponse;

      const hasExplicitError =
        response?.Status === false ||
        response?.status === false ||
        Boolean(response?.error);

      if (hasExplicitError) {
        setErrorMessage(
          response?.Message ||
            response?.message ||
            response?.error ||
            "No se pudo actualizar la contraseña."
        );
        return;
      }

      setSuccessMessage(
        response?.Message ||
          response?.message ||
          "Contraseña actualizada correctamente."
      );

      window.setTimeout(() => {
        navigate(loginRoute, {
          replace: true,
          state: {
            email: normalizedEmail,
            passwordRecovered: true,
          },
        });
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo recuperar la contraseña. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const carouselImages = [bolsita, cajita, carterita, tiendita];

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: theme.background }}>
      <div
        className="relative w-full pt-10 pb-12 rounded-b-[44px] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ backgroundColor: theme.accent }}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-[-40px] bottom-[-70px] w-[220px] h-[220px] bg-white/20 rounded-full" />
          <div className="absolute right-[-70px] top-[10px] w-[240px] h-[240px] bg-white/20 rounded-full" />
        </div>

        <div className="relative flex justify-center">
          <img src={cuponsito} alt="Ticket sonriente" className="w-36 drop-shadow-xl" />
        </div>
      </div>

      <div
        className="w-full max-w-[428px] px-8 flex flex-col items-center text-center"
        style={{ color: theme.textPrimary }}
      >
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Recuperar contraseña</h1>
          <p className="mt-2 text-sm font-medium" style={{ color: theme.textMuted }}>
            Ingresa tu correo y crea una nueva contraseña.
          </p>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium"
            style={{
              backgroundColor: theme.surface,
              color: theme.textPrimary,
              boxShadow: "none",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={80}
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium"
            style={{
              backgroundColor: theme.surface,
              color: theme.textPrimary,
              boxShadow: "none",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={44}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium"
            style={{
              backgroundColor: theme.surface,
              color: theme.textPrimary,
              boxShadow: "none",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            maxLength={44}
          />
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm font-semibold text-red-500">{errorMessage}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 text-sm font-semibold text-green-600">{successMessage}</p>
        ) : null}

        <button
          type="button"
          className="mt-7 w-full font-extrabold py-3.5 text-lg rounded-full shadow-[0_14px_30px_rgba(0,0,0,0.25)] hover:brightness-110 transition disabled:opacity-70"
          style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
        </button>

        <p className="mt-6 text-sm font-semibold" style={{ color: theme.textMuted }}>
          ¿Ya la recordaste?
          <button
            type="button"
            className="ml-1 font-bold"
            style={{ color: theme.accent }}
            onClick={() => navigate(loginRoute)}
          >
            inicia sesión
          </button>
        </p>
      </div>

      <div className="relative w-full mt-12 pb-8 flex justify-center overflow-hidden">
        <div
          className="absolute bottom-[-48px] left-0 right-0 h-44 rounded-t-[120px]"
          style={{ backgroundColor: theme.accent }}
          aria-hidden="true"
        />
        <AutoImageCarousel images={carouselImages} className="relative drop-shadow-xl" />
      </div>
    </div>
  );
};

export { RecoverPasswordPage };
export default RecoverPasswordPage;
