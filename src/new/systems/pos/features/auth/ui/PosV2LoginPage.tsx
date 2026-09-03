import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getBusinessLogoDimensionWarning, uploadBusinessLogoToCloudinary } from "../../../shared/api/cloudinaryUpload";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import {
  clearPendingPosUpgradeContext,
  POS_SESSION_STORAGE_KEYS,
} from "../../../shared/config/posSession";
import { persistPosSession } from "../../../shared/config/posSessionRuntime";
import "./PosV2LoginPage.css";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { PlanUpgradeModal } from "../../../shared/ui/PlanUpgradeModal";
import {
  canIncreaseSessionLimit,
  LoginSessionLimitPayload,
  processLoginFailure,
} from "../model/LoginSessionLimit";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;

type PanelMode = "signin" | "signup";
type SignUpStep = "account" | "business";
type AuthenticatedDestination = "sales" | "security-questions";

type ChangesNoticeState = {
  businessId: number;
  token: string;
  destination: AuthenticatedDestination;
};

type FieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password" | "tel";
  placeholder: string;
  value: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
};

const FormField = ({
  id,
  label,
  type,
  placeholder,
  value,
  required = true,
  autoComplete,
  onChange,
}: FieldProps) => (
  <div className="pos-v2-field">
    <label htmlFor={id} className="pos-v2-label">
      {label}
    </label>
    <input
      id={id}
      className="pos-v2-input"
      type={type}
      placeholder={placeholder}
      value={value}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      required={required}
    />
  </div>
);

