import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi } from "../api/CatalogStorefrontApi";
import { getStripe } from "./stripeClient";
import "./CatalogOrderInfoPage.css";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "enlace";
type OpenSection = "contact" | "delivery" | "address" | "payment" | null;

type ShippingOptions = {
  ContactInformation: boolean;
  ShippingMetod: boolean;
  Street: boolean;
  ZipCode: boolean;
  City: boolean;
  State: boolean;
  References: boolean;
  PaymentMetod: boolean;
};

type CartItem = {
  cartKey?: string;
  productId: number;
  variantId?: number;
  colorId?: number;
  sizeId?: number;
  colorName?: string;
  sizeName?: string;
  name: string;
  price: number;
  cost?: number;
  quantity: number;
};

const defaultShippingOptions: ShippingOptions = {
  ContactInformation: true,
  ShippingMetod: true,
  Street: true,
  ZipCode: true,
  City: true,
  State: true,
  References: true,
  PaymentMetod: true,
};

const hasAnyAddressFieldEnabled = (options: ShippingOptions) =>
  options.Street || options.ZipCode || options.City || options.State || options.References;

export const CatalogOrderInfoPage = () => {
  useCatalogThemeSync();
  const navigate = useNavigate();
  const api = useMemo(() => new CatalogStorefrontApi(getPosApiBaseUrl()), []);
  const storeName = window.localStorage.getItem("catalog-v2-store-name") || "Catálogo";
  const businessId = Number(window.localStorage.getItem("idBusiness") || 0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("domicilio");
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [references, setReferences] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardEnabled, setCardEnabled] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOptions>(defaultShippingOptions);
  const [openSection, setOpenSection] = useState<OpenSection>("contact");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    deliveryMethod?: string;
    paymentMethod?: string;
    street?: string;
    zipCode?: string;
    city?: string;
    state?: string;
  }>({});

  const fieldRefs = {
    name: useRef<HTMLLabelElement>(null),
    email: useRef<HTMLLabelElement>(null),
    phone: useRef<HTMLLabelElement>(null),
    deliveryMethod: useRef<HTMLLabelElement>(null),
    street: useRef<HTMLLabelElement>(null),
    zipCode: useRef<HTMLLabelElement>(null),
    city: useRef<HTMLLabelElement>(null),
    state: useRef<HTMLLabelElement>(null),
    paymentMethod: useRef<HTMLLabelElement>(null),
  };

  useEffect(() => {
    const run = async () => {
      if (!businessId) return;

      const [businessConfig, shippingResponse] = await Promise.all([
        api.getBusinessCheckoutConfig(String(businessId)),
        fetch(`${getPosApiBaseUrl().replace(/\/$/, "")}/shippingoptions/business/${businessId}`).then((response) =>
          response.ok ? response.json() : null,
        ),
      ]);

      setCardEnabled(Boolean(businessConfig?.stripeAccountId && businessConfig?.chargesEnabled));
      if (!businessConfig?.stripeAccountId || !businessConfig?.chargesEnabled) {
        setPaymentMethod("efectivo");
      }

      const row = Array.isArray(shippingResponse) ? shippingResponse[0] : shippingResponse;
      if (!row) return;

      setShippingOptions({
        ContactInformation: Number(row.ContactInformation) === 1,
        ShippingMetod: Number(row.ShippingMetod) === 1,
        Street: Number(row.Street) === 1,
        ZipCode: Number(row.ZipCode) === 1,
        City: Number(row.City) === 1,
        State: Number(row.State) === 1,
        References: Number(row.References) === 1,
        PaymentMetod: Number(row.PaymentMetod) === 1,
      });
    };

    void run();
  }, [api, businessId]);

  useEffect(() => {
    if (openSection) return;
    if (shippingOptions.ContactInformation) return setOpenSection("contact");
    if (shippingOptions.ShippingMetod) return setOpenSection("delivery");
    if (hasAnyAddressFieldEnabled(shippingOptions)) return setOpenSection("address");
    if (shippingOptions.PaymentMetod) return setOpenSection("payment");
  }, [openSection, shippingOptions]);

  useEffect(() => {
    const order = ["name", "email", "phone", "deliveryMethod", "street", "zipCode", "city", "state", "paymentMethod"] as const;
    const firstKey = order.find((key) => Boolean(errors[key]));
    if (!firstKey) return;
    requestAnimationFrame(() => {
      fieldRefs[firstKey]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [errors]);

  const buildAddress = () => {
    if (deliveryMethod !== "domicilio") return "Recoger en tienda";

    const parts: string[] = [];
    if (shippingOptions.Street && street.trim()) parts.push(`Calle: ${street}`);
    if (shippingOptions.ZipCode && zipCode.trim()) parts.push(`Código Postal: ${zipCode}`);
    if (shippingOptions.City && city.trim()) parts.push(`Municipio: ${city}`);
    if (shippingOptions.State && state.trim()) parts.push(`Estado: ${state}`);
    if (shippingOptions.References && references.trim()) parts.push(`Referencia: ${references}`);

    return parts.length ? parts.join(", ") : "Entrega a domicilio";
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (shippingOptions.ContactInformation) {
      if (!name.trim()) nextErrors.name = "El nombre es obligatorio.";
      if (!phone.trim()) {
        nextErrors.phone = "El teléfono es obligatorio.";
      } else if (!/^\d{7,15}$/.test(phone)) {
        nextErrors.phone = "El teléfono debe contener entre 7 y 15 dígitos.";
      }
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "El email no es válido.";
    }

    if (shippingOptions.ShippingMetod && !deliveryMethod) {
      nextErrors.deliveryMethod = "Selecciona un método de entrega.";
    }

    if (shippingOptions.PaymentMetod && !paymentMethod) {
      nextErrors.paymentMethod = "Selecciona un método de pago.";
    }

    if (deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled(shippingOptions)) {
      if (shippingOptions.Street && !street.trim()) nextErrors.street = "La calle es obligatoria.";
      if (shippingOptions.ZipCode && !zipCode.trim()) nextErrors.zipCode = "El código postal es obligatorio.";
      if (shippingOptions.City && !city.trim()) nextErrors.city = "El municipio es obligatorio.";
      if (shippingOptions.State && !state.trim()) nextErrors.state = "El estado es obligatorio.";
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      setOpenSection("contact");
    } else if (nextErrors.deliveryMethod) {
      setOpenSection("delivery");
    } else if (nextErrors.street || nextErrors.zipCode || nextErrors.city || nextErrors.state) {
      setOpenSection("address");
    } else if (nextErrors.paymentMethod) {
      setOpenSection("payment");
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const raw = window.localStorage.getItem(`catalog-v2-cart:${businessId}`);
    const cart = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (!cart.length) {
      setGeneralError("Tu carrito está vacío.");
      return;
    }

    setSubmitting(true);
    setGeneralError(null);

    try {
      const orderPayload = {
        Order: {
          Name: shippingOptions.ContactInformation ? name.trim() : "",
          Business_Id: businessId,
          Delivery: deliveryMethod === "domicilio" ? 1 : 0,
          PaymentMethod: shippingOptions.PaymentMetod ? paymentMethod : "",
          Address: buildAddress(),
          PhoneNumber: shippingOptions.ContactInformation ? phone.trim() : "",
        },
        OrderDetails: cart.map((item) => ({
          Quantity: Math.max(1, Number(item.quantity) || 1),
          ...(item.variantId
            ? { Variant_Id: Number(item.variantId) || 0 }
            : { Product_Id: Number(item.productId) || 0 }),
          ...(item.colorId ? { Color_Id: Number(item.colorId) || 0 } : {}),
          ...(item.sizeId ? { Size_Id: Number(item.sizeId) || 0 } : {}),
          ...(item.price ? { Price: Number(item.price) || 0 } : {}),
          ...(item.cost ? { Cost: Number(item.cost) || 0 } : {}),
        })),
      };

      const orderResult = await api.createCatalogOrder(orderPayload);
      if (!orderResult) {
        throw new Error("No se pudo registrar el pedido en el servidor.");
      }

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
            address: buildAddress(),
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
        `Cliente: ${name || "No proporcionado"}`,
        `Teléfono: ${phone || "No proporcionado"}`,
        email ? `Email: ${email}` : "",
        shippingOptions.ShippingMetod ? `Entrega: ${deliveryMethod}` : "",
        deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled(shippingOptions) ? `Dirección: ${buildAddress()}` : "",
        shippingOptions.PaymentMetod ? `Pago: ${paymentMethod}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      if (!storePhone) {
        throw new Error("No encontramos el teléfono de la tienda para enviar el pedido por WhatsApp.");
      }

      const whatsappUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
      window.localStorage.removeItem(`catalog-v2-cart:${businessId}`);
      navigate(`/v2/catalogo/${businessId}`);
    } catch (e: any) {
      setGeneralError(e?.message || "No se pudo preparar el pedido.");
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
        {generalError ? <p className="catalog-v2-order-info__error">{generalError}</p> : null}

        {shippingOptions.ContactInformation ? (
          <article className="card open">
            <button type="button" className="card-toggle" onClick={() => setOpenSection((prev) => (prev === "contact" ? null : "contact"))}>
              <h3>Información de contacto</h3>
              <span>{openSection === "contact" ? "▾" : "▸"}</span>
            </button>
            <div className={`section-content ${openSection === "contact" ? "open" : ""}`}>
              <div className="grid">
                <label ref={fieldRefs.name}>Nombre completo
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Introduce tu nombre" />
                  {errors.name ? <small>{errors.name}</small> : null}
                </label>
                <label ref={fieldRefs.email}>Email (opcional)
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduce tu email" />
                  {errors.email ? <small>{errors.email}</small> : null}
                </label>
                <label className="full" ref={fieldRefs.phone}>Teléfono móvil
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Introduce tu teléfono" />
                  {errors.phone ? <small>{errors.phone}</small> : null}
                </label>
              </div>
            </div>
          </article>
        ) : null}

        {shippingOptions.ShippingMetod ? (
          <article className="card open">
            <button type="button" className="card-toggle" onClick={() => setOpenSection((prev) => (prev === "delivery" ? null : "delivery"))}>
              <h3>Método de entrega</h3>
              <span>{openSection === "delivery" ? "▾" : "▸"}</span>
            </button>
            <div className={`section-content ${openSection === "delivery" ? "open" : ""}`}>
              <div className="grid">
                <label className="full" ref={fieldRefs.deliveryMethod}>
                  <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                    <option value="domicilio">Entrega a domicilio</option>
                    <option value="recoger">Recoger en tienda</option>
                  </select>
                  {errors.deliveryMethod ? <small>{errors.deliveryMethod}</small> : null}
                </label>
              </div>
            </div>
          </article>
        ) : null}

        {deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled(shippingOptions) ? (
          <article className="card open">
            <button type="button" className="card-toggle" onClick={() => setOpenSection((prev) => (prev === "address" ? null : "address"))}>
              <h3>Dirección de entrega</h3>
              <span>{openSection === "address" ? "▾" : "▸"}</span>
            </button>
            <div className={`section-content ${openSection === "address" ? "open" : ""}`}>
              <div className="grid">
                {shippingOptions.Street ? (
                  <label ref={fieldRefs.street}>Calle
                    <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Introduce tu calle" />
                    {errors.street ? <small>{errors.street}</small> : null}
                  </label>
                ) : null}
                {shippingOptions.ZipCode ? (
                  <label ref={fieldRefs.zipCode}>Código Postal
                    <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Código Postal" />
                    {errors.zipCode ? <small>{errors.zipCode}</small> : null}
                  </label>
                ) : null}
                {shippingOptions.City ? (
                  <label ref={fieldRefs.city}>Municipio
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Municipio" />
                    {errors.city ? <small>{errors.city}</small> : null}
                  </label>
                ) : null}
                {shippingOptions.State ? (
                  <label ref={fieldRefs.state}>Estado
                    <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" />
                    {errors.state ? <small>{errors.state}</small> : null}
                  </label>
                ) : null}
                {shippingOptions.References ? (
                  <label className="full">Referencia (opcional)
                    <input value={references} onChange={(e) => setReferences(e.target.value)} placeholder="Introduce una referencia" />
                  </label>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}

        {shippingOptions.PaymentMetod ? (
          <article className="card open">
            <button type="button" className="card-toggle" onClick={() => setOpenSection((prev) => (prev === "payment" ? null : "payment"))}>
              <h3>Método de pago</h3>
              <span>{openSection === "payment" ? "▾" : "▸"}</span>
            </button>
            <div className={`section-content ${openSection === "payment" ? "open" : ""}`}>
              <div className="grid">
                <label className="full" ref={fieldRefs.paymentMethod}>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="efectivo">Dinero en efectivo</option>
                    <option value="tarjeta" disabled={!cardEnabled}>
                      {cardEnabled ? "Tarjeta de crédito o débito" : "Tarjeta de crédito o débito (no disponible)"}
                    </option>
                    <option value="enlace">Enlace de pago</option>
                  </select>
                  {errors.paymentMethod ? <small>{errors.paymentMethod}</small> : null}
                </label>
              </div>
            </div>
          </article>
        ) : null}

        <button type="button" className="submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Procesando..." : "Preparar pedido"}
        </button>
      </section>
    </main>
  );
};
