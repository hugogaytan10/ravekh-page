import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LoyaltyVisitProgress } from "../../model/LoyaltyCustomer";
import { createLoyaltyCustomerPortal } from "../customerPortalFactory";
import { readLoyaltyCustomerSession } from "../customerSession";

export const LoyaltyCustomerVisitsPage = () => {
  const portal = useMemo(() => createLoyaltyCustomerPortal(), []);
  const profile = readLoyaltyCustomerSession();
  const [visitToken, setVisitToken] = useState("");
  const [progress, setProgress] = useState<LoyaltyVisitProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    void portal.loadProgress(profile.id).then(setProgress).catch(() => setProgress(null));
  }, [portal, profile]);

  const handleRedeemVisit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) {
      setError("Valida token en la pestaña Token para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    setToast(null);

    try {
      const result = await portal.redeemVisit(visitToken, profile.id);
      const refreshed = await portal.loadProgress(profile.id);
      setProgress(refreshed);
      setVisitToken("");
      setToast(result.message);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo registrar la visita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Progreso de visitas</h2>
      {!profile ? <p>Valida tu token primero.</p> : (
        <>
          <p><strong>Cliente:</strong> {profile.name}</p>
          <p><strong>Visitas:</strong> {progress?.totalVisits ?? 0} / {progress?.visitsRequired ?? 10}</p>
          <div className="loyalty-customer-portal__progress">
            <span style={{ width: `${Math.round((progress?.completionRatio ?? 0) * 100)}%` }} />
          </div>
          <form onSubmit={handleRedeemVisit}>
            <input value={visitToken} onChange={(event) => setVisitToken(event.target.value)} placeholder="Token QR de visita" />
            <button type="submit" disabled={loading}>{loading ? "Registrando..." : "Registrar visita"}</button>
          </form>
        </>
      )}

      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {toast ? <p className="loyalty-customer-portal__toast">{toast}</p> : null}
    </section>
  );
};
