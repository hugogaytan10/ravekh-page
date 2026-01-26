import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AppContext } from "./Context/AppContext";
import { Producto } from "./Modelo/Producto";
import { getProductById, getVariantsByProductIdPublic } from "./Petitions";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { ProductCarousel } from "./ProductsCarousel";
import { Variant } from "./PuntoVenta/Model/Variant";
import { VariantSelectionModal } from "./VariantSelectionModal";

type Params = {
  idProducto?: string;
  telefono?: string;
};

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

export const DetalleProducto: React.FC = () => {
  const { idProducto, telefono } = useParams<Params>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [count, setCount] = useState<number>(1);
  const [limit, setLimit] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [buyNowPending, setBuyNowPending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { color, setColor, addProductToCart, phoneNumber, setPhoneNumber, idBussiness, setIdBussiness, cart } =
    context;
  const cartVariantQuantities = useMemo(() => {
    const map: Record<number, number> = {};

    cart.forEach((item) => {
      if (item.Variant_Id != null && item.Quantity != null) {
        map[item.Variant_Id] = (map[item.Variant_Id] ?? 0) + item.Quantity;
      }
    });

    return map;
  }, [cart]);

  useEffect(() => {
    // color desde localStorage si no hay en contexto
    if (!color) {
      const storedColor = localStorage.getItem("color");
      if (storedColor) setColor(storedColor);
    }

    // teléfono desde localStorage si no hay en contexto
    if (!phoneNumber) {
      const storedPhoneNumber = localStorage.getItem("telefono");
      if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    }

    // idBusiness desde localStorage si no hay en contexto (FIX: antes lo comprobabas al revés)
    if (!idBussiness) {
      const storedIdBusiness = localStorage.getItem("idBusiness");
      if (storedIdBusiness) setIdBussiness(storedIdBusiness);
    }

    // toggle UI del menú (si usas Tailwind + IDs específicos)
    document.getElementById("menuIcono")?.classList.add("hidden");
    document.getElementById("menuIconoCatalogo")?.classList.remove("hidden");
    document.getElementById("imgCatalogo")?.classList.add("hidden");
    document.getElementById("backCatalogo")?.classList.remove("hidden");
  }, [color, idBussiness, phoneNumber, setColor, setIdBussiness, setPhoneNumber]);

  useEffect(() => {
    const id = idProducto ?? "1";
    let mounted = true;
    getProductById(id).then((data) => {
      if (!mounted) return;
      setProducto(data);
      setLimit(typeof data?.Stock === "number" ? data.Stock : null);
      setCount(1); // reset cantidad al cambiar de producto
      setStockWarning(null);

      const inlineVariants = Array.isArray((data as any)?.Variants)
        ? ((data as any).Variants as Variant[])
        : [];

      setVariants(inlineVariants);

      if (inlineVariants.length === 0) {
        setLoadingVariants(true);
        getVariantsByProductIdPublic(id)
          .then((variantData) => {
            if (!mounted) return;
            setVariants(Array.isArray(variantData) ? variantData : []);
          })
          .finally(() => {
            if (mounted) setLoadingVariants(false);
          });
      }
    });
    return () => {
      mounted = false;
    };
  }, [idProducto]);

  const images = useMemo(() => {
    if (!producto) return [];
    const base = [
      ...(producto as any)?.Image ? [(producto as any).Image as string] : [],
      ...(Array.isArray(producto.Images) ? producto.Images : []),
    ];
    // dedup por URL exacta
    return Array.from(new Set(base.filter(Boolean)));
  }, [producto]);

  const canAdd =
    !!producto &&
    producto.Available === 1 &&
    producto.ForSale === 1 &&
    (limit === null || limit > 0);

  const addButtonLabel = variants.length > 0 ? "Seleccionar variante" : "Añadir al carrito";

  const triggerToast = () => {
    setShowToast(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 1800);
  };

  const triggerPulse = () => {
    setAddedPulse(true);
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => setAddedPulse(false), 1200);
  };

  const handleAddCart = () => {
    if (!producto) return;
    setBuyNowPending(false);

    if (variants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    addProductToCart({ ...producto, Quantity: count, Variant_Id: null });
    triggerToast();
    triggerPulse();
  };

  const handleBuyNow = () => {
    if (!producto) return;
    setBuyNowPending(true);

    if (variants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    addProductToCart({ ...producto, Quantity: count, Variant_Id: null });
    triggerToast();
    triggerPulse();
    navigate("/catalogo/pedido");
  };

  const handleCountInput = (value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(parsed, limit === 0 ? 0 : 1);

    let warning: string | null = null;
    let next = parsed;

    if (limit != null && parsed > limit) {
      next = limit;
      warning = "Has alcanzado el límite de stock disponible.";
    }

    setCount(next);
    setStockWarning(warning);
  };

  const handleConfirmVariant = (selections: { variant: Variant; quantity: number }[]) => {
    if (!producto) return;

    selections.forEach(({ variant, quantity }) => {
      const basePrice = variant.PromotionPrice ?? variant.Price ?? producto.Price;

      addProductToCart({
        ...producto,
        Price: basePrice ?? 0,
        PromotionPrice: variant.PromotionPrice ?? producto.PromotionPrice,
        Variant_Id: variant.Id ?? null,
        VariantDescription: variant.Description,
        Stock: variant.Stock ?? producto.Stock,
        Quantity: quantity,
      });
    });

    setShowVariantModal(false);
    triggerToast();
    triggerPulse();
    if (buyNowPending) {
      setBuyNowPending(false);
      navigate("/catalogo/pedido");
    }
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
    setBuyNowPending(false);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

    const DetalleProductoSkeleton: React.FC = () => {
    return (
      <div className="px-4 pt-28 pb-24 min-h-screen bg-[var(--bg-primary)]">
        <div
          className={`pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 transition-opacity duration-200 ${
            showToast ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white shadow-sm">
            Agregado al carrito
          </div>
        </div>
        <div className="max-w-xl mx-auto animate-pulse space-y-6">
          <div className="w-full aspect-[4/5] bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]" />
          <div className="h-6 bg-[var(--bg-subtle)] rounded w-2/3" />
          <div className="h-5 bg-[var(--bg-subtle)] rounded w-32" />
          <div className="space-y-2">
            <div className="h-4 bg-[var(--bg-subtle)] rounded w-full" />
            <div className="h-4 bg-[var(--bg-subtle)] rounded w-5/6" />
          </div>
          <div className="h-12 bg-[var(--bg-subtle)] rounded-[var(--radius-md)]" />
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[var(--bg-subtle)] rounded-full" />
            <div className="w-8 h-4 bg-[var(--bg-subtle)] rounded" />
            <div className="w-12 h-12 bg-[var(--bg-subtle)] rounded-full" />
          </div>
          <div className="h-12 bg-[var(--bg-subtle)] rounded-full" />
        </div>
      </div>
    );
  };

  if (!producto) {
    return (
      <HelmetProvider>
        <Helmet>
          <meta name="theme-color" content={color || "#6D01D1"} />
          <title>Cargando producto...</title>
        </Helmet>

          <DetalleProductoSkeleton />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content={color || "#6D01D1"} />
        <title>{producto.Name}</title>
      </Helmet>

      <div className="px-4 pt-28 pb-24 min-h-screen bg-[var(--bg-primary)]">
        <div className="max-w-xl mx-auto">
          <ProductCarousel images={images} alt={producto.Name} />

          <div className="mt-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {producto.Name}
            </h1>
            <div className="flex items-end gap-3 mt-2">
              <div className="text-2xl font-semibold text-[var(--text-primary)]">
                {currency.format(Number(producto.PromotionPrice ?? producto.Price ?? 0))}
              </div>
              {producto.PromotionPrice && (
                <span className="text-sm text-[var(--text-muted)] line-through">
                  {currency.format(Number(producto.Price ?? 0))}
                </span>
              )}
            </div>
          </div>

          {producto.Description && (
            <div className="mt-4 text-[var(--text-secondary)] text-sm leading-relaxed">
              {producto.Description}
            </div>
          )}

          {variants.length > 0 && (
            <button
              type="button"
              onClick={() => setShowVariantModal(true)}
              className="mt-6 w-full flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Variantes
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {variants.length} opciones disponibles
                </p>
              </div>
              <span className="text-[var(--text-secondary)]">▾</span>
            </button>
          )}

          <div className={`mt-6 flex items-center justify-between ${variants.length > 0 ? "hidden" : ""}`}>
            <button
              className="w-11 h-11 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-lg disabled:opacity-40"
              onClick={() => {
                setCount((c) => Math.max(1, c - 1));
                setStockWarning(null);
              }}
              disabled={count <= 1}
            >
              -
            </button>
            <input
              type="number"
              min={limit === 0 ? 0 : 1}
              max={limit ?? undefined}
              value={count}
              onChange={(e) => handleCountInput(e.target.value)}
              className="w-16 text-center text-lg font-semibold text-[var(--text-primary)] bg-transparent focus:outline-none"
              aria-label="Cantidad a agregar"
            />
            <button
              className="w-11 h-11 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-lg disabled:opacity-40"
              onClick={() => {
                if (limit == null) {
                  setCount((c) => c + 1);
                  setStockWarning(null);
                  return;
                }
                if (count < limit) {
                  setCount((c) => c + 1);
                  setStockWarning(null);
                }
              }}
              disabled={limit !== null && count >= limit}
              title={limit !== null ? `Disponible: ${limit}` : undefined}
            >
              +
            </button>
          </div>
          {stockWarning && (
            <p className="text-xs text-[var(--state-error)] text-center mt-2">
              {stockWarning}
            </p>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={!canAdd}
              className="w-full rounded-full bg-[var(--action-primary)] text-white py-3 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingVariants && variants.length === 0
                ? "Buscando variantes..."
                : addButtonLabel === "Añadir al carrito"
                  ? "Comprar ahora"
                  : addButtonLabel}
            </button>
            <button
              type="button"
              onClick={handleAddCart}
              disabled={!canAdd}
              className={`w-full rounded-full bg-[var(--action-disabled)] text-white py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                addedPulse ? "scale-[1.02] ring-2 ring-[var(--action-primary)]" : ""
              }`}
            >
              {addedPulse ? "Agregado" : "Agregar al carrito"}
            </button>
          </div>
        </div>

        <VariantSelectionModal
          product={producto}
          variants={variants}
          isOpen={showVariantModal}
          onClose={handleCloseVariantModal}
          onConfirm={handleConfirmVariant}
          existingVariantQuantities={cartVariantQuantities}
        />

        <div className="bg-green-500 hover:bg-green-600 rounded-full p-2 fixed right-2 bottom-4 shadow-lg transition-all">
          <a
            href={`https://api.whatsapp.com/send?phone=52${telefono || phoneNumber || ""}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={logoWhasa} alt="WhatsApp" className="w-10 h-10" />
          </a>
        </div>
      </div>
    </HelmetProvider>
  );
};
