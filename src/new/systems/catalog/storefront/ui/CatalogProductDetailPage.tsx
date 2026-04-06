import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi, StorefrontVariant } from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import { StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export const CatalogProductDetailPage = () => {
  useCatalogThemeSync();
  const navigate = useNavigate();
  const { productId = "", phone = "" } = useParams<{ productId: string; phone: string }>();
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [variants, setVariants] = useState<StorefrontVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | "base" | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pageLogic = useMemo(() => {
    const repository = new CatalogStorefrontApi(getPosApiBaseUrl());
    const service = new CatalogStorefrontService(repository);
    return new CatalogStorefrontExperiencePage(service);
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const response = await pageLogic.loadProductDetail(productId);
        setProduct(response);
        if (response) {
          window.localStorage.setItem("idBusiness", String(response.businessId));
          window.localStorage.setItem("telefono", phone);
          const variantResponse = await pageLogic.loadVariants(response.id);
          setVariants(variantResponse);
        } else {
          setVariants([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) void run();
  }, [pageLogic, phone, productId]);

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariantId(null);
    setQuantity(1);
    setDetailError(null);
  }, [productId]);

  const buildCartWithSelection = () => {
    if (!product) return;
    const isBaseSelected = selectedVariantId === "base";
    const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
    if (variants.length > 0 && !selectedVariant && !isBaseSelected) {
      return null;
    }

    const productIdToStore = selectedVariant ? Number(`${product.id}${selectedVariant.id}`) : product.id;
    const productLabel = selectedVariant ? `${product.name} · ${selectedVariant.description}` : product.name;
    const priceToStore = selectedVariant
      ? (selectedVariant.promotionPrice && selectedVariant.promotionPrice > 0 ? selectedVariant.promotionPrice : selectedVariant.price)
      : (product.promotionPrice && product.promotionPrice > 0 ? product.promotionPrice : product.price);

    const key = `catalog-v2-cart:${product.businessId}`;
    const raw = window.localStorage.getItem(key);
    const current = raw ? (JSON.parse(raw) as StorefrontCartItem[]) : [];
    const existing = current.find((item) => item.productId === productIdToStore);
    const updated = existing
      ? current.map((item) => (item.productId === productIdToStore ? { ...item, quantity: item.quantity + quantity } : item))
      : [...current, { productId: productIdToStore, variantId: selectedVariant?.id, name: productLabel, price: priceToStore, quantity, image: product.image }];

    window.localStorage.setItem(key, JSON.stringify(updated));
    return true;
  };

  const addToCart = () => {
    setDetailError(null);
    const ok = buildCartWithSelection();
    if (!ok) {
      setDetailError("Selecciona una opción antes de agregar al carrito.");
      return;
    }

    navigate(`/v2/catalogo/${product.businessId}`);
  };

  const buyNow = () => {
    setDetailError(null);
    const ok = buildCartWithSelection();
    if (!ok) {
      setDetailError("Selecciona una opción antes de continuar.");
      return;
    }
    navigate("/v2/catalogo/pedido");
  };

  if (loading) return <main className="mx-auto grid max-w-5xl gap-4 p-4"><p className="text-[var(--text-secondary)]">Cargando producto...</p></main>;
  if (!product) return <main className="mx-auto grid max-w-5xl gap-4 p-4"><p className="text-[var(--text-secondary)]">No encontramos este producto.</p></main>;
  const images = Array.from(new Set([product.image, ...(product.images ?? [])].filter(Boolean)));
  const currentImage = images[activeImage] ?? product.image;
  const isBaseSelected = selectedVariantId === "base";
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant
    ? (selectedVariant.promotionPrice && selectedVariant.promotionPrice > 0 ? selectedVariant.promotionPrice : selectedVariant.price)
    : (product.promotionPrice && product.promotionPrice > 0 ? product.promotionPrice : product.price);

  return (
    <main className="mx-auto grid max-w-5xl gap-4 p-4">
      <button
        type="button"
        className="w-fit rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)]"
        onClick={() => navigate(`/v2/catalogo/${product.businessId}`)}
      >
        ← Volver al catálogo
      </button>

      <section className="grid gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 md:grid-cols-[minmax(280px,420px)_1fr]">
        {currentImage ? (
          <div className="grid gap-2">
            <div className="relative">
              <img
                className="h-[300px] w-full rounded-xl bg-[var(--bg-subtle)] object-cover md:h-[390px]"
                src={currentImage}
                alt={product.name}
              />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                  onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                  aria-label="Imagen anterior"
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  aria-label="Imagen siguiente"
                >
                  <FiChevronRight />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === activeImage ? "h-2 w-5 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white/65"}
                      onClick={() => setActiveImage(index)}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-lg border ${index === activeImage ? "border-[var(--text-primary)]" : "border-[var(--border-default)]"}`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-14 w-14 object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : <div className="grid h-[300px] place-items-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-muted)] md:h-[390px]">Sin imagen</div>}
        <article className="grid content-start gap-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">{product.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{product.description || "Sin descripción."}</p>
          </header>
          <div className="flex items-center gap-2">
            {product.promotionPrice && product.promotionPrice > 0 && !selectedVariant ? (
              <>
                <strong className="text-2xl font-extrabold text-[var(--text-primary)]">{money(product.promotionPrice)}</strong>
                <small className="text-sm text-[var(--text-muted)] line-through">{money(product.price)}</small>
              </>
            ) : (
              <strong className="text-2xl font-extrabold text-[var(--text-primary)]">{money(effectivePrice)}</strong>
            )}
          </div>
          {variants.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Variantes</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  key="base"
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${isBaseSelected
                    ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    }`}
                  onClick={() => setSelectedVariantId("base")}
                >
                  {product.name}
                </button>
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedVariantId === variant.id
                      ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                      }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.description}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-2">
            <button className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-lg text-[var(--text-primary)]" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(event) => {
                let parsed = Math.floor(Number(event.target.value));
                if (Number.isNaN(parsed)) parsed = 1;
                setQuantity(Math.max(1, Math.min(999, parsed)));
              }}
              className="h-9 w-16 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-center text-base font-bold text-[var(--text-primary)]"
              aria-label="Cantidad del producto"
            />
            <button className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-lg text-[var(--text-primary)]" type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
          </div>
          {detailError ? <p className="text-sm font-medium text-red-500">{detailError}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <button className="min-h-11 rounded-xl bg-[var(--text-primary)] px-4 text-sm font-bold text-[var(--text-inverse)]" type="button" onClick={addToCart}>Agregar al carrito</button>
            <button className="min-h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 text-sm font-bold text-[var(--text-primary)]" type="button" onClick={buyNow}>Comprar ahora</button>
          </div>
        </article>
      </section>
    </main>
  );
};
