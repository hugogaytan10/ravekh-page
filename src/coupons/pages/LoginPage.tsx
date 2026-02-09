import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cubito from "../../assets/Cupones/cubito.png";
import bolsita from "../../assets/Cupones/bolsita.png";
import cajita from "../../assets/Cupones/cajita.png";
import carterita from "../../assets/Cupones/carterita.png";
import papitas from "../../assets/Cupones/papitas.png";
import { AutoImageCarousel } from "../components/AutoImageCarousel";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import {
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesToken,
  setCuponesUserId,
  setCuponesUserName,
} from "../services/session";
import { loginCupones } from "../services/couponsApi";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme } = useCouponsTheme();
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 4px ${theme.accent}40`;
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = "none";
  };

  const handleLogin = async () => {
    try {
      const loginResponse = await loginCupones({ Email: email, Password: password });
      if (loginResponse?.Role) {
        setCuponesSession(true);
        setCuponesUserName(loginResponse.Name ?? "");
        setCuponesUserId(loginResponse.Id);
        setCuponesBusinessId(loginResponse.Business_Id);
        localStorage.setItem("cupones-role", loginResponse.Role);
        setCuponesToken(loginResponse.Token ?? "");
        if (loginResponse.Role === "ADMINISTRADOR") {
          navigate("/cupones/admin");
          return;
        }
        if (loginResponse.Role === "CLIENTE") {
          navigate("/cupones/home");
          return;
        }
      }
      setCuponesSession(false);
    } catch (error) {
      setCuponesSession(false);
    }
  };

  const carouselImages = [bolsita, cajita, carterita, papitas];

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: theme.background }}>
      <div
        className="relative w-full pt-10 pb-16 rounded-b-[44px] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ backgroundColor: theme.accent }}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-[-30px] bottom-[-60px] w-[200px] h-[200px] bg-white/20 rounded-full" />
          <div className="absolute right-[-60px] top-[20px] w-[220px] h-[220px] bg-white/20 rounded-full" />
        </div>
        <div className="relative flex justify-center">
          <img src={cubito} alt="Personaje de cubo" className="w-44 drop-shadow-xl" />
        </div>
      </div>

      <div className="w-full max-w-[428px] px-8 flex flex-col items-center text-center" style={{ color: theme.textPrimary }}>
        <div className="mt-10 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido</h1>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, boxShadow: "none" }}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, boxShadow: "none" }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <p className="mt-5 text-sm font-semibold" style={{ color: theme.textMuted }}>
          Si no tienes cuenta,
          <button
            type="button"
            className="ml-1 font-bold"
            style={{ color: theme.accent }}
            onClick={() => navigate("/cupones/registro")}
          >
            puedes crearla
          </button>
        </p>

        <button
          type="button"
          className="mt-7 w-full font-extrabold py-3.5 text-lg rounded-full shadow-[0_14px_30px_rgba(0,0,0,0.25)] hover:brightness-110 transition"
          style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
          onClick={handleLogin}
        >
          Iniciar sesión
        </button>
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

export { LoginPage };
export default LoginPage;
