import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import bolsita from "../../assets/Cupones/bolsita.png";
import cajita from "../../assets/Cupones/cajita.png";
import carterita from "../../assets/Cupones/carterita.png";
import tiendita from "../../assets/Cupones/tiendita.png";
import { AutoImageCarousel } from "../components/AutoImageCarousel";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { URL } from "../../Components/CatalogoWeb/Const/Const";
import { setCuponesBusinessId, setCuponesSession, setCuponesUserId, setCuponesUserName } from "../services/session";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { theme } = useCouponsTheme();
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 4px ${theme.accent}40`;
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = "none";
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${URL}employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Role: "CLIENTE",
          Business_Id: 1,
          Name: name,
          Email: email,
          Password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la cuenta.");
      }

      const data = await response.json();
      setCuponesSession(true);
      setCuponesUserName(name);
      setCuponesUserId(data?.Id ?? data?.id);
      setCuponesBusinessId(1);
      navigate("/cupones/home");
    } catch (error) {
      console.error("Error registrando cuenta:", error);
      setErrorMessage("No se pudo registrar la cuenta. Intenta nuevamente.");
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

      <div className="w-full max-w-[428px] px-8 flex flex-col items-center text-center" style={{ color: theme.textPrimary }}>
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Registrar mi cuenta</h1>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, boxShadow: "none" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="crea una contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, boxShadow: "none" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, boxShadow: "none" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm font-semibold text-red-500">{errorMessage}</p>
        ) : null}

        <button
          type="button"
          className="mt-7 w-full font-extrabold py-3.5 text-lg rounded-full shadow-[0_14px_30px_rgba(0,0,0,0.25)] hover:brightness-110 transition disabled:opacity-70"
          style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-6 text-sm font-semibold" style={{ color: theme.textMuted }}>
          Si ya tienes cuenta,
          <button
            type="button"
            className="ml-1 font-bold"
            style={{ color: theme.accent }}
            onClick={() => navigate("/cupones")}
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

export { RegisterPage };
export default RegisterPage;
