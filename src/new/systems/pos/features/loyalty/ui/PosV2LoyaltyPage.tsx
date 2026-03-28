import { FormEvent, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2LoyaltyPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;

const getSession = () => {
  const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
  const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  return { token, businessId, hasSession: token.length > 0 && Number.isFinite(businessId) && businessId > 0 };
};

export const PosV2LoyaltyPage = () => {
  const [session] = useState(getSession);
  const [lookupQr, setLookupQr] = useState("");
  const [createQr, setCreateQr] = useState("");
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("10");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [coupon, setCoupon] = useState<{ id: number; qr?: string; description: string; maxRedemptions: number } | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createLoyaltyPage();
  }, []);

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession) {
      setError("No hay sesión activa para consultar fidelidad.");
      return;
    }

    const qr = lookupQr.trim();
    if (!qr) {
      setError("Ingresa un código QR para buscar cupón.");
      return;
    }

    setLoadingLookup(true);
    setError(null);
    setToast("");

    try {
      const found = await page.lookupCoupon(session.businessId, qr, session.token);
      setCoupon({ ...found, qr });
    } catch {
      setCoupon(null);
      setError("No encontramos un cupón con ese QR.");
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!session.hasSession) {
      setError("No hay sesión activa para crear cupones.");
      return;
    }

    const qr = createQr.trim();
    const safeDescription = description.trim();
    const maxRedemptions = Number(limitUsers);

    if (!qr || safeDescription.length < 3 || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa QR, descripción (mín. 3) y límite de canjes válido.");
      return;
    }

    setSavingCoupon(true);
    setError(null);
    setToast("");

    try {
      const created = await page.createCoupon(session.businessId, { qr, description: safeDescription, maxRedemptions }, session.token);
      setCoupon(created);
      setToast("Cupón de fidelidad creado correctamente.");
      setCreateQr("");
      setDescription("");
      setLimitUsers("10");
    } catch {
      setError("No fue posible crear el cupón de fidelidad.");
    } finally {
      setSavingCoupon(false);
    }
  };

  return (
    <PosV2Shell title="Fidelidad" subtitle="Gestión moderna de cupones y beneficios para clientes frecuentes.">
      <section className="pos-v2-loyalty">
        {!session.hasSession ? <p className="pos-v2-loyalty__error">No hay sesión activa para usar fidelidad.</p> : null}
        {error ? <p className="pos-v2-loyalty__error">{error}</p> : null}
        {toast ? <p className="pos-v2-loyalty__toast">{toast}</p> : null}

        <article className="pos-v2-loyalty__card">
          <h2>Buscar cupón por QR</h2>
          <form onSubmit={handleLookup} className="pos-v2-loyalty__form">
            <input value={lookupQr} onChange={(event) => setLookupQr(event.target.value)} placeholder="QR del cupón" />
            <button type="submit" disabled={loadingLookup}>{loadingLookup ? "Buscando..." : "Buscar"}</button>
          </form>
        </article>

        <article className="pos-v2-loyalty__card">
          <h2>Crear cupón</h2>
          <form onSubmit={handleCreate} className="pos-v2-loyalty__form">
            <input value={createQr} onChange={(event) => setCreateQr(event.target.value)} placeholder="QR único" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción del beneficio" />
            <input value={limitUsers} inputMode="numeric" onChange={(event) => setLimitUsers(event.target.value.replace(/[^\d]/g, ""))} placeholder="Límite de canjes" />
            <button type="submit" disabled={savingCoupon}>{savingCoupon ? "Guardando..." : "Crear cupón"}</button>
          </form>
        </article>

        <article className="pos-v2-loyalty__card">
          <h2>Detalle actual</h2>
          {!coupon ? <p>No hay cupón seleccionado.</p> : (
            <div className="pos-v2-loyalty__detail">
              <p><strong>ID:</strong> {coupon.id}</p>
              {coupon.qr ? <p><strong>QR:</strong> {coupon.qr}</p> : null}
              <p><strong>Descripción:</strong> {coupon.description}</p>
              <p><strong>Límite:</strong> {coupon.maxRedemptions} canjes</p>
            </div>
          )}
        </article>
      </section>
    </PosV2Shell>
  );
};
