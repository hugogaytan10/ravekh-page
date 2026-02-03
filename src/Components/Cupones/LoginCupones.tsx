import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cubito from "../../assets/Cupones/cubito.png";
import bolsita from "../../assets/Cupones/bolsita.png";
import {
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesUserId,
  setCuponesUserName,
} from "./cuponesSession";
import { loginCupones } from "./couponsApi";

const accentYellow = "#fbbc04";
const softGray = "#e6e6e6";
const textGray = "#5a5a5a";

const LoginCupones: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.boxShadow = `0 0 0 4px ${accentYellow}40`;
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
        localStorage.setItem("cupones-token", loginResponse.Token ?? "");
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="relative w-full bg-[#ffb300] pt-10 pb-16 rounded-b-[44px] shadow-md overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-[-30px] bottom-[-60px] w-[200px] h-[200px] bg-white/20 rounded-full" />
          <div className="absolute right-[-60px] top-[20px] w-[220px] h-[220px] bg-white/18 rounded-full" />
        </div>
        <div className="relative flex justify-center">
          <img src={cubito} alt="Personaje de cubo" className="w-44 drop-shadow-xl" />
        </div>
      </div>

      <div className="w-full max-w-[428px] px-8 flex flex-col items-center text-center text-[#303030]">
        <div className="mt-10 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido</h1>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: softGray, color: textGray, boxShadow: "none" }}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-2xl px-5 py-3.5 text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: softGray, color: textGray, boxShadow: "none" }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-[#3f3f3f]">
          Si no tienes cuenta,
          <button
            type="button"
            className="ml-1 font-bold"
            style={{ color: accentYellow }}
            onClick={() => navigate("/cupones/registro")}
          >
            puedes crearla
          </button>
        </p>

        <button
          type="button"
          className="mt-7 w-full bg-[#fbbb0d] text-white font-extrabold py-3.5 text-lg rounded-full shadow-[0_10px_24px_rgba(251,188,4,0.35)] hover:brightness-110 transition"
          onClick={handleLogin}
        >
          Iniciar sesión
        </button>
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

export { LoginCupones };
export default LoginCupones;
