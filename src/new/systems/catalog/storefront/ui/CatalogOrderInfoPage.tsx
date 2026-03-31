import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi } from "../api/CatalogStorefrontApi";
import { getStripe } from "./stripeClient";
import "./CatalogOrderInfoPage.css";

type PaymentMethod = "efectivo" | "transferencia" | "tarjeta";

export const CatalogOrderInfoPage = () => {
  const navigate = useNavigate();
  const api = useMemo(() => new CatalogStorefrontApi(getPosApiBaseUrl()), []);
  const storeName = window.localStorage.getItem("catalog-v2-store-name") || "Catálogo";
  const businessId = Number(window.localStorage.getItem("idBusiness") || 0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("domicilio");
  const [address, setAddress] = useState("");
  const [references, setReferences] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardEnabled, setCardEnabled] = useState(false);


  useEffect(() => {
    const run = async () => {
      if (!businessId) return;
      const businessConfig = await api.getBusinessCheckoutConfig(String(businessId));
      setCardEnabled(Boolean(businessConfig?.stripeAccountId && businessConfig?.chargesEnabled));
      if (!businessConfig?.stripeAccountId || !businessConfig?.chargesEnabled) {
        setPaymentMethod("efectivo");
      }
    };

    void run();
  }, [api, businessId]);
  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Completa nombre y teléfono para continuar.");
      return;
    }

    if (deliveryMethod !== "recoger" && !address.trim()) {
      setError("Completa la dirección de entrega.");
      return;
    }

    const raw = window.localStorage.getItem(`catalog-v2-cart:${businessId}`);
    const cart = raw ? (JSON.parse(raw) as Array<{ name: string; price: number; quantity: number }>) : [];
    if (!cart.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === "tarjeta") {
        const [stripeConfig, businessConfig] = await Promise.all([
          api.getStripeConfig(),
          api.getBusinessCheckoutConfig(String(businessId)),
        ]);

        if (!stripeConfig?.publishableKey || !businessConfig?.stripeAccountId || !businessConfig.chargesEnabled) {
          throw new Error("El negocio no tiene pago con tarjeta disponible.");
        }

        const session = await api.createCheckoutSession({
          line_items: cart.map((item) => ({
            price_data: {
              currency: businessConfig.currency.toLowerCase(),
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          return_url: `${window.location.origin}/v2/catalogo/${businessId}`,
          connectedAccountId: businessConfig.stripeAccountId,
          businessId,
          ui_mode: "hosted",
          customer_email: email || undefined,
          metadata: {
            deliveryMethod,
            paymentMethod,
          },
        });

        if (!session?.sessionId) {
          throw new Error(session?.message || "No se pudo iniciar el pago con Stripe.");
        }

        const stripe = await getStripe(stripeConfig.publishableKey);
        const result = await stripe.redirectToCheckout({ sessionId: session.sessionId });
        if (result?.error?.message) {
          throw new Error(result.error.message);
        }

        return;
      }

      const storePhone = (window.localStorage.getItem("telefono") || "").replace(/\D/g, "");
      const lines = cart.map((item) => `• ${item.name} x${item.quantity}`);
      const message = [
        `Hola ${storeName}, quiero hacer mi pedido:`,
        ...lines,
        "",
        `Cliente: ${name}`,
        `Teléfono: ${phone}`,
        email ? `Email: ${email}` : "",
        `Entrega: ${deliveryMethod}`,
        address ? `Dirección: ${address}` : "",
        references ? `Referencias: ${references}` : "",
        `Pago: ${paymentMethod}`,
      ]
        .filter(Boolean)
        .join("\n");

      if (storePhone) {
        window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, "_blank");
      }
      navigate(`/v2/catalogo/${businessId}`);
    } catch (e: any) {
      setError(e?.message || "No se pudo preparar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="catalog-v2-order-info">
      <header className="catalog-v2-order-info__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver">←</button>
        <h1>{storeName}</h1>
      </header>

      <section className="catalog-v2-order-info__content">
        <h2>Información del pedido</h2>
        {error ? <p className="catalog-v2-order-info__error">{error}</p> : null}
        <article className="card open">
          <h3>Información de contacto</h3>
          <div className="grid">
            <label>Nombre completo<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Introduce tu nombre" /></label>
            <label>Email (opcional)<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduce tu email" /></label>
            <label className="full">Teléfono móvil<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Introduce tu teléfono" /></label>
          </div>
        </article>

        <article className="card open">
          <h3>Método de entrega</h3>
          <div className="grid">
            <label className="full">
              <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                <option value="domicilio">Domicilio</option>
                <option value="recoger">Recoger en tienda</option>
              </select>
            </label>
          </div>
        </article>

        {deliveryMethod !== "recoger" ? (
          <article className="card open">
            <h3>Dirección de entrega</h3>
            <div className="grid">
              <label className="full">Dirección<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, colonia, código postal" /></label>
              <label className="full">Referencias<input value={references} onChange={(e) => setReferences(e.target.value)} placeholder="Referencias del domicilio" /></label>
            </div>
          </article>
        ) : null}

        <article className="card open">
          <h3>Método de pago</h3>
          <div className="grid">
            <label className="full">
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                {cardEnabled ? <option value="tarjeta">Tarjeta (Stripe)</option> : null}
              </select>
            </label>
          </div>
        </article>

        <button type="button" className="submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Procesando..." : "Preparar pedido"}
        </button>
      </section>
    </main>
  );
};
