import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { Coupon, updateCoupon, deleteCoupon } from "./couponsApi";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const QR_SIZE = 21;

const createSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash || 1;
};

const generateQrMatrix = (value: string, size: number) => {
  let seed = createSeed(value);
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return Math.abs(seed) / 0x7fffffff;
  };

  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => random() > 0.5),
  );
};

const randomQrValue = () => {
  const part = Math.random().toString(36).slice(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `QR-${part}-${timestamp.slice(-4)}`;
};

const CuponesEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = getCuponesUserName();
  const couponState = location.state as { coupon?: Coupon; focusDelete?: boolean } | null;
  const [coupon, setCoupon] = useState<Coupon | null>(couponState?.coupon ?? null);
  const [qrValue, setQrValue] = useState(coupon?.QR ?? "QR-AB12C-9F4D");
  const [validUntil, setValidUntil] = useState(
    coupon?.Valid ? new Date(coupon.Valid).toISOString().slice(0, 10) : "2024-12-31",
  );
  const [limitUsers, setLimitUsers] = useState(coupon?.LimitUsers ?? 120);
  const [description, setDescription] = useState(
    coupon?.Description ?? "2x1 en salchitacos en sucursales participantes.",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (couponState?.coupon) {
      setCoupon(couponState.coupon);
      setQrValue(couponState.coupon.QR);
      setValidUntil(new Date(couponState.coupon.Valid).toISOString().slice(0, 10));
      setLimitUsers(couponState.coupon.LimitUsers);
      setDescription(couponState.coupon.Description);
    }
  }, [couponState]);

  const qrMatrix = useMemo(() => generateQrMatrix(qrValue, QR_SIZE), [qrValue]);
  const isFormValid = Boolean(validUntil && description.trim() && coupon);

  const handleUpdate = async () => {
    if (!coupon) {
      setErrorMessage("Selecciona un cupón válido para editar.");
      return;
    }

    if (!isFormValid) {
      setErrorMessage("Completa la fecha de vigencia y la descripción.");
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      await updateCoupon(coupon.Id, {
        Business_Id: coupon.Business_Id,
        QR: qrValue,
        Description: description.trim(),
        Valid: `${validUntil}T00:00:00`,
        LimitUsers: limitUsers,
      });
      navigate("/cupones/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al actualizar.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!coupon) {
      setErrorMessage("Selecciona un cupón válido para eliminar.");
      return;
    }

    const confirmed = window.confirm("¿Seguro que quieres eliminar este cupón?");
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      await deleteCoupon(coupon.Id);
      navigate("/cupones/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al eliminar.";
      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-12">
      <div className="absolute top-[-140px] right-[-160px] w-[340px] h-[340px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-160px] left-[-180px] w-[360px] h-[360px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]">
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm text-[#6a6a6a]">Editar cupón</p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          {!coupon ? (
            <section className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] bg-white">
              <p className="text-sm font-semibold text-[#414141]">
                No se encontró el cupón. Regresa al panel para seleccionarlo de nuevo.
              </p>
            </section>
          ) : null}
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Detalle del cupón</p>
                <p className="text-sm text-white/80">Actualiza vigencia y límites.</p>
              </div>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
                onClick={() => navigate("/cupones/admin")}
              >
                Volver
              </button>
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
            style={{ backgroundColor: mutedRose, color: textDark }}
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-extrabold">Código QR</p>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-bold bg-white/80 text-[#3e3e3e]"
                onClick={() => setQrValue(randomQrValue())}
              >
                Regenerar
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="rounded-2xl bg-white p-3 shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
                <svg
                  viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                  className="h-24 w-24"
                  shapeRendering="crispEdges"
                >
                  <rect width="100%" height="100%" fill="#ffffff" />
                  {qrMatrix.map((row, rowIndex) =>
                    row.map(
                      (cell, colIndex) =>
                        cell && (
                          <rect
                            key={`${rowIndex}-${colIndex}`}
                            x={colIndex}
                            y={rowIndex}
                            width="1"
                            height="1"
                            fill="#2e2e2e"
                          />
                        ),
                    ),
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold">Valor QR</label>
                <input
                  value={qrValue}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-black bg-white px-3 py-2 text-sm font-semibold text-[#3e3e3e]"
                />
                <p className="mt-2 text-[11px] text-[#6a6a6a]">
                  Si regeneras el QR el cupón anterior quedará inválido.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div
              className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.14)] bg-white"
            >
              <label className="text-sm font-bold text-[#414141]">Valid hasta</label>
              <input
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="mt-2 w-full rounded-xl border border-black bg-white px-3 py-2 text-sm font-semibold text-[#414141]"
              />
              <p className="mt-2 text-xs text-[#6a6a6a]">Selecciona el último día de vigencia.</p>
            </div>

            <div
              className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.14)] bg-white"
            >
              <label className="text-sm font-bold text-[#414141]">LimitUsers</label>
              <input
                type="number"
                min={1}
                value={limitUsers}
                onChange={(event) => setLimitUsers(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-black bg-white px-3 py-2 text-sm font-semibold text-[#414141]"
              />
              <p className="mt-2 text-xs text-[#6a6a6a]">Número máximo de usuarios que pueden usarlo.</p>
            </div>

            <div
              className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.14)] bg-white"
            >
              <label className="text-sm font-bold text-[#414141]">Descripción</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Describe el beneficio del cupón"
                className="mt-2 w-full resize-none rounded-xl border border-black bg-white px-3 py-2 text-sm font-semibold text-[#414141]"
              />
              <p className="mt-2 text-xs text-[#6a6a6a]">Incluye el detalle que verá el cliente.</p>
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <p className="text-sm font-semibold text-white/80">Resumen</p>
            <div className="mt-2 space-y-1 text-sm font-semibold">
              <p>QR: {qrValue}</p>
              <p>Valid: {validUntil || "Selecciona una fecha"}</p>
              <p>LimitUsers: {limitUsers}</p>
              <p>Descripción: {description || "Agrega una descripción"}</p>
            </div>
            {errorMessage ? <p className="mt-3 text-xs font-semibold text-white/80">{errorMessage}</p> : null}
            <button
              type="button"
              className="mt-4 w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
              onClick={handleUpdate}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? "Actualizando..." : "Actualizar cupón"}
            </button>
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-white/70 px-4 py-3 text-sm font-bold text-white"
              onClick={handleDelete}
              disabled={!coupon || isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar cupón"}
            </button>
          </section>
        </main>

        <div className="mt-10">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesEdit };
export default CuponesEdit;
