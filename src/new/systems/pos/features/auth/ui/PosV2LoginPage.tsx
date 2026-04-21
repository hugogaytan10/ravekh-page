import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { uploadImageToCloudinary } from "../../../shared/api/cloudinaryUpload";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import "./PosV2LoginPage.css";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;
const EMPLOYEE_ID_KEY = POS_SESSION_STORAGE_KEYS.employeeId;

type PanelMode = "signin" | "signup";
type SignUpStep = "account" | "business";

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

const FormField = ({ id, label, type, placeholder, value, required = true, autoComplete, onChange }: FieldProps) => (
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

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosAuthOnboardingPage();
  }, []);

  const persistSession = (session: { token: string; businessId: number; employeeId: number }) => {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(BUSINESS_ID_KEY, String(session.businessId));
    window.localStorage.setItem(EMPLOYEE_ID_KEY, String(session.employeeId));
  };

  useEffect(() => {
    const existingToken = window.localStorage.getItem(TOKEN_KEY);
    if (existingToken) {
      navigate(POS_V2_PATHS.sales, { replace: true });
    }
  }, [navigate]);

  const goToSignIn = () => {
    setMode("signin");
    setSignUpStep("account");
    setError(null);
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const session = await authPage.signIn({ email: signInEmail, password: signInPassword });
      persistSession(session);
      navigate(POS_V2_PATHS.sales, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión en POS v2.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccountStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUpOwnerName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError("Completa nombre, correo y contraseña para continuar.");
      return;
    }

    setError(null);
    setSignUpStep("business");
  };

  const handleLogoSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSignUpLogoFile(file);
    setError(null);
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signUpLogoFile) {
      setError("El logo del negocio es obligatorio para finalizar el registro.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const logoUrl = await uploadImageToCloudinary(signUpLogoFile);

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

      persistSession(session);
      navigate(POS_V2_PATHS.sales, { replace: true });
    } catch (cause) {
      console.log("Error durante el registro en POS v2:", cause);
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta en POS v2.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pos-v2-auth-page">
      <div className={`pos-v2-auth-container ${mode === "signup" ? "right-panel-active" : ""}`}>
        <div className="pos-v2-form-container pos-v2-sign-up-container">
          {signUpStep === "account" ? (
            <form className="pos-v2-form" onSubmit={handleAccountStep}>
              <h1>Crear Cuenta</h1>
              <span>Paso 1 de 2 · Datos del responsable</span>
              <FormField id="signup-owner" label="Nombre del responsable" type="text" placeholder="Tu nombre" value={signUpOwnerName} autoComplete="name" onChange={setSignUpOwnerName} />
              <FormField id="signup-email" label="Correo" type="email" placeholder="correo@negocio.com" value={signUpEmail} autoComplete="email" onChange={setSignUpEmail} />
              <FormField id="signup-password" label="Contraseña" type="password" placeholder="********" value={signUpPassword} autoComplete="new-password" onChange={setSignUpPassword} />
              {error && mode === "signup" ? <span className="pos-v2-error">{error}</span> : null}
              <button type="submit" className="pos-v2-btn">
                Continuar
              </button>
              <button type="button" className="pos-v2-mobile-switch" onClick={goToSignIn}>
                Tengo Cuenta
              </button>
            </form>
          ) : (
            <form className="pos-v2-form" onSubmit={handleSignUp}>
              <h1>Personaliza tu negocio</h1>
              <span>Paso 2 de 2 · Datos del negocio</span>
              <FormField id="signup-business" label="Nombre del negocio" type="text" placeholder="Ej: Cafetería Central" value={signUpBusinessName} autoComplete="organization" onChange={setSignUpBusinessName} />
              <FormField id="signup-phone" label="Teléfono del negocio" type="tel" placeholder="10 dígitos" value={signUpPhoneNumber} autoComplete="tel" onChange={setSignUpPhoneNumber} />
              <FormField id="signup-address" label="Dirección" type="text" placeholder="Calle y número" value={signUpAddress} autoComplete="street-address" onChange={setSignUpAddress} />
              <FormField id="signup-references" label="Referencias" type="text" placeholder="Entre calles, colonia, etc." value={signUpReferences} onChange={setSignUpReferences} />
              <div className="pos-v2-field">
                <label htmlFor="signup-color" className="pos-v2-label">
                  Color principal
                </label>
                <input id="signup-color" className="pos-v2-input pos-v2-color-input" type="color" value={signUpColor} onChange={(event) => setSignUpColor(event.target.value)} />
              </div>
              <div className="pos-v2-field">
                <label htmlFor="signup-logo" className="pos-v2-label">
                  Logo del negocio
                </label>
                <input id="signup-logo" className="pos-v2-input pos-v2-file-input" type="file" accept="image/*" onChange={handleLogoSelection} required />
                {signUpLogoFile ? <span className="pos-v2-file-name">Archivo: {signUpLogoFile.name}</span> : null}
              </div>
              {error && mode === "signup" ? <span className="pos-v2-error">{error}</span> : null}
              <button type="submit" className="pos-v2-btn" disabled={submitting}>
                {submitting ? "Registrando negocio..." : "Finalizar Registro"}
              </button>
              <button type="button" className="pos-v2-mobile-switch" onClick={() => setSignUpStep("account")}>
                Volver al paso anterior
              </button>
            </form>
          )}
        </div>

        <div className={`pos-v2-form-container pos-v2-sign-in-container ${mode === "signup" ? "pos-v2-hidden-mobile" : ""}`}>
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
            {error && mode === "signin" ? <span className="pos-v2-error">{error}</span> : null}
            <a href="#" className="pos-v2-forgot-link">
              Olvidaste tu contraseña?
            </a>
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
              <button type="button" className="pos-v2-btn pos-v2-btn-ghost" onClick={goToSignIn}>
                Inicio de Sesión
              </button>
            </div>
            <div className="pos-v2-overlay-panel pos-v2-overlay-right">
              <h2>Hola, Bienvenido</h2>
              <p>Primero crea tu cuenta y luego completa la información del negocio.</p>
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
    </div>
  );
};
