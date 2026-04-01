import { FormEvent, useState } from "react";
import { redeemVisitByAdmin } from "../cloneApi";

export const LoyaltyCustomerAdminScanPage = () => {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await redeemVisitByAdmin(token, Number(userId));
      setMessage(result?.message || "Visita registrada correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Escanear / canjear (admin)</h2>
      <form onSubmit={onSubmit}>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token QR" required />
        <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="ID Cliente" type="number" required />
        <button type="submit" disabled={loading}>{loading ? "Procesando..." : "Canjear"}</button>
      </form>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {message ? <p className="loyalty-customer-portal__toast">{message}</p> : null}
    </section>
  );
};
