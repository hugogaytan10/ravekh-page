import { FormEvent, useMemo, useState } from "react";
import { createLoyaltyCustomerPortal } from "../customerPortalFactory";
import { writeLoyaltyCustomerSession } from "../customerSession";

export const LoyaltyCustomerTokenPage = () => {
  const portal = useMemo(() => createLoyaltyCustomerPortal(), []);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setToast(null);

    try {
      const profile = await portal.validateToken(token);
      writeLoyaltyCustomerSession(profile);
      setToast(`Token validado para ${profile.name}.`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo validar el token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Validación de token</h2>
      <form onSubmit={handleSubmit}>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token del cliente" />
        <button type="submit" disabled={loading}>{loading ? "Validando..." : "Validar token"}</button>
      </form>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {toast ? <p className="loyalty-customer-portal__toast">{toast}</p> : null}
    </section>
  );
};
