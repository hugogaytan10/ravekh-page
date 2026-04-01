import { useState } from "react";
import { deleteLoyaltyCustomer } from "../cloneApi";
import { clearLoyaltyCustomerSession, readLoyaltyCustomerSession } from "../customerSession";

export const LoyaltyCustomerDeleteAccountPage = () => {
  const session = readLoyaltyCustomerSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    if (!session) {
      setError("No hay sesión de cliente activa.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await deleteLoyaltyCustomer(session.id);
      clearLoyaltyCustomerSession();
      setMessage("Cuenta eliminada correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Eliminar cuenta</h2>
      <p>Esta acción es permanente.</p>
      <button type="button" onClick={() => void deleteAccount()} disabled={loading}>{loading ? "Eliminando..." : "Eliminar mi cuenta"}</button>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {message ? <p className="loyalty-customer-portal__toast">{message}</p> : null}
    </section>
  );
};