export const PosV2LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<PanelMode>("signin");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("account");

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpOwnerName, setSignUpOwnerName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [signUpBusinessName, setSignUpBusinessName] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  const [signUpAddress, setSignUpAddress] = useState("");
  const [signUpReferences, setSignUpReferences] = useState("");
  const [signUpColor, setSignUpColor] = useState("#6D01D1");
  const [signUpLogoFile, setSignUpLogoFile] = useState<File | null>(null);
  const [signUpLogoWarning, setSignUpLogoWarning] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionLimit, setSessionLimit] = useState<LoginSessionLimitPayload | null>(null);
  const [closingSessions, setClosingSessions] = useState(false);
  const closingSessionsRef = useRef(false);
  const [sessionLimitActionError, setSessionLimitActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSecurityPrompt, setPendingSecurityPrompt] = useState<{
    source: "login" | "signup";
  } | null>(null);
  const [changesNotice, setChangesNotice] = useState<ChangesNoticeState | null>(null);
  const [acknowledgingChangesNotice, setAcknowledgingChangesNotice] = useState(false);
  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosAuthOnboardingPage();
  }, []);

  useEffect(() => {
    const existingToken = window.localStorage.getItem(TOKEN_KEY);
    if (existingToken) {
      navigate(POS_V2_PATHS.sales, { replace: true });
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
      setSignUpStep("account");
    }

    clearPendingPosUpgradeContext();
  }, [location.search, navigate]);

  const goToSignIn = () => {
    setMode("signin");
    setSignUpStep("account");
    setError(null);
    setNotice(null);
  };
  const goToSales = () => {
    setPendingSecurityPrompt(null);
    navigate(POS_V2_PATHS.sales, { replace: true });
  };

  const goToSecurityQuestions = () => {
    setPendingSecurityPrompt(null);
    navigate(POS_V2_PATHS.securityQuestions, { replace: true });
  };

  const continueAuthenticatedFlow = (destination: AuthenticatedDestination, source: "login" | "signup") => {
    if (destination === "security-questions") {
      setPendingSecurityPrompt({ source });
      return;
    }

    navigate(POS_V2_PATHS.sales, { replace: true });
  };

  const finishAuthenticatedFlow = async (
    session: {
      token: string;
      businessId: number;
      employeeId: number;
      email: string;
    },
    source: "login" | "signup",
  ) => {
    persistPosSession(session);

    let destination: AuthenticatedDestination = "sales";

    try {
      const status = await authPage.getSecurityQuestionStatus(
        session.employeeId,
      );

      if (status.shouldPrompt || !status.configured) {
        destination = "security-questions";
      }
    } catch (cause) {
      console.warn(
        "No se pudo validar el estado de preguntas de seguridad:",
        cause,
      );
    }

    if (source === "login") {
      try {
        const factory = new ModernSystemsFactory(API_BASE_URL);
        const noticeStatus = await factory.createPosBusinessSettingsService().getChangesNoticeStatus(session.businessId, session.token);
        if (!noticeStatus.viewed) {
          setChangesNotice({
            businessId: session.businessId,
            token: session.token,
            destination,
          });
          return;
        }
      } catch (cause) {
        console.warn("No se pudo consultar el aviso de próximas actualizaciones:", cause);
      }
    }

    continueAuthenticatedFlow(destination, source);
  };

  const acknowledgeChangesNotice = async () => {
    if (!changesNotice || acknowledgingChangesNotice) return;

    setAcknowledgingChangesNotice(true);
    const { businessId, token, destination } = changesNotice;

    try {
      const factory = new ModernSystemsFactory(API_BASE_URL);
      await factory.createPosBusinessSettingsService().acknowledgeChangesNotice(businessId, token);
    } catch (cause) {
      console.warn("No se pudo registrar la lectura del aviso de próximas actualizaciones:", cause);
    } finally {
      setChangesNotice(null);
      setAcknowledgingChangesNotice(false);
      continueAuthenticatedFlow(destination, "login");
    }
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const session = await authPage.signIn({
        email: signInEmail,
        password: signInPassword,
      });
      await finishAuthenticatedFlow(session, "login");
    } catch (cause) {
      const failure = processLoginFailure(cause);
      setSessionLimit(failure.sessionLimit);
      setError(failure.error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeOtherSessions = async () => {
    if (!sessionLimit || closingSessionsRef.current) return;

    closingSessionsRef.current = true;
    setClosingSessions(true);
    setSessionLimitActionError(null);
    try {
      await authPage.closeOtherSessions(sessionLimit);
      setSessionLimit(null);
      setNotice("Sesiones cerradas. Intenta iniciar sesión de nuevo.");
    } catch {
      setSessionLimitActionError("No se pudieron cerrar las sesiones activas.");
    } finally {
      closingSessionsRef.current = false;
      setClosingSessions(false);
    }
  };

  const goToUpgradePlan = () => {
    if (!sessionLimit) return;
    const businessId = Number(sessionLimit.businessId);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      setSessionLimitActionError("No se recibió un negocio válido para aumentar el límite.");
      return;
    }
    const params = new URLSearchParams({
      businessId: String(businessId),
      currentPlan: sessionLimit.plan,
      from: POS_V2_PATHS.login,
    });
    setSessionLimit(null);
    navigate(`${POS_V2_PATHS.upgradePlan}?${params.toString()}`);
  };

  const handleAccountStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !signUpOwnerName.trim() ||
      !signUpEmail.trim() ||
      !signUpPassword.trim()
    ) {
      setError("Completa nombre, correo y contraseña para continuar.");
      return;
    }

    setError(null);
    setSignUpStep("business");
  };

  const handleLogoSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setSignUpLogoFile(null);
      setSignUpLogoWarning("");
      setError("Selecciona un archivo de imagen válido.");
      event.target.value = "";
      return;
    }
    setSignUpLogoFile(file);
    setSignUpLogoWarning(file ? await getBusinessLogoDimensionWarning(file) : "");
    setError(null);
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signUpLogoFile) {
      setError(
        "El logo del negocio es obligatorio para finalizar el registro.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const logoUrl = await uploadBusinessLogoToCloudinary(signUpLogoFile);

      const session = await authPage.signUp({
        business: {
          name: signUpBusinessName.trim(),
          address: signUpAddress.trim(),
          phoneNumber: signUpPhoneNumber.trim(),
          logo: logoUrl,
          color: signUpColor,
          references: signUpReferences.trim(),
        },
        employee: {
          name: signUpOwnerName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
        },
        deviceToken: "web-v2",
      });

await finishAuthenticatedFlow(session, "signup");
    } catch (cause) {
      console.log("Error durante el registro en POS v2:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo crear la cuenta en POS v2.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pos-v2-auth-page">
      <div
        className={`pos-v2-auth-container ${mode === "signup" ? "right-panel-active" : ""}`}
      >
        <div className="pos-v2-form-container pos-v2-sign-up-container">
          {signUpStep === "account" ? (
            <form className="pos-v2-form" onSubmit={handleAccountStep}>
              <h1>Crear Cuenta</h1>
              <span>Paso 1 de 2 · Datos del responsable</span>
              <FormField
                id="signup-owner"
                label="Nombre del responsable"
                type="text"
                placeholder="Tu nombre"
                value={signUpOwnerName}
                autoComplete="name"
                onChange={setSignUpOwnerName}
              />
              <FormField
                id="signup-email"
                label="Correo"
                type="email"
                placeholder="correo@negocio.com"
                value={signUpEmail}
                autoComplete="email"
                onChange={setSignUpEmail}
              />
              <FormField
                id="signup-password"
                label="Contraseña"
                type="password"
                placeholder="********"
                value={signUpPassword}
                autoComplete="new-password"
                onChange={setSignUpPassword}
              />
              {error && mode === "signup" ? (
                <span className="pos-v2-error">{error}</span>
              ) : null}
              <button type="submit" className="pos-v2-btn">
                Continuar
              </button>
              <button
                type="button"
                className="pos-v2-mobile-switch"
                onClick={goToSignIn}
              >
                Tengo Cuenta
              </button>
            </form>
          ) : (
            <form className="pos-v2-form" onSubmit={handleSignUp}>
              <h1>Personaliza tu negocio</h1>
              <span>Paso 2 de 2 · Datos del negocio</span>
              <FormField
                id="signup-business"
                label="Nombre del negocio"
                type="text"
                placeholder="Ej: Cafetería Central"
                value={signUpBusinessName}
                autoComplete="organization"
                onChange={setSignUpBusinessName}
              />
              <FormField
                id="signup-phone"
                label="Teléfono del negocio"
                type="tel"
                placeholder="10 dígitos"
                value={signUpPhoneNumber}
                autoComplete="tel"
                onChange={setSignUpPhoneNumber}
              />
              <FormField
                id="signup-address"
                label="Dirección"
                type="text"
                placeholder="Calle y número"
                value={signUpAddress}
                autoComplete="street-address"
                onChange={setSignUpAddress}
              />
              <FormField
                id="signup-references"
                label="Referencias"
                type="text"
                placeholder="Entre calles, colonia, etc."
                value={signUpReferences}
                onChange={setSignUpReferences}
              />
              <div className="pos-v2-field">
                <label htmlFor="signup-color" className="pos-v2-label">
                  Color principal
                </label>
                <input
                  id="signup-color"
                  className="pos-v2-input pos-v2-color-input"
                  type="color"
                  value={signUpColor}
                  onChange={(event) => setSignUpColor(event.target.value)}
                />
              </div>
              <div className="pos-v2-field">
                <label htmlFor="signup-logo" className="pos-v2-label">
                  Logo del negocio
                </label>
                <span className="pos-v2-file-name">
                  Recomendado: imagen cuadrada de al menos 800 × 800 px. Se mostrará en círculo.
                </span>
                <input
                  id="signup-logo"
                  className="pos-v2-input pos-v2-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelection}
                  required
                />
                {signUpLogoFile ? (
                  <span className="pos-v2-file-name">
                    Archivo: {signUpLogoFile.name}
                  </span>
                ) : null}
                {signUpLogoWarning ? <span className="pos-v2-file-warning">{signUpLogoWarning}</span> : null}
              </div>
              {error && mode === "signup" ? (
                <span className="pos-v2-error">{error}</span>
              ) : null}
              <button
                type="submit"
                className="pos-v2-btn"
                disabled={submitting}
              >
                {submitting ? "Registrando negocio..." : "Finalizar Registro"}
              </button>
              <button
                type="button"
                className="pos-v2-mobile-switch"
                onClick={() => setSignUpStep("account")}
              >
                Volver al paso anterior
              </button>
            </form>
          )}
        </div>

        <div
          className={`pos-v2-form-container pos-v2-sign-in-container ${mode === "signup" ? "pos-v2-hidden-mobile" : ""}`}
        >
          <form className="pos-v2-form" onSubmit={handleSignIn}>
            <h1>Iniciar Sesión</h1>
            <span>Usa tu cuenta</span>
            <FormField
              id="signin-email"
              label="Correo"
              type="email"
              placeholder="correo@negocio.com"
              value={signInEmail}
              autoComplete="email"
              onChange={(value) => {
                setSignInEmail(value);
                setError(null);
              }}
            />
            <FormField
              id="signin-password"
              label="Contraseña"
              type="password"
              placeholder="********"
              value={signInPassword}
              autoComplete="current-password"
              onChange={(value) => {
                setSignInPassword(value);
                setError(null);
              }}
            />
            {error && mode === "signin" ? (
              <span className="pos-v2-error">{error}</span>
            ) : null}
            {notice && mode === "signin" ? (
              <span className="pos-v2-notice" role="status">{notice}</span>
            ) : null}
            <button
              type="button"
              className="pos-v2-forgot-link"
              onClick={() => navigate(POS_V2_PATHS.passwordRecovery)}
            >
              Olvidaste tu contraseña?
            </button>
            <button type="submit" className="pos-v2-btn" disabled={submitting}>
              {submitting ? "Entrando..." : "Iniciar Sesión"}
            </button>
            <button
              type="button"
              className="pos-v2-mobile-switch"
              onClick={() => {
                setMode("signup");
                setSignUpStep("account");
                setError(null);
              }}
            >
              Crear Cuenta
            </button>
          </form>
        </div>

        <div className="pos-v2-overlay-container">
          <div className="pos-v2-overlay">
            <div className="pos-v2-overlay-panel pos-v2-overlay-left">
              <h2>Hola de Nuevo!</h2>
              <p>Para seguir conectado inicia sesión con tus datos.</p>
              <button
                type="button"
                className="pos-v2-btn pos-v2-btn-ghost"
                onClick={goToSignIn}
              >
                Inicio de Sesión
              </button>
            </div>
            <div className="pos-v2-overlay-panel pos-v2-overlay-right">
              <h2>Hola, Bienvenido</h2>
              <p>
                Primero crea tu cuenta y luego completa la información del
                negocio.
              </p>
              <button
                type="button"
                className="pos-v2-btn pos-v2-btn-ghost"
                onClick={() => {
                  setMode("signup");
                  setSignUpStep("account");
                }}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
      {changesNotice ? (
        <div className="pos-v2-changes-notice-backdrop" role="presentation">
          <section
            className="pos-v2-changes-notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pos-v2-changes-notice-title"
            aria-describedby="pos-v2-changes-notice-description"
          >
            
            <span className="pos-v2-changes-notice__eyebrow">Novedades RAVEKH</span>
            <h2 id="pos-v2-changes-notice-title">Próximas actualizaciones en RAVEKH</h2>
            <div id="pos-v2-changes-notice-description" className="pos-v2-changes-notice__content">
              <p>
                Estamos realizando mejoras graduales en RAVEKH para seguir ofreciéndote una mejor experiencia y nuevos beneficios dentro de la plataforma, como la posibilidad de gestionar productos ilimitados.
              </p>
              <p>
                También estableceremos y comunicaremos nuestras condiciones de uso para que tengas mayor claridad sobre el funcionamiento del servicio y las responsabilidades de cada parte.
              </p>
              <p>
                Estas actualizaciones se implementarán poco a poco. Conforme se incorporen nuevas mejoras o entren en vigor las condiciones de uso, te informaremos dentro de la plataforma para que puedas conocerlas oportunamente.
              </p>
              <p>
                Por el momento, este mensaje es únicamente informativo y no requiere ninguna acción de tu parte.
              </p>
            </div>
            <button
              type="button"
              className="pos-v2-changes-notice__button"
              disabled={acknowledgingChangesNotice}
              onClick={() => void acknowledgeChangesNotice()}
            >
              {acknowledgingChangesNotice ? "Continuando..." : "Entendido, continuar"}
            </button>
          </section>
        </div>
      ) : null}
      {pendingSecurityPrompt ? (
  <div className="pos-v2-security-prompt-backdrop" role="dialog" aria-modal="true">
    <section className="pos-v2-security-prompt">
      <span className="pos-v2-security-prompt__eyebrow">
        Seguridad de tu cuenta
      </span>

      <h2>Configura tus preguntas de seguridad</h2>

      <p>
        Esto te ayudará a recuperar el acceso a tu cuenta si olvidas tu contraseña.
        Puedes hacerlo ahora o continuar y configurarlo después.
      </p>

      <div className="pos-v2-security-prompt__actions">
        <button
          type="button"
          className="pos-v2-btn"
          onClick={goToSecurityQuestions}
        >
          Configurar ahora
        </button>

        <button
          type="button"
          className="pos-v2-security-prompt__skip"
          onClick={goToSales}
        >
          Omitir por ahora
        </button>
      </div>
    </section>
  </div>
) : null}
      <PlanUpgradeModal
        open={Boolean(sessionLimit)}
        eyebrow="Sesiones activas"
        title="Límite de sesiones"
        message={sessionLimit?.error?.trim() || "Tu plan alcanzó el límite de sesiones activas."}
        ctaLabel="Cerrar sesión en los otros dispositivos"
        secondaryCtaLabel={sessionLimit && canIncreaseSessionLimit(sessionLimit) ? "Aumentar límite" : undefined}
        busy={closingSessions}
        error={sessionLimitActionError ?? undefined}
        onClose={() => {
          if (closingSessions) return;
          setSessionLimit(null);
          setSessionLimitActionError(null);
        }}
        onUpgrade={() => void closeOtherSessions()}
        onSecondaryAction={goToUpgradePlan}
      />
    </div>
  );
};
