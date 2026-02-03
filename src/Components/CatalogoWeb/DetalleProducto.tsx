import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AppContext } from "./Context/AppContext";
import { Producto } from "./Modelo/Producto";
import { getProductById, getVariantsByProductIdPublic } from "./Petitions";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { ProductCarousel } from "./ProductsCarousel";
import { Variant } from "./PuntoVenta/Model/Variant";

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
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [themeColor, setThemeColor] = useState("#F9FAFB");
  const [addedPulse, setAddedPulse] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { color, setColor, addProductToCart, phoneNumber, setPhoneNumber, idBussiness, setIdBussiness } =
    context;

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
    const updateThemeColor = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-primary")
        .trim();
      setThemeColor(value || "#F9FAFB");
    };

    updateThemeColor();
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = idProducto ?? "1";
    let mounted = true;
    getProductById(id).then((data) => {
      if (!mounted) return;
      setProducto(data);
      setCount(1); // reset cantidad al cambiar de producto
      setStockWarning(null);
      setSelectedVariantId(null);
      setVariantsOpen(true);

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

  const activeVariant = useMemo(
    () => variants.find((variant) => variant.Id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );
  const activeStock =
    activeVariant?.Stock ?? (producto?.Stock ?? null);
  const activePrice =
    activeVariant?.PromotionPrice ??
    activeVariant?.Price ??
    producto?.PromotionPrice ??
    producto?.Price ??
    0;
  const activeOriginalPrice =
    activeVariant?.PromotionPrice
      ? activeVariant?.Price
      : producto?.PromotionPrice
        ? producto?.Price
        : null;

  const canAdd =
    !!producto &&
    producto.Available === 1 &&
    producto.ForSale === 1 &&
    (activeStock === null || activeStock > 0);

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
    const variant = activeVariant;
    const itemPrice =
      variant?.PromotionPrice ?? variant?.Price ?? producto.PromotionPrice ?? producto.Price ?? 0;

    addProductToCart({
      ...producto,
      Price: itemPrice,
      PromotionPrice: variant?.PromotionPrice ?? producto.PromotionPrice,
      Variant_Id: variant?.Id ?? null,
      VariantDescription: variant?.Description,
      Stock: variant?.Stock ?? producto.Stock,
      Quantity: count,
    });
    triggerToast();
    triggerPulse();
  };

  const handleBuyNow = () => {
    if (!producto) return;
    const variant = activeVariant;
    const itemPrice =
      variant?.PromotionPrice ?? variant?.Price ?? producto.PromotionPrice ?? producto.Price ?? 0;

    addProductToCart({
      ...producto,
      Price: itemPrice,
      PromotionPrice: variant?.PromotionPrice ?? producto.PromotionPrice,
      Variant_Id: variant?.Id ?? null,
      VariantDescription: variant?.Description,
      Stock: variant?.Stock ?? producto.Stock,
      Quantity: count,
    });
    triggerToast();
    triggerPulse();
    navigate("/catalogo/pedido");
  };

  const handleCountInput = (value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(parsed, activeStock === 0 ? 0 : 1);

    let warning: string | null = null;
    let next = parsed;

    if (activeStock != null && parsed > activeStock) {
      next = activeStock;
      warning = "Has alcanzado el límite de stock disponible.";
    }

    setCount(next);
    setStockWarning(warning);
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
          <meta name="theme-color" content={themeColor} />
          <title>Cargando producto...</title>
        </Helmet>

          <DetalleProductoSkeleton />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content={themeColor} />
        <title>{producto.Name}</title>
      </Helmet>

      <div className="px-4 pt-28 pb-24 min-h-screen bg-[var(--bg-primary)]">
        <div className="max-w-5xl mx-auto md:flex md:gap-10">
          <div className="md:w-1/2">
            <ProductCarousel images={images} alt={producto.Name} />
          </div>

          <div className="md:w-1/2">
            <div className="mt-6 md:mt-0">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                {producto.Name}
              </h1>
              <div className="flex items-end gap-3 mt-2">
                <div className="text-2xl font-semibold text-[var(--text-primary)]">
                  {currency.format(Number(activePrice))}
                </div>
                {activeOriginalPrice != null && (
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    {currency.format(Number(activeOriginalPrice))}
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
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setVariantsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Variantes
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {variants.length} opciones disponibles
                  </p>
                </div>
                <span
                  className={`text-[var(--text-secondary)] transition-transform ${
                    variantsOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  variantsOpen
                    ? "max-h-[600px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2"
                }`}
              >
                <div className="pt-4 flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const selected = selectedVariantId === variant.Id;
                    const isOutOfStock =
                      variant.Stock != null && variant.Stock <= 0;

                    return (
                      <button
                        key={variant.Id ?? variant.Description}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId((prev) =>
                            prev === variant.Id ? null : variant.Id ?? null
                          );
                          setCount(1);
                          setStockWarning(null);
                        }}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                          selected
                            ? "bg-[var(--action-primary)] text-[var(--text-inverse)] border-[var(--action-primary)]"
                            : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]"
                        } ${isOutOfStock ? "opacity-50" : ""}`}
                      >
                        {variant.Description}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
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
              min={activeStock === 0 ? 0 : 1}
              max={activeStock ?? undefined}
              value={count}
              onChange={(e) => handleCountInput(e.target.value)}
              className="w-16 text-center text-lg font-semibold text-[var(--text-primary)] bg-transparent focus:outline-none"
              aria-label="Cantidad a agregar"
            />
            <button
              className="w-11 h-11 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-lg disabled:opacity-40"
              onClick={() => {
                if (activeStock == null) {
                  setCount((c) => c + 1);
                  setStockWarning(null);
                  return;
                }
                if (count < activeStock) {
                  setCount((c) => c + 1);
                  setStockWarning(null);
                }
              }}
              disabled={activeStock !== null && count >= activeStock}
              title={activeStock !== null ? `Disponible: ${activeStock}` : undefined}
            >
              +
            </button>
          </div>
          {stockWarning && (
            <p className="text-xs text-[var(--state-error)] text-center mt-2">
              {stockWarning}
            </p>
          )}

          <div className="mt-8 space-y-3 md:flex md:items-center md:gap-4 md:space-y-0">
            <button
              onClick={handleBuyNow}
              disabled={!canAdd}
              className="w-full rounded-full bg-[var(--action-primary)] text-[var(--text-inverse)] py-3 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingVariants && variants.length === 0 ? "Buscando variantes..." : "Comprar ahora"}
            </button>
            <button
              type="button"
              onClick={handleAddCart}
              disabled={!canAdd}
              className={`w-full rounded-full bg-[var(--action-disabled)] text-[var(--text-primary)] py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                addedPulse ? "scale-[1.02] ring-2 ring-[var(--action-primary)]" : ""
              }`}
            >
              {addedPulse ? "Agregado" : "Agregar al carrito"}
            </button>
          </div>
          </div>
        </div>

      {
        /*
          <div className="bg-green-500 hover:bg-green-600 rounded-full p-2 fixed right-2 bottom-4 shadow-lg transition-all">
          <a
            href={`https://api.whatsapp.com/send?phone=52${telefono || phoneNumber || ""}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={logoWhasa} alt="WhatsApp" className="w-10 h-10" />
          </a>
        </div>
        */
      }
      </div>
    </HelmetProvider>
  );
};
