import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../index";
import { uploadImageToCloudinary } from "../../pos/shared/api/cloudinaryUpload";
import { getPosApiBaseUrl } from "../../pos/shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../pos/shared/config/posSession";

type FreeCatalogLoginModalProps = {
  open: boolean;
  planName?: string;
  onAuthenticated?: () => void;
  onClose: () => void;
};

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

const API_BASE_URL = getPosApiBaseUrl();

const FormField = ({ id, label, type, placeholder, value, required = true, autoComplete, onChange }: FieldProps) => (
  <div className="flex w-full flex-col items-start">
    <label htmlFor={id} className="mt-2 text-xs font-semibold text-slate-700">
      {label}
    </label>
    <input
      id={id}
      className="my-2 w-full border-0 bg-slate-100 px-4 py-3 text-slate-950 max-md:text-base"
      type={type}
      placeholder={placeholder}
      value={value}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      required={required}
    />
  </div>
);

const FreeCatalogLoginModal = ({ open, planName = "tu plan", onAuthenticated, onClose }: FreeCatalogLoginModalProps) => {
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
  const isSignUp = mode === "signup";

  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosAuthOnboardingPage();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const persistSession = (session: { token: string; businessId: number; employeeId: number; email: string }) => {
    window.localStorage.setItem(POS_SESSION_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(POS_SESSION_STORAGE_KEYS.businessId, String(session.businessId));
    window.localStorage.setItem(POS_SESSION_STORAGE_KEYS.employeeId, String(session.employeeId));
    window.localStorage.setItem(POS_SESSION_STORAGE_KEYS.email, session.email);
  };

  const completeAuthentication = () => {
    if (onAuthenticated) {
      onAuthenticated();
      return;
    }

    onClose();
  };

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
      completeAuthentication();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
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
    setSignUpLogoFile(event.target.files?.[0] ?? null);
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
        deviceToken: "web-main-catalog",
      });

      persistSession(session);
      completeAuthentication();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryButtonClass = "mt-3 rounded-full border border-[#6d01d1] bg-[#6d01d1] px-10 py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70";
  const ghostButtonClass = "mt-1 rounded-full border border-white bg-transparent px-10 py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform active:scale-95";
  const mobileSwitchClass = "mt-4 inline-block border-0 bg-transparent font-bold text-[#6d01d1] md:hidden";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 max-md:items-stretch max-md:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="main-catalog-login-modal-title"
    >
      <button type="button" className="absolute inset-0 cursor-pointer border-0 bg-slate-900/70" aria-label="Cerrar modal de acceso" onClick={onClose} />
      <div className="relative min-h-[560px] w-[860px] max-w-full overflow-hidden rounded-[10px] bg-white text-slate-900 shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] max-md:min-h-[calc(100dvh-1.5rem)] max-md:rounded-xl">
        <button type="button" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-0 bg-slate-900/10 text-2xl leading-none text-slate-900" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <div className={`absolute left-0 top-0 flex h-full w-full justify-center transition-all duration-500 ease-in-out md:w-1/2 ${isSignUp ? "z-[5] translate-x-0 opacity-100 md:translate-x-full" : "z-[1] opacity-0 max-md:hidden"}`}>
          {signUpStep === "account" ? (
            <form className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-white px-12 py-8 text-center max-md:justify-start max-md:px-5 max-md:pb-[calc(2rem+env(safe-area-inset-bottom))] max-md:pt-14" onSubmit={handleAccountStep}>
              <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#6d01d1]">{planName}</span>
              <h2 id="main-catalog-login-modal-title" className="my-2 text-[clamp(1.7rem,4vw,2.25rem)] font-extrabold">Crear Cuenta</h2>
              <span className="mb-3 text-sm text-slate-500">Paso 1 de 2 · Datos del responsable</span>
              <FormField id="catalog-signup-owner" label="Nombre del responsable" type="text" placeholder="Tu nombre" value={signUpOwnerName} autoComplete="name" onChange={setSignUpOwnerName} />
              <FormField id="catalog-signup-email" label="Correo" type="email" placeholder="correo@negocio.com" value={signUpEmail} autoComplete="email" onChange={setSignUpEmail} />
              <FormField id="catalog-signup-password" label="Contraseña" type="password" placeholder="********" value={signUpPassword} autoComplete="new-password" onChange={setSignUpPassword} />
              {error && isSignUp ? <span className="mt-1 w-full text-left text-xs text-red-600">{error}</span> : null}
              <button type="submit" className={primaryButtonClass}>Continuar</button>
              <button type="button" className={mobileSwitchClass} onClick={goToSignIn}>Ya tengo cuenta</button>
            </form>
          ) : (
            <form className="flex h-full w-full flex-col items-center justify-start overflow-y-auto bg-white px-12 py-7 text-center max-md:px-5 max-md:pb-[calc(2rem+env(safe-area-inset-bottom))] max-md:pt-14" onSubmit={handleSignUp}>
              <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#6d01d1]">{planName}</span>
              <h2 className="my-2 text-[clamp(1.5rem,4vw,2rem)] font-extrabold">Personaliza tu negocio</h2>
              <span className="mb-2 text-sm text-slate-500">Paso 2 de 2 · Datos del negocio</span>
              <FormField id="catalog-signup-business" label="Nombre del negocio" type="text" placeholder="Ej: Cafetería Central" value={signUpBusinessName} autoComplete="organization" onChange={setSignUpBusinessName} />
              <FormField id="catalog-signup-phone" label="Teléfono del negocio" type="tel" placeholder="10 dígitos" value={signUpPhoneNumber} autoComplete="tel" onChange={setSignUpPhoneNumber} />
              <FormField id="catalog-signup-address" label="Dirección" type="text" placeholder="Calle y número" value={signUpAddress} autoComplete="street-address" onChange={setSignUpAddress} />
              <FormField id="catalog-signup-references" label="Referencias" type="text" placeholder="Entre calles, colonia, etc." value={signUpReferences} required={false} onChange={setSignUpReferences} />
              <div className="flex w-full flex-col items-start">
                <label htmlFor="catalog-signup-color" className="mt-2 text-xs font-semibold text-slate-700">Color principal</label>
                <input id="catalog-signup-color" className="my-2 h-11 w-full cursor-pointer border-0 bg-slate-100 p-1.5" type="color" value={signUpColor} onChange={(event) => setSignUpColor(event.target.value)} />
              </div>
              <div className="flex w-full flex-col items-start">
                <label htmlFor="catalog-signup-logo" className="mt-2 text-xs font-semibold text-slate-700">Logo del negocio</label>
                <input id="catalog-signup-logo" className="my-2 w-full border-0 bg-slate-100 px-3 py-2 text-slate-950" type="file" accept="image/*" onChange={handleLogoSelection} required />
                {signUpLogoFile ? <span className="text-xs text-slate-500">Archivo: {signUpLogoFile.name}</span> : null}
              </div>
              {error && isSignUp ? <span className="mt-1 w-full text-left text-xs text-red-600">{error}</span> : null}
              <button type="submit" className={primaryButtonClass} disabled={submitting}>{submitting ? "Registrando negocio..." : "Finalizar Registro"}</button>
              <button type="button" className={mobileSwitchClass} onClick={() => setSignUpStep("account")}>Volver al paso anterior</button>
            </form>
          )}
        </div>

        <div className={`absolute left-0 top-0 z-[2] flex h-full w-full justify-center transition-all duration-500 ease-in-out md:w-1/2 ${isSignUp ? "max-md:hidden md:translate-x-full" : "translate-x-0"}`}>
          <form className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-white px-12 py-8 text-center max-md:justify-start max-md:px-5 max-md:pb-[calc(2rem+env(safe-area-inset-bottom))] max-md:pt-14" onSubmit={handleSignIn}>
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#6d01d1]">{planName}</span>
            <h2 className="my-2 text-[clamp(1.7rem,4vw,2.25rem)] font-extrabold">Iniciar Sesión</h2>
            <span className="mb-3 text-sm text-slate-500">Usa tu cuenta de punto de venta</span>
            <FormField id="catalog-signin-email" label="Correo" type="email" placeholder="correo@negocio.com" value={signInEmail} autoComplete="email" onChange={(value) => { setSignInEmail(value); setError(null); }} />
            <FormField id="catalog-signin-password" label="Contraseña" type="password" placeholder="********" value={signInPassword} autoComplete="current-password" onChange={(value) => { setSignInPassword(value); setError(null); }} />
            {error && !isSignUp ? <span className="mt-1 w-full text-left text-xs text-red-600">{error}</span> : null}
            <button type="submit" className={primaryButtonClass} disabled={submitting}>{submitting ? "Entrando..." : "Iniciar Sesión"}</button>
            <button type="button" className={mobileSwitchClass} onClick={() => { setMode("signup"); setSignUpStep("account"); setError(null); }}>Crear Cuenta</button>
          </form>
        </div>

        <div className={`absolute left-1/2 top-0 z-0 hidden h-full w-1/2 overflow-hidden transition-transform duration-500 ease-in-out md:block ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}>
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-[#542c7a] to-[#6d01d1] text-white transition-transform duration-500 ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}>
            <div className={`absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-500 ease-in-out ${isSignUp ? "translate-x-0" : "-translate-x-[20%]"}`}>
              <h2 className="my-3 text-[clamp(1.7rem,4vw,2.25rem)] font-extrabold">Hola de Nuevo!</h2>
              <p className="mb-5 leading-relaxed">Inicia sesión para continuar con {planName} sin salir de esta página.</p>
              <button type="button" className={ghostButtonClass} onClick={goToSignIn}>Inicio de Sesión</button>
            </div>
            <div className={`absolute right-0 top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-500 ease-in-out ${isSignUp ? "translate-x-[20%]" : "translate-x-0"}`}>
              <h2 className="my-3 text-[clamp(1.7rem,4vw,2.25rem)] font-extrabold">Hola, Bienvenido</h2>
              <p className="mb-5 leading-relaxed">Crea tu cuenta para mantenerte en el flujo del paquete seleccionado.</p>
              <button type="button" className={ghostButtonClass} onClick={() => { setMode("signup"); setSignUpStep("account"); setError(null); }}>Crear Cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FreeCatalogLoginModal };
