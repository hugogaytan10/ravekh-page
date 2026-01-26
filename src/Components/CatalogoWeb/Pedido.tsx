import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./Context/AppContext";
import { CartPos } from "./PuntoVenta/Model/CarPos";
import { FiTruck, FiCreditCard, FiPhone } from "react-icons/fi"; // Importando iconos
import { Order } from "./Modelo/Order";
import { OrderDetails } from "./Modelo/OrderDetails";
import { insertOrder, sendNotification, getIdentifier } from "./Petitions";
import trash from '../../assets/trash.svg';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { URL } from "./Const/Const";

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

type PedidoView = "cart" | "info";

export const Pedido: React.FC<{ view?: PedidoView }> = ({ view = "cart" }) => {
  const { cart, phoneNumber: storePhoneNumber, idBussiness, setCart, color, setColor } = useContext(AppContext); // Número de la tienda
  const navigate = useNavigate();
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showModalProduct, setShowModalProduct] = useState<boolean>(false); // Estado para mostrar el modal de confirmación
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>(""); // Número del cliente
  const [deliveryMethod, setDeliveryMethod] = useState<string>("domicilio");
  const [paymentMethod, setPaymentMethod] = useState<string>("transferencia");
  const [showModal, setShowModal] = useState<boolean>(false); // Estado para mostrar el modal de confirmación
  const [deleteProduct, setDeleteProduct] = useState<{ id: number; variantId: number | null } | null>(null); // Estado para guardar el producto a eliminar
  const [quantityWarnings, setQuantityWarnings] = useState<Record<string, string | null>>({});
  const [shippingOptions, setShippingOptions] = useState<ShippingOptions>(defaultShippingOptions);
  const [loadingShippingOptions, setLoadingShippingOptions] = useState<boolean>(true);
  const [openSection, setOpenSection] = useState<null | "contact" | "delivery" | "address" | "payment">(null);
  console.log("Info tienda o negocio:", idBussiness);
  // Campos de dirección
  const [calle, setCalle] = useState<string>("");
  const [codigoPostal, setCodigoPostal] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");
  const context = useContext(AppContext);

  // Estados para los errores
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    clientPhoneNumber?: string;
    deliveryMethod?: string;
    paymentMethod?: string;
    calle?: string;
    codigoPostal?: string;
    municipio?: string;
    estado?: string;
  }>({});
  const fieldRefs = {
    nombre: useRef<HTMLDivElement>(null),
    email: useRef<HTMLDivElement>(null),
    clientPhoneNumber: useRef<HTMLDivElement>(null),
    deliveryMethod: useRef<HTMLDivElement>(null),
    calle: useRef<HTMLDivElement>(null),
    codigoPostal: useRef<HTMLDivElement>(null),
    municipio: useRef<HTMLDivElement>(null),
    estado: useRef<HTMLDivElement>(null),
    paymentMethod: useRef<HTMLDivElement>(null),
  };

  const isCartView = view === "cart";

  const totalArticulos = cart.reduce((total, item) => total + (item.Quantity || 1), 0);
  const totalPrecio = cart.reduce((total, item) => {
    const hasPromo =
      item.PromotionPrice != null &&
      item.PromotionPrice > 0 &&
      item.PromotionPrice < item.Price;
    const unitPrice = hasPromo ? item.PromotionPrice : item.Price;
    return total + unitPrice  * (item.Quantity || 1);
  }, 0);
  const buildAddress = () => {
    if (deliveryMethod !== "domicilio") return "Recoger en tienda";

    const parts: string[] = [];

    if (shippingOptions.Street && calle.trim()) parts.push(`Calle: ${calle}`);
    if (shippingOptions.ZipCode && codigoPostal.trim()) parts.push(`Código Postal: ${codigoPostal}`);
    if (shippingOptions.City && municipio.trim()) parts.push(`Municipio: ${municipio}`);
    if (shippingOptions.State && estado.trim()) parts.push(`Estado: ${estado}`);
    if (shippingOptions.References && referencia.trim()) parts.push(`Referencia: ${referencia}`);

    return parts.length ? parts.join(", ") : "Entrega a domicilio";
  };

  const saveOrder = async () => {
    const fullAddress = buildAddress();

    const order: Order = {
      Name: shippingOptions.ContactInformation ? nombre : "", // si no piden contacto, manda vacío
      Business_Id: Number(idBussiness),
      Delivery: deliveryMethod === "domicilio" ? 1 : 0,
      PaymentMethod: shippingOptions.PaymentMetod ? paymentMethod : "", // si no piden pago, manda vacío
      Address: fullAddress,
      PhoneNumber: shippingOptions.ContactInformation ? clientPhoneNumber : "",
    };

    const orderDetails: OrderDetails[] = cart.map((producto) => ({
      Product_Id: producto.Id!,
      Quantity: producto.Quantity || 1,
    }));

    insertOrder(order, orderDetails).then((data) => console.log(data));
  };


  useEffect(() => {
    const storedBusinessId = localStorage.getItem("cartBusinessId");
    if (storedBusinessId && idBussiness && storedBusinessId !== idBussiness) {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartBusinessId");
      setCart([]);
      return;
    }
    if (cart.length === 0) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    }
  }, [cart.length, idBussiness, setCart]);

  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!idBussiness) return;

      setLoadingShippingOptions(true);
      try {
        const res = await fetch(`${URL}shippingoptions/business/${idBussiness}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Si tu API requiere token aquí, descomenta:
            // token: context.user?.Token,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Soporta: data puede venir como objeto o array [obj]
        const row = Array.isArray(data) ? data[0] : data;

        // Si no hay registro, usa defaults (evita crash)
        if (!row) {
          setShippingOptions(defaultShippingOptions);
          return;
        }

        const parsed: ShippingOptions = {
          ContactInformation: Number(row.ContactInformation) === 1,
          ShippingMetod: Number(row.ShippingMetod) === 1,
          Street: Number(row.Street) === 1,
          ZipCode: Number(row.ZipCode) === 1,
          City: Number(row.City) === 1,
          State: Number(row.State) === 1,
          References: Number(row.References) === 1,
          PaymentMetod: Number(row.PaymentMetod) === 1,
        };

        setShippingOptions(parsed);

        // Opcional: si deshabilitan método de envío/pago, deja valores default pero NO muestres UI
        // (no hace falta cambiar estados, pero si quieres forzar un valor fijo, aquí puedes)
        // if (!parsed.ShippingMetod) setDeliveryMethod("domicilio");
        // if (!parsed.PaymentMetod) setPaymentMethod("transferencia");
      } catch (e) {
        console.error("Error cargando shipping options:", e);
        // fallback
        setShippingOptions(defaultShippingOptions);
      } finally {
        setLoadingShippingOptions(false);
      }
    };

    loadShippingOptions();
  }, [idBussiness]);


  useEffect(() => {
    window.scrollTo(0, 0);
    if (!context.phoneNumber) {
      const storedPhoneNumber = localStorage.getItem("telefono");
      if (storedPhoneNumber) {
        context.setPhoneNumber(storedPhoneNumber);
      }
    }
    if (!context.color) {
      const storedColor = localStorage.getItem("color");
      if (storedColor) {
        context.setColor(storedColor);
        setColor(storedColor);
      }
    }
    const menuIcono = document.getElementById("menuIcono");
    menuIcono?.classList.add("hidden");

    const menuNavegacion = document.getElementById("menuIconoCatalogo");
    menuNavegacion?.classList.remove("hidden");

    //ocultamos la imagen del menu
    const menuImagen = document.getElementById("imgCatalogo");
    menuImagen?.classList.add("hidden");

    //mostramos la flecha de regreso
    const arrowIcon = document.getElementById("backCatalogo");
    arrowIcon?.classList.remove("hidden");
  }, []);
 
  // Función para validar los campos
  const validate = () => {
    const newErrors: {
      nombre?: string;
      email?: string;
      clientPhoneNumber?: string;
      deliveryMethod?: string;
      paymentMethod?: string;
      calle?: string;
      codigoPostal?: string;
      municipio?: string;
      estado?: string;
    } = {};

    if (shippingOptions.ContactInformation) {
      if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";

      if (!clientPhoneNumber.trim()) {
        newErrors.clientPhoneNumber = "El teléfono es obligatorio.";
      } else if (!/^\d{7,15}$/.test(clientPhoneNumber)) {
        newErrors.clientPhoneNumber =
          "El teléfono debe contener solo números y tener entre 7 y 15 dígitos.";
      }
    }

    // Email sigue siendo opcional, pero si viene lo validas:
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "El email no es válido.";
    }

    if (shippingOptions.ShippingMetod && !deliveryMethod) {
      newErrors.deliveryMethod = "Selecciona un método de entrega.";
    }

    if (shippingOptions.PaymentMetod && !paymentMethod) {
      newErrors.paymentMethod = "Selecciona un método de pago.";
    }

    if (deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled) {
      if (shippingOptions.Street && !calle.trim()) {
        newErrors.calle = "La calle es obligatoria.";
      }
      if (shippingOptions.ZipCode && !codigoPostal.trim()) {
        newErrors.codigoPostal = "El código postal es obligatorio.";
      }
      if (shippingOptions.City && !municipio.trim()) {
        newErrors.municipio = "El municipio es obligatorio.";
      }
      if (shippingOptions.State && !estado.trim()) {
        newErrors.estado = "El estado es obligatorio.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.nombre || newErrors.email || newErrors.clientPhoneNumber) {
        setOpenSection("contact");
      } else if (newErrors.deliveryMethod) {
        setOpenSection("delivery");
      } else if (newErrors.calle || newErrors.codigoPostal || newErrors.municipio || newErrors.estado) {
        setOpenSection("address");
      } else if (newErrors.paymentMethod) {
        setOpenSection("payment");
      }
    }
    return Object.keys(newErrors).length === 0;
  };


  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Aquí puedes manejar el envío del formulario, por ejemplo, enviar los datos al servidor o preparar el mensaje para WhatsApp
      //tomamos el numero de la tienda y mandamos un mensaje de whatsapp
      //diciendo 'Hola he hecho un pedido con los siguientes productos...'
      saveOrder();

      const addressText =
        deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled
          ? `Dirección: ${buildAddress()}`
          : "";

      const contactText = shippingOptions.ContactInformation
        ? `Nombre: ${nombre}
      Email: ${email || "No proporcionado"}
      Teléfono: ${clientPhoneNumber}`
        : "";

      const paymentText = shippingOptions.PaymentMetod
        ? `Método de pago: ${paymentMethod}`
        : "";

      const shippingText = shippingOptions.ShippingMetod
        ? `Método de entrega: ${
            deliveryMethod === "domicilio" ? "Entrega a domicilio" : "Recoger en tienda"
          }`
        : "";

      const mensaje = `Hola, he hecho un pedido con los siguientes productos:
        ${cart
          .map(
            (producto) =>
              `${producto.Name}${
                producto.VariantDescription ? ` (${producto.VariantDescription})` : ""
              } x ${producto.Quantity || 1} $${(producto.Quantity || 1) * producto.Price}`
          )
          .join("\n")}
        Total: $${totalPrecio.toFixed(2)}
        ${shippingText}
        ${paymentText}
        ${contactText}
        ${addressText}`.trim();

      const url = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(
        mensaje
      )}`;
      console.log(url);
      context.clearCart();
      window.open(url, "_blank");
    } else {
      console.log("Formulario inválido, mostrando errores.");
    }
  };

  useEffect(() => {
    if (isCartView) return;
    const order = [
      "nombre",
      "email",
      "clientPhoneNumber",
      "deliveryMethod",
      "calle",
      "codigoPostal",
      "municipio",
      "estado",
      "paymentMethod",
    ] as const;
    const firstKey = order.find((key) => Boolean(errors[key]));
    if (!firstKey) return;
    requestAnimationFrame(() => {
      fieldRefs[firstKey]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [errors, isCartView]);

  const incrementQuantity = (product: CartPos) => {
    const maxStock = product.Stock;
    let hasChanged = false;
    const key = getProductKey(product);

    const updatedCart = cart.map(item => {
      if (item.Id === product.Id && (item.Variant_Id ?? null) === (product.Variant_Id ?? null)) {
        const currentQuantity = item.Quantity ?? 1;
        const nextQuantity = maxStock != null ? Math.min(currentQuantity + 1, maxStock) : currentQuantity + 1;

        if (nextQuantity !== currentQuantity) {
          hasChanged = true;
          return { ...item, Quantity: nextQuantity };
        }
      }
      return item;
    });

    if (hasChanged) {
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      if (idBussiness) {
        localStorage.setItem("cartBusinessId", String(idBussiness));
      }
      setQuantityWarnings((prev) => ({ ...prev, [key]: null }));
    }
  };

  const decrementQuantity = (product: CartPos) => {
    const key = getProductKey(product);
    const updatedCart = cart
      .map(item => {
        if (item.Id === product.Id && (item.Variant_Id ?? null) === (product.Variant_Id ?? null)) {
          if (item.Quantity! > 1) {
            return { ...item, Quantity: item.Quantity! - 1 }; // Reduce la cantidad
          } else {
            setShowModalProduct(true); // Muestra el modal de confirmación
            setDeleteProduct({ id: product.Id!, variantId: product.Variant_Id ?? null }); // Guarda el producto a eliminar
          }
        }
        return item;
      })
      .filter(item => item !== null); // Filtra los productos eliminados

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    if (idBussiness) {
      localStorage.setItem("cartBusinessId", String(idBussiness));
    }
    setQuantityWarnings((prev) => ({ ...prev, [key]: null }));
  };

  const getProductKey = (product: CartPos) => `${product.Id}-${product.Variant_Id ?? "base"}`;

  const handleManualQuantityChange = (product: CartPos, value: string) => {
    const key = getProductKey(product);
    const maxStock = product.Stock;

    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(parsed, maxStock === 0 ? 0 : 1);

    let warning: string | null = null;
    let nextQuantity = parsed;

    if (maxStock != null && parsed > maxStock) {
      nextQuantity = maxStock;
      warning = "Has alcanzado el límite de stock disponible.";
    }

    const updatedCart = cart.map(item => {
      if (item.Id === product.Id && (item.Variant_Id ?? null) === (product.Variant_Id ?? null)) {
        return { ...item, Quantity: nextQuantity };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    if (idBussiness) {
      localStorage.setItem("cartBusinessId", String(idBussiness));
    }
    setQuantityWarnings((prev) => ({ ...prev, [key]: warning }));
  };

  const hasAnyAddressFieldEnabled =
    shippingOptions.Street ||
    shippingOptions.ZipCode ||
    shippingOptions.City ||
    shippingOptions.State ||
    shippingOptions.References;

  const visibleSections = useMemo(
    () => ({
      contact: shippingOptions.ContactInformation,
      delivery: shippingOptions.ShippingMetod,
      address: hasAnyAddressFieldEnabled,
      payment: shippingOptions.PaymentMetod,
    }),
    [hasAnyAddressFieldEnabled, shippingOptions]
  );

  useEffect(() => {
    if (openSection) return;
    const firstOpen =
      (visibleSections.contact && "contact") ||
      (visibleSections.delivery && "delivery") ||
      (visibleSections.address && "address") ||
      (visibleSections.payment && "payment") ||
      null;
    setOpenSection(firstOpen);
  }, [openSection, visibleSections]);

  if (loadingShippingOptions) {
    return (
      <HelmetProvider>
        <>
          <Helmet>
            <meta name="theme-color" content={color || "#6D01D1"} />
          </Helmet>
          <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <p className="text-[var(--text-primary)] font-semibold">Cargando formulario…</p>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Preparando campos del negocio</p>
            </div>
          </div>
        </>
      </HelmetProvider>
    );
  }

  const pageTitle = isCartView ? "Finaliza el pedido" : "Información del pedido";

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <meta name="theme-color" content={color || "#6D01D1"} />
        </Helmet>
        <div
          className={`pt-28 ${isCartView ? "pb-32" : "pb-24"} px-4 ${
            isCartView ? "max-w-6xl" : "max-w-xl"
          } mx-auto min-h-screen bg-[var(--bg-primary)]`}
        >
          {/* Resumen del pedido */}
          <h1 className="text-2xl font-semibold mt-6 mb-6 text-center text-[var(--text-primary)]">
            {pageTitle}
          </h1>

          {isCartView && (
            <div className="md:flex md:items-start md:gap-10">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Tu carrito</h2>
                <div className="space-y-6">
                  {cart.map((producto: CartPos) => {
                    const hasPromo =
                      producto.PromotionPrice != null &&
                      producto.PromotionPrice > 0 &&
                      producto.PromotionPrice < producto.Price;
                    const unitPrice = hasPromo ? producto.PromotionPrice : producto.Price;
                    const totalLine = (unitPrice * (producto.Quantity || 1)).toFixed(2);

                    return (
                      <div
                        key={`${producto.Id}-${producto.Variant_Id ?? "base"}`}
                        className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm flex items-center gap-6"
                      >
                        <img
                          src={producto.Image || (producto.Images && producto.Images[0]) || ""}
                          alt={producto.Name}
                          className="w-28 h-28 object-cover rounded-[var(--radius-md)]"
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {producto.Name}
                            {producto.VariantDescription ? `, ${producto.VariantDescription}` : ""}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {hasPromo && (
                              <span className="text-sm text-[var(--text-muted)] line-through">
                                ${producto.Price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-lg font-semibold text-[var(--text-primary)]">
                              ${unitPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-5">
                            {producto.Quantity! > 1 ? (
                              <button
                                onClick={() => decrementQuantity(producto)}
                                className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-lg"
                              >
                                −
                              </button>
                            ) : (
                              <button
                                onClick={() => decrementQuantity(producto)}
                                className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
                              >
                                <img src={trash} alt="Eliminar" className="w-5 h-5" />
                              </button>
                            )}
                            <span className="text-base font-semibold text-[var(--text-primary)]">
                              {producto.Quantity ?? 1}
                            </span>
                            <button
                              onClick={() => incrementQuantity(producto)}
                              className="w-10 h-10 rounded-full bg-[var(--action-primary)] text-[var(--text-inverse)] text-lg"
                            >
                              +
                            </button>
                          </div>
                          {quantityWarnings[getProductKey(producto)] && (
                            <p className="text-xs text-[var(--state-error)] mt-2">
                              {quantityWarnings[getProductKey(producto)]}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto text-right">
                          <span className="text-sm text-[var(--text-muted)]">Total</span>
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            ${totalLine}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 md:mt-0 md:w-80 md:sticky md:top-28 self-start">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
                    <span>Total de artículos</span>
                    <span>{totalArticulos}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                    <span className="text-[var(--text-primary)]">Total</span>
                    <span className="text-[var(--state-error)]">
                      ${totalPrecio.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 sticky bottom-4 z-10">
                  <button
                    type="button"
                    onClick={() => navigate("/catalogo/pedido-info")}
                    className="w-full rounded-full bg-[var(--action-primary)] text-[var(--text-inverse)] py-4 text-lg font-semibold shadow-lg"
                    disabled={cart.length === 0}
                  >
                    Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 w-full rounded-full bg-[var(--action-disabled)] text-[var(--text-inverse)] py-4 text-lg font-semibold"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            </div>
          )}
            {isCartView && cart.length > 0 && (
              <div className="flex justify-center mt-6">
                <span
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className="text-[var(--state-error)] cursor-pointer hover:underline text-sm"
                >
                  Limpiar Carrito
                </span>
              </div>
            )}

          {/* Formulario para el nombre y contacto */}
          {!isCartView && (
          <form onSubmit={handleSubmit}>
            {shippingOptions.ContactInformation && (
            <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-sm mt-6">
              <button
                type="button"
                onClick={() => setOpenSection((prev) => (prev === "contact" ? null : "contact"))}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Información de contacto
                </h2>
                <span
                  className={`text-[var(--text-secondary)] transition-transform ${
                    openSection === "contact" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  openSection === "contact"
                    ? "max-h-[900px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2"
                }`}
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={fieldRefs.nombre} className="flex flex-col">
                  <label className="text-sm text-[var(--text-secondary)]">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`bg-[var(--bg-subtle)] w-full p-3 border ${errors.nombre ? "border-[var(--state-error)]" : "border-[var(--border-default)]"
                      } rounded-[var(--radius-md)] focus:outline-none`}
                    placeholder="Introduce tu nombre"
                  />
                  {errors.nombre && (
                    <span className="text-[var(--state-error)] text-sm mt-1">
                      {errors.nombre}
                    </span>
                  )}
                </div>
                <div ref={fieldRefs.email} className="flex flex-col">
                  <label className="text-sm text-[var(--text-secondary)]">Email (opcional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-[var(--bg-subtle)] w-full p-3 border ${errors.email ? "border-[var(--state-error)]" : "border-[var(--border-default)]"
                      } rounded-[var(--radius-md)] focus:outline-none`}
                    placeholder="Introduce tu email"
                  />
                  {errors.email && (
                    <span className="text-[var(--state-error)] text-sm mt-1">
                      {errors.email}
                    </span>
                  )}
                </div>
                <div ref={fieldRefs.clientPhoneNumber} className="md:col-span-2 flex flex-col">
                  <label className="text-sm text-[var(--text-secondary)]">Teléfono móvil</label>
                  <input
                    type="text"
                    value={clientPhoneNumber}
                    onChange={(e) => setClientPhoneNumber(e.target.value)}
                    className={`bg-[var(--bg-subtle)] w-full p-3 border ${errors.clientPhoneNumber
                      ? "border-[var(--state-error)]"
                      : "border-[var(--border-default)]"
                      } rounded-[var(--radius-md)] focus:outline-none`}
                    placeholder="Introduce tu teléfono"
                  />
                  {errors.clientPhoneNumber && (
                    <span className="text-[var(--state-error)] text-sm mt-1">
                      {errors.clientPhoneNumber}
                    </span>
                  )}
                </div>
              </div>
              </div>
            </div>)}
          {/* Método de entrega */}
          {shippingOptions.ShippingMetod && (
            <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-sm mt-6">
              <button
                type="button"
                onClick={() => setOpenSection((prev) => (prev === "delivery" ? null : "delivery"))}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Método de entrega
                </h2>
                <span
                  className={`text-[var(--text-secondary)] transition-transform ${
                    openSection === "delivery" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  openSection === "delivery"
                    ? "max-h-[500px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2"
                }`}
              >
                <div ref={fieldRefs.deliveryMethod} className="mt-4 flex items-center mb-4">
                  <FiTruck className="text-[var(--text-muted)] mr-2" size={20} />
                  <label className="text-sm text-[var(--text-secondary)]">
                    Seleccione el método de entrega
                  </label>
                </div>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)] focus:outline-none"
                >
                  <option value="domicilio">Entrega a domicilio</option>
                  <option value="recoger">Recoger en tienda</option>
                </select>
                {errors.deliveryMethod && (
                  <span className="text-[var(--state-error)] text-sm mt-2 block">
                    {errors.deliveryMethod}
                  </span>
                )}
              </div>
            </div>
          )}

            {deliveryMethod === "domicilio" && hasAnyAddressFieldEnabled && (
              <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-sm mt-6">
                <button
                  type="button"
                  onClick={() => setOpenSection((prev) => (prev === "address" ? null : "address"))}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Dirección de entrega
                  </h2>
                  <span
                    className={`text-[var(--text-secondary)] transition-transform ${
                      openSection === "address" ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    openSection === "address"
                      ? "max-h-[900px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2"
                  }`}
                >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingOptions.Street && (
                    <div ref={fieldRefs.calle} className="flex flex-col">
                      <label className="text-sm text-[var(--text-secondary)]">Calle</label>
                      <input
                        type="text"
                        value={calle}
                        onChange={(e) => setCalle(e.target.value)}
                        className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)]"
                        placeholder="Introduce tu calle"
                      />
                      {errors.calle && (
                        <span className="text-[var(--state-error)] text-sm mt-1">
                          {errors.calle}
                        </span>
                      )}
                    </div>
                  )}

                  {shippingOptions.ZipCode && (
                    <div ref={fieldRefs.codigoPostal} className="flex flex-col">
                      <label className="text-sm text-[var(--text-secondary)]">Código Postal</label>
                      <input
                        type="text"
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                        className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)]"
                        placeholder="Código Postal"
                      />
                      {errors.codigoPostal && (
                        <span className="text-[var(--state-error)] text-sm mt-1">
                          {errors.codigoPostal}
                        </span>
                      )}
                    </div>
                  )}

                  {shippingOptions.City && (
                    <div ref={fieldRefs.municipio} className="flex flex-col">
                      <label className="text-sm text-[var(--text-secondary)]">Municipio</label>
                      <input
                        type="text"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)]"
                        placeholder="Municipio"
                      />
                      {errors.municipio && (
                        <span className="text-[var(--state-error)] text-sm mt-1">
                          {errors.municipio}
                        </span>
                      )}
                    </div>
                  )}

                  {shippingOptions.State && (
                    <div ref={fieldRefs.estado} className="flex flex-col">
                      <label className="text-sm text-[var(--text-secondary)]">Estado</label>
                      <input
                        type="text"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)]"
                        placeholder="Estado"
                      />
                      {errors.estado && (
                        <span className="text-[var(--state-error)] text-sm mt-1">
                          {errors.estado}
                        </span>
                      )}
                    </div>
                  )}

                  {shippingOptions.References && (
                    <div className="md:col-span-2 flex flex-col">
                      <label className="text-sm text-[var(--text-secondary)]">Referencia (opcional)</label>
                      <input
                        type="text"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)]"
                        placeholder="Introduce una referencia (opcional)"
                      />
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Método de pago */}
            {shippingOptions.PaymentMetod && (
              <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-sm mt-6">
                <button
                  type="button"
                  onClick={() => setOpenSection((prev) => (prev === "payment" ? null : "payment"))}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Método de pago
                  </h2>
                  <span
                    className={`text-[var(--text-secondary)] transition-transform ${
                      openSection === "payment" ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    openSection === "payment"
                      ? "max-h-[500px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2"
                  }`}
                >
                  <div ref={fieldRefs.paymentMethod} className="mt-4 flex items-center mb-4">
                    <FiCreditCard className="text-[var(--text-muted)] mr-2" size={20} />
                    <label className="text-sm text-[var(--text-secondary)]">Seleccione un método de pago</label>
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-[var(--bg-subtle)] w-full p-3 border border-[var(--border-default)] rounded-[var(--radius-md)] focus:outline-none"
                  >
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="dinero">Dinero en efectivo</option>
                    <option value="tarjeta">Tarjeta de crédito o débito</option>
                    <option value="enlace">Enlace de pago</option>
                  </select>
                  {errors.paymentMethod && (
                    <span className="text-[var(--state-error)] text-sm mt-2 block">
                      {errors.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Botón para continuar */}
            <div className="mt-8 flex flex-col gap-4">
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--action-primary)] text-white py-4 text-lg font-semibold shadow-sm"
              >
                Preparar pedido
              </button>
              <button
                type="button"
                onClick={() => navigate("/catalogo/pedido")}
                className="w-full rounded-full bg-[var(--action-disabled)] text-white py-4 text-lg font-semibold"
              >
                Seguir comprando
              </button>
            </div>
          </form>
          )}

          {!isCartView && (
            <div className="mt-6 text-center">
              <FiPhone className="inline-block text-[var(--text-muted)] mr-2" size={18} />
              <p className="text-[var(--text-secondary)] text-sm inline-block">
                Contacto de la tienda: {storePhoneNumber}
              </p>
            </div>
          )}
          {/* MODAL QUE VIENE DE ABAJO DE LA PANTALLA PARA PREGUNTAR SI ESTA SEGURO QUE QUIERE ELIMINAR EL CARRITO */}
          {isCartView && cart.length > 0 && (
            <div
              className={`fixed inset-0 flex items-end justify-center bg-black/50 transition-opacity duration-300 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
              <div className="bg-[var(--bg-surface)] rounded-t-[var(--radius-lg)] p-6 w-full border border-[var(--border-default)]">
                <h2 className="text-lg font-semibold mb-2 text-center text-[var(--text-primary)]">¿Estás seguro?</h2>
                <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">¿Quieres eliminar todos los productos del carrito?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-[var(--action-disabled)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      context.clearCart();
                      setShowModal(false);
                    }}
                    className="bg-[var(--state-error)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* MODAL QUE VIENE DE ABAJO DE LA PANTALLA PARA PREGUNTAR SI ESTA SEGURO QUE QUIERE ELIMINAR EL producto */}
          {isCartView && showModalProduct && (
            <div
              className={`fixed inset-0 flex items-end justify-center bg-black/50 transition-opacity duration-300 ${showModalProduct ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
              <div className="bg-[var(--bg-surface)] rounded-t-[var(--radius-lg)] p-6 w-full border border-[var(--border-default)]">
                <h2 className="text-lg font-semibold mb-2 text-center text-[var(--text-primary)]">¿Estás seguro?</h2>
                <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">¿Quieres eliminar el producto del carrito?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowModalProduct(false)}
                    className="bg-[var(--action-disabled)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowModalProduct(false);
                      if (deleteProduct) {
                        context.removeProductFromCart(deleteProduct.id.toString(), deleteProduct.variantId ?? null);
                      }
                    }}
                    className="bg-[var(--state-error)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </HelmetProvider>
  );
};
