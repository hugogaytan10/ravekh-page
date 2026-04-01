import { FormEvent, useMemo, useState } from "react";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../../../../pos/shared/config/posEnv";
import { LoyaltyCustomerApi } from "../api/LoyaltyCustomerApi";
import { LoyaltyCustomerPage } from "../pages/LoyaltyCustomerPage";
import { LoyaltyCustomerService } from "../services/LoyaltyCustomerService";
import type { LoyaltyCustomerCoupon, LoyaltyCustomerProfile, LoyaltyVisitProgress } from "../model/LoyaltyCustomer";
import "./LoyaltyCustomerPortalPage.css";

const API_BASE_URL = getPosApiBaseUrl();

export const LoyaltyCustomerPortalPage = () => {
  const [token, setToken] = useState("");
  const [visitToken, setVisitToken] = useState("");
  const [customer, setCustomer] = useState<LoyaltyCustomerProfile | null>(null);
  const [progress, setProgress] = useState<LoyaltyVisitProgress | null>(null);
  const [coupons, setCoupons] = useState<LoyaltyCustomerCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const customerPortal = useMemo(() => {
    const httpClient = new FetchHttpClient(API_BASE_URL);
    const repository = new LoyaltyCustomerApi(httpClient);
    const service = new LoyaltyCustomerService(repository);
    return new LoyaltyCustomerPage(service);
  }, []);

  const bootstrapCustomer = async (profile: LoyaltyCustomerProfile) => {
    const [nextProgress, nextCoupons] = await Promise.all([
      customerPortal.loadProgress(profile.id),
      customerPortal.loadCoupons(profile.id),
    ]);

    setCustomer(profile);
    setProgress(nextProgress);
    setCoupons(nextCoupons);
  };

  const handleValidateToken = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setToast(null);

    try {
      const profile = await customerPortal.validateToken(token);
      await bootstrapCustomer(profile);
      setToast("Token validado. Ya puedes consultar visitas y cupones.");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "No se pudo validar el token.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVisit = async (event: FormEvent) => {
    event.preventDefault();
    if (!customer) {
      setError("Primero valida el token del cliente.");
      return;
    }

    setLoading(true);
    setError(null);
    setToast(null);

    try {
      const response = await customerPortal.redeemVisit(visitToken, customer.id);
      await bootstrapCustomer(customer);
      setVisitToken("");
      setToast(response.message + (response.couponGenerated ? " Se generó un cupón nuevo." : ""));
    } catch (redeemError) {
      setError(redeemError instanceof Error ? redeemError.message : "No fue posible registrar la visita.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCoupon = async (couponId: number) => {
    if (!customer) {
      setError("Primero valida el token del cliente.");
      return;
    }

    setLoading(true);
    setError(null);
    setToast(null);

    try {
      await customerPortal.redeemCoupon(couponId, customer.id);
      await bootstrapCustomer(customer);
      setToast("Cupón canjeado correctamente.");
    } catch (couponError) {
      setError(couponError instanceof Error ? couponError.message : "No se pudo canjear el cupón.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="loyalty-customer-portal">
      <header>
        <h1>Fidelidad cliente</h1>
        <p>Módulo desacoplado para validar token, revisar progreso y canjear cupones.</p>
      </header>

      <section className="loyalty-customer-portal__card">
        <h2>1) Validar token cliente</h2>
        <form onSubmit={handleValidateToken}>
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token del cliente" />
          <button type="submit" disabled={loading}>{loading ? "Validando..." : "Validar"}</button>
        </form>
      </section>

      <section className="loyalty-customer-portal__card">
        <h2>2) Progreso de visitas</h2>
        {customer ? (
          <>
            <p><strong>Cliente:</strong> {customer.name} (#{customer.id})</p>
            <p><strong>Visitas:</strong> {progress?.totalVisits ?? 0} / {progress?.visitsRequired ?? 10}</p>
            <div className="loyalty-customer-portal__progress">
              <span style={{ width: `${Math.round((progress?.completionRatio ?? 0) * 100)}%` }} />
            </div>
            <p>Faltan {progress?.remainingVisits ?? 0} visita(s) para el siguiente beneficio.</p>
          </>
        ) : (
          <p>Sin cliente validado.</p>
        )}
      </section>

      <section className="loyalty-customer-portal__card">
        <h2>3) Registrar visita por token</h2>
        <form onSubmit={handleRedeemVisit}>
          <input value={visitToken} onChange={(event) => setVisitToken(event.target.value)} placeholder="Token de visita / QR" />
          <button type="submit" disabled={loading || !customer}>{loading ? "Procesando..." : "Registrar visita"}</button>
        </form>
      </section>

      <section className="loyalty-customer-portal__card">
        <h2>4) Cupones del cliente</h2>
        {coupons.length === 0 ? <p>No hay cupones disponibles.</p> : (
          <ul className="loyalty-customer-portal__coupons">
            {coupons.map((coupon) => (
              <li key={coupon.id}>
                <div>
                  <strong>{coupon.description}</strong>
                  <small>{coupon.qr || "Sin QR"}</small>
                </div>
                <button type="button" disabled={loading || coupon.isRedeemed} onClick={() => void handleRedeemCoupon(coupon.id)}>
                  {coupon.isRedeemed ? "Canjeado" : "Canjear"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {toast ? <p className="loyalty-customer-portal__toast">{toast}</p> : null}
    </main>
  );
};
