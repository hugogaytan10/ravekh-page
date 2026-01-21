import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import bolsita from "../../assets/Cupones/bolsita.png";
import { URL } from "../CatalogoWeb/Const/Const";
import { setCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const softGray = "#e6e6e6";
const textGray = "#5a5a5a";

const RegisterCupones: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 4px ${accentYellow}40`;
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
          Name: name,
          Email: email,
          Password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la cuenta.");
      }

      setCuponesSession(true);
      navigate("/cupones/home");
    } catch (error) {
      console.error("Error registrando cuenta:", error);
      setErrorMessage("No se pudo registrar la cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="relative w-full bg-[#ffb300] pt-10 pb-12 rounded-b-[44px] shadow-md overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-[-40px] bottom-[-70px] w-[220px] h-[220px] bg-white/18 rounded-full" />
          <div className="absolute right-[-70px] top-[10px] w-[240px] h-[240px] bg-white/16 rounded-full" />
        </div>
        <div className="relative flex justify-center">
          <img src={cuponsito} alt="Ticket sonriente" className="w-36 drop-shadow-xl" />
        </div>
      </div>

      <div className="w-full max-w-[428px] px-8 flex flex-col items-center text-center text-[#303030]">
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Registrar mi cuenta</h1>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: softGray, color: textGray, boxShadow: "none" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="crea una contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: softGray, color: textGray, boxShadow: "none" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: softGray, color: textGray, boxShadow: "none" }}
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
          className="mt-7 w-full bg-[#fbbb0d] text-white font-extrabold py-3.5 text-lg rounded-full shadow-[0_10px_24px_rgba(251,188,4,0.35)] hover:brightness-110 transition disabled:opacity-70"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-6 text-sm font-semibold text-[#3f3f3f]">
          Si ya tienes cuenta,
          <button
            type="button"
            className="ml-1 font-bold"
            style={{ color: accentYellow }}
            onClick={() => navigate("/cupones")}
          >
            inicia sesión
          </button>
        </p>
      </div>

      <div className="relative w-full mt-14 pb-6 flex justify-center overflow-hidden">
        <div
          className="absolute bottom-[-48px] left-0 right-0 h-40 bg-[#fbbb0d] rounded-t-[120px]"
          aria-hidden="true"
        />
        <img src={bolsita} alt="Bolsa amarilla sonriente" className="relative w-36 drop-shadow-xl" />
      </div>
    </div>
  );
};

export { RegisterCupones };
export default RegisterCupones;
