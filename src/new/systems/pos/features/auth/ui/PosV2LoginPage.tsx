import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import "./PosV2LoginPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type PanelMode = "signin" | "signup";

export const PosV2LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<PanelMode>("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosAuthOnboardingPage();
  }, []);

  useEffect(() => {
    const existingToken = window.localStorage.getItem(TOKEN_KEY);
    if (existingToken) {
      navigate("/v2/MainSales", { replace: true });
    }
  }, [navigate]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const session = await authPage.signIn({ email: signInEmail, password: signInPassword });
      window.localStorage.setItem(TOKEN_KEY, session.token);
      window.localStorage.setItem(BUSINESS_ID_KEY, String(session.businessId));
      navigate("/v2/MainSales", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión en POS v2.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const normalizedName = signUpName.trim();
      const session = await authPage.signUp({
        business: {
          name: `${normalizedName} Store`,
          address: "Por definir",
          phoneNumber: "0000000000",
          logo: "",
          color: "#6D01D1",
          references: "Registro desde POS v2",
        },
        employee: {
          name: normalizedName,
          email: signUpEmail,
          password: signUpPassword,
        },
        deviceToken: "web-v2",
      });

      window.localStorage.setItem(TOKEN_KEY, session.token);
      window.localStorage.setItem(BUSINESS_ID_KEY, String(session.businessId));
      navigate("/v2/MainSales", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta en POS v2.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pos-v2-auth-page">
      <div className={`pos-v2-auth-container ${mode === "signup" ? "right-panel-active" : ""}`}>
        <div className="pos-v2-form-container pos-v2-sign-up-container">
          <form className="pos-v2-form" onSubmit={handleSignUp}>
            <h1>Crear Cuenta</h1>
            <span>Usa tu correo para registrarte</span>
            <input
              className="pos-v2-input"
              type="text"
              placeholder="Nombre"
              value={signUpName}
              onChange={(event) => setSignUpName(event.target.value)}
              required
            />
            <input
              className="pos-v2-input"
              type="email"
              placeholder="Correo"
              value={signUpEmail}
              onChange={(event) => setSignUpEmail(event.target.value)}
              required
            />
            <input
              className="pos-v2-input"
              type="password"
              placeholder="Contraseña"
              value={signUpPassword}
              onChange={(event) => setSignUpPassword(event.target.value)}
              required
            />
            {error && mode === "signup" ? <span className="pos-v2-error">{error}</span> : null}
            <button type="submit" className="pos-v2-btn" disabled={submitting}>
              {submitting ? "Procesando..." : "Registrarme"}
            </button>
            <button type="button" className="pos-v2-mobile-switch" onClick={() => setMode("signin")}>
              Tengo Cuenta
            </button>
          </form>
        </div>

        <div className={`pos-v2-form-container pos-v2-sign-in-container ${mode === "signup" ? "pos-v2-hidden-mobile" : ""}`}>
          <form className="pos-v2-form" onSubmit={handleSignIn}>
            <h1>Iniciar Sesión</h1>
            <span>Usa tu cuenta</span>
            <input
              className="pos-v2-input"
              type="email"
              placeholder="Correo"
              value={signInEmail}
              onChange={(event) => {
                setSignInEmail(event.target.value);
                setError(null);
              }}
              required
            />
            <input
              className="pos-v2-input"
              type="password"
              placeholder="Contraseña"
              value={signInPassword}
              onChange={(event) => {
                setSignInPassword(event.target.value);
                setError(null);
              }}
              required
            />
            {error && mode === "signin" ? <span className="pos-v2-error">{error}</span> : null}
            <a href="#" className="pos-v2-forgot-link">
              Olvidaste tu contraseña?
            </a>
            <button type="submit" className="pos-v2-btn" disabled={submitting}>
              {submitting ? "Entrando..." : "Iniciar Sesión"}
            </button>
            <button type="button" className="pos-v2-mobile-switch" onClick={() => setMode("signup")}>
              Crear Cuenta
            </button>
          </form>
        </div>

        <div className="pos-v2-overlay-container">
          <div className="pos-v2-overlay">
            <div className="pos-v2-overlay-panel pos-v2-overlay-left">
              <h2>Hola de Nuevo!</h2>
              <p>Para seguir conectado inicia sesión con tus datos.</p>
              <button type="button" className="pos-v2-btn pos-v2-btn-ghost" onClick={() => setMode("signin")}>
                Inicio de Sesión
              </button>
            </div>
            <div className="pos-v2-overlay-panel pos-v2-overlay-right">
              <h2>Hola, Bienvenido</h2>
              <p>Ingresa tus datos y comienza a usar POS v2.</p>
              <button type="button" className="pos-v2-btn pos-v2-btn-ghost" onClick={() => setMode("signup")}>
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
