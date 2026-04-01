import { FormEvent, useState } from "react";
import { registerLoyaltyCustomer } from "../cloneApi";

export const LoyaltyCustomerRegisterPage = () => {
  const [name, setName] = useState("");
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
      await registerLoyaltyCustomer(name, email, password);
      setMessage("Registro exitoso. Ya puedes iniciar sesión en fidelidad.");
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Registro de cliente</h2>
      <form onSubmit={onSubmit}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" required />
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" type="email" required />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" type="password" required minLength={6} />
        <button type="submit" disabled={loading}>{loading ? "Registrando..." : "Crear cuenta"}</button>
      </form>
      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {message ? <p className="loyalty-customer-portal__toast">{message}</p> : null}
    </section>
  );
};
