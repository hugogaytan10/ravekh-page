import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { deleteCouponsAccount } from "../services/couponsApi";
import {
  getCuponesToken,
  getCuponesUserId,
  hasCuponesSession,
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesToken,
  setCuponesUserId,
  setCuponesUserName,
} from "../services/session";

const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();
  const [isChecked, setIsChecked] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [didDelete, setDidDelete] = useState(false);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  const handleConfirmDelete = async () => {
    setConfirmModalVisible(false);
    setIsLoading(true);
    setDidDelete(false);

    try {
      const userId = getCuponesUserId();
      const token = getCuponesToken();
      if (!userId || !token) {
        setModalMessage("Necesitamos tu sesión activa para eliminar la cuenta.");
        return;
      }

      const data = await deleteCouponsAccount(userId, token);
      if (data?.affectedRows || data?.success) {
        setCuponesSession(false);
        setCuponesUserName("");
        setCuponesUserId();
        setCuponesBusinessId();
        setCuponesToken();
        localStorage.removeItem("cupones-role");
        setModalMessage("Cuenta eliminada con éxito.");
        setDidDelete(true);
      } else {
        setModalMessage("No se pudo eliminar la cuenta. Intenta de nuevo.");
      }
    } catch (error) {
      setModalMessage(error instanceof Error ? error.message : "Ocurrió un error al intentar eliminar la cuenta.");
    } finally {
      setIsLoading(false);
      setResultModalVisible(true);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 py-12 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-160px] right-[-200px] w-[380px] h-[380px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-220px] left-[-240px] w-[440px] h-[440px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-4 px-1" style={{ color: theme.textPrimary }}>
          <div
            className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
          >
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Eliminar cuenta</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Esta acción eliminará tu cuenta de cupones.
            </p>
          </div>
        </header>

        <main className="mt-10 space-y-6">
          <section
            className="rounded-2xl px-6 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.22)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <p className="text-base font-extrabold">Confirma la eliminación</p>
            <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
              Al eliminar tu cuenta perderás acceso a tus cupones y tu historial de visitas.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="h-6 w-6 rounded border flex items-center justify-center"
                style={{ borderColor: theme.border }}
                onClick={() => setIsChecked(!isChecked)}
              >
                {isChecked ? (
                  <span className="text-sm font-bold" style={{ color: theme.accent }}>
                    ✓
                  </span>
                ) : null}
              </button>
              <span className="text-sm font-semibold">Quiero eliminar mi cuenta.</span>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold"
              style={{
                backgroundColor: isChecked ? theme.accent : theme.surfaceElevated,
                color: theme.textPrimary,
                opacity: isChecked ? 1 : 0.7,
              }}
              onClick={() => setConfirmModalVisible(true)}
              disabled={!isChecked}
            >
              Eliminar cuenta
            </button>
            <button
              type="button"
              className="w-full rounded-full border px-4 py-3 text-sm font-bold"
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/ajustes")}
            >
              Volver a ajustes
            </button>
          </div>
        </main>
      </div>

      {confirmModalVisible ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-[420px] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary }}
          >
            <p className="text-base font-extrabold text-center">¿Eliminar tu cuenta?</p>
            <p className="mt-2 text-sm text-center" style={{ color: theme.textMuted }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-full px-4 py-2 text-sm font-bold"
                style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                onClick={handleConfirmDelete}
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                className="w-full rounded-full border px-4 py-2 text-sm font-bold"
                style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
                onClick={() => setConfirmModalVisible(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {resultModalVisible ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-[420px] rounded-2xl p-6 text-center shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary }}
          >
            {isLoading ? (
              <p className="text-sm font-semibold">Cargando...</p>
            ) : (
              <>
                <p className="text-sm font-semibold">{modalMessage}</p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-full px-4 py-2 text-sm font-bold"
                  style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                  onClick={() => {
                    setResultModalVisible(false);
                    if (didDelete) {
                      navigate("/cupones", { replace: true });
                    }
                  }}
                >
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { DeleteAccountPage };
export default DeleteAccountPage;
