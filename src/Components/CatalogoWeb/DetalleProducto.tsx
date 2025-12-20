import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

const adjustColor = (hex: string): string => {
  if (!hex || !/^#?[0-9a-fA-F]{6}$/.test(hex)) return "#6D01D1";
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const newR = Math.max(0, r - 100).toString(16).padStart(2, "0");
  const newG = Math.max(0, g - 100).toString(16).padStart(2, "0");
  const newB = Math.max(0, b - 100).toString(16).padStart(2, "0");
  return `#${newR}${newG}${newB}`;
};

export const DetalleProducto: React.FC = () => {
  const { idProducto, telefono } = useParams<Params>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [count, setCount] = useState<number>(1);
  const [limit, setLimit] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const context = useContext(AppContext);
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

  const handleAddCart = () => {
    if (!producto) return;

    if (variants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    addProductToCart({ ...producto, Quantity: count, Variant_Id: null });
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
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
  };

    const DetalleProductoSkeleton: React.FC = () => {
    return (
      <div className="px-6 py-20 min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 animate-pulse">
          {/* Carrusel / imagen principal */}
          <div className="w-full h-72 bg-gray-200 rounded-md" />

          {/* Título */}
          <div className="mt-6 h-8 bg-gray-200 rounded w-3/4" />

          {/* Precio y badge "nuevo" */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <div className="h-7 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>

          {/* Descripción */}
          <div className="mt-6 space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>

          {/* Controles de cantidad */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="w-10 h-6 bg-gray-200 rounded" />
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
          </div>

          {/* Botón "Añadir al carrito" */}
          <div className="mt-10">
            <div className="w-full md:w-3/4 h-11 bg-gray-200 rounded-full mx-auto" />
          </div>
        </div>

        {/* Botón flotante de WhatsApp (placeholder) */}
        <div className="bg-gray-300 rounded-full p-2 fixed right-2 bottom-4 shadow-lg">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
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

      <div className="px-6 py-20 min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Carrusel de imágenes */}
          <ProductCarousel images={images} alt={producto.Name} />

          {/* Título y precios */}
          <h1 className="text-4xl font-bold text-gray-900 mt-6">
            {producto.Name}
          </h1>

          <div className="flex justify-between items-center mb-4 w-full">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-extrabold text-gray-900">
                {currency.format(Number(producto.Price || 0))}
              </div>
              <div className="flex items-center justify-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg text-sm md:text-base lg:text-lg">
                <p>nuevo</p>
              </div>
            </div>

            {producto.PromotionPrice && (
              <span className="line-through text-gray-400 text-sm">
                {currency.format(Number(producto.PromotionPrice))}
              </span>
            )}
          </div>

          {/* Descripción */}
          {producto.Description && (
            <div className="my-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Descripción
              </h2>
              <p className="text-gray-600">{producto.Description}</p>
            </div>
          )}

          {/* Cantidad */}
          <div className={`flex justify-center items-center gap-6 mt-6 ${variants.length > 0 ? "hidden" : "block"}`}>
            <button
              className="bg-gray-200 text-gray-900 w-10 h-10 rounded-full hover:bg-gray-300 transition disabled:opacity-50"
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
              className={`w-20 text-center border border-gray-300 rounded-md text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500`}
              aria-label="Cantidad a agregar"
            />
            <button
              className="bg-gray-200 text-gray-900 w-10 h-10 rounded-full hover:bg-gray-300 transition disabled:opacity-50"
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
            <p className="text-sm text-red-600 text-center mt-2">{stockWarning}</p>
          )}

          {/* Añadir al carrito */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handleAddCart}
              disabled={!canAdd}
              style={{
                backgroundColor: color || "#6D01D1",
                transition:
                  "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = adjustColor(color || "#6D01D1");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = color || "#6D01D1";
              }}
              className="text-white w-full md:w-3/4 py-3 px-6 rounded-full shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingVariants && variants.length === 0
                ? "Buscando variantes..."
                : addButtonLabel}
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

        {/* WhatsApp */}
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
