import { useParams } from "react-router-dom";

export const LoyaltyCustomerClaimPage = () => {
  const { couponId } = useParams<{ couponId: string }>();

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Detalle de cupón</h2>
      <p>Reclamando cupón: <strong>{couponId ?? "N/A"}</strong></p>
      <p>Este flujo ya está migrado al módulo moderno de fidelidad.</p>
    </section>
  );
};
