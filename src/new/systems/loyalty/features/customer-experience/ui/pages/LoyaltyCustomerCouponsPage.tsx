import { useEffect, useMemo, useState } from "react";
import type { LoyaltyCustomerCoupon } from "../../model/LoyaltyCustomer";
import { createLoyaltyCustomerPortal } from "../customerPortalFactory";
import { readLoyaltyCustomerSession } from "../customerSession";

export const LoyaltyCustomerCouponsPage = () => {
  const portal = useMemo(() => createLoyaltyCustomerPortal(), []);
  const profile = readLoyaltyCustomerSession();
  const [coupons, setCoupons] = useState<LoyaltyCustomerCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadCoupons = async () => {
    if (!profile) return;
    const rows = await portal.loadCoupons(profile.id);
    setCoupons(rows);
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const handleRedeem = async (couponId: number) => {
    if (!profile) {
      setError("Valida token en la pestaña Token para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    setToast(null);

    try {
      await portal.redeemCoupon(couponId, profile.id);
      await loadCoupons();
      setToast("Cupón canjeado correctamente.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo canjear el cupón.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loyalty-customer-portal__card">
      <h2>Mis cupones</h2>
      {!profile ? <p>Valida tu token primero.</p> : null}
      {profile && coupons.length === 0 ? <p>No hay cupones disponibles.</p> : null}

      {coupons.length > 0 ? (
        <ul className="loyalty-customer-portal__coupons">
          {coupons.map((coupon) => (
            <li key={coupon.id}>
              <div>
                <strong>{coupon.description}</strong>
                <small>{coupon.qr || "Sin QR"}</small>
              </div>
              <button type="button" disabled={loading || coupon.isRedeemed} onClick={() => void handleRedeem(coupon.id)}>
                {coupon.isRedeemed ? "Canjeado" : "Canjear"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="loyalty-customer-portal__error">{error}</p> : null}
      {toast ? <p className="loyalty-customer-portal__toast">{toast}</p> : null}
    </section>
  );
};
