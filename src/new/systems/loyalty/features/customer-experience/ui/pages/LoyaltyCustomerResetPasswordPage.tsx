import { FormEvent, useState } from "react";
import { resetLoyaltyPassword } from "../cloneApi";

export const LoyaltyCustomerResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetLoyaltyPassword(email, password);
      setMessage("Contraseña actualizada correctamente.");
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo restablecer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" type="email" required />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nueva contraseña" type="password" required minLength={6} />
        <button type="submit" disabled={loading}>{loading ? "Actualizando..." : "Actualizar"}</button>
      </form>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {message ? <p className="loyalty-customer-portal__toast">{message}</p> : null}
    </section>
  );
};
