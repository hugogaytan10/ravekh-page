import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cubito from "../../assets/Cupones/cubito.png";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#ffca1f";
const textGray = "#414141";
const inputGray = "#e6e6e6";

const BackIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CuponesChangeName: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Aquí se podría agregar la lógica para actualizar el nombre
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-6 pb-12">
      <div className="absolute top-[-140px] right-[-160px] w-[320px] h-[320px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-160px] left-[-200px] w-[360px] h-[360px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <div className="pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-lg bg-[#f2f2f2] flex items-center justify-center shadow-sm text-[#6a6a6a]"
            aria-label="Volver"
          >
            <BackIcon />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <img src={cubito} alt="Mascota Cupones" className="h-40 w-40 object-contain" />
        </div>

        <section className="mt-8 text-center text-[#414141]" style={{ color: textGray }}>
          <h1 className="text-xl font-extrabold">Aquí puedes cambiar tu nombre</h1>
        </section>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-xl px-4 py-3 text-base shadow-inner outline-none"
              style={{ backgroundColor: inputGray, color: textGray }}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full px-4 py-3 text-lg font-extrabold text-white shadow-[0_12px_22px_rgba(251,188,4,0.45)]"
            style={{ backgroundColor: accentYellow }}
          >
            Actualizar información
          </button>
        </form>
      </div>
    </div>
  );
};

export { CuponesChangeName };
export default CuponesChangeName;
