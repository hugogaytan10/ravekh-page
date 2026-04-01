import { FormEvent, useState } from "react";
import { renameLoyaltyCustomer } from "../cloneApi";
import { readLoyaltyCustomerSession, writeLoyaltyCustomerSession } from "../customerSession";

export const LoyaltyCustomerChangeNamePage = () => {
  const session = readLoyaltyCustomerSession();
  const [name, setName] = useState(session?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) {
      setError("Primero valida tu token.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await renameLoyaltyCustomer(session.id, name);
      writeLoyaltyCustomerSession({ ...session, name });
      setMessage("Nombre actualizado correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar nombre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Cambiar nombre</h2>
      <form onSubmit={onSubmit}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nuevo nombre" required />
        <button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
      </form>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {message ? <p className="loyalty-customer-portal__toast">{message}</p> : null}
    </section>
  );
};
