import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import {
  CatalogStorefrontApi,
  StorefrontProductExtra,
  StorefrontVariant,
} from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import {
  StorefrontCartItem,
  StorefrontProduct,
} from "../model/CatalogStorefrontModels";
import { CatalogSocialFooter } from "./CatalogSocialFooter";
import {
  formatCatalogPrice,
  getCatalogPriceValue,
  getEffectiveCatalogPrice,
  getEffectiveCatalogPriceForQuantity,
} from "./catalogPrice";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);

const normalizeOptionText = (value?: string | null) =>
  value?.trim().toLowerCase() ?? "";

const variantMatchesColor = (
  variant: StorefrontVariant,
  color: StorefrontProductExtra | null,
) => {
  const variantColor = normalizeOptionText(variant.color);
  if (!variantColor) return true;
  if (!color) return false;
  return variantColor === normalizeOptionText(color.description);
};

export const CatalogProductDetailPage = () => {
  useCatalogThemeSync();
  const navigate = useNavigate();
  const { productId = "", phone = "" } = useParams<{
    productId: string;
    phone: string;
  }>();
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [variants, setVariants] = useState<StorefrontVariant[]>([]);
  const [colors, setColors] = useState<StorefrontProductExtra[]>([]);
  const [sizes, setSizes] = useState<StorefrontProductExtra[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<
    number | "base" | null
  >(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = useState("");
  const [zoomLevel, setZoomLevel] = useState(2);
  const [magnifierPosition, setMagnifierPosition] = useState({
    xPercent: 50,
    yPercent: 50,
  });
  const [showMagnifier, setShowMagnifier] = useState(false);

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
          window.localStorage.setItem(
            "idBusiness",
            String(response.businessId),
          );
          window.localStorage.setItem("telefono", phone);
          void pageLogic.registerVisit(String(response.businessId), "always");
          const [variantResponse, extrasResponse] = await Promise.all([
            pageLogic.loadVariants(response.id),
            pageLogic.loadExtras(response.id),
          ]);
          setVariants(variantResponse);
          setColors(extrasResponse.colors);
          setSizes(extrasResponse.sizes);
        } else {
          setVariants([]);
          setColors([]);
          setSizes([]);
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
    setSelectedColorId(null);
    setSelectedSizeId(null);
    setQuantity(1);
    setDetailError(null);
  }, [productId]);

  const openPreview = useCallback((src: string | null, alt: string) => {
    if (!src) return;

    setPreviewSrc(src);
    setPreviewAlt(alt);
    setZoomLevel(2);
    setMagnifierPosition({ xPercent: 50, yPercent: 50 });
    setShowMagnifier(false);
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setShowMagnifier(false);

    setTimeout(() => {
      setPreviewSrc(null);
      setPreviewAlt("");
    }, 120);
  }, []);

  useEffect(() => {
    if (!previewOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen, closePreview]);

  const handleMagnifierMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clamp = (value: number) => Math.min(100, Math.max(0, value));

    setMagnifierPosition({
      xPercent: clamp(x),
      yPercent: clamp(y),
    });
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.2 : 0.2;

    setZoomLevel((current) =>
      Math.min(5, Math.max(1.5, Number((current + delta).toFixed(1)))),
    );
  };

  const resetZoom = () => {
    setZoomLevel(2);
    setMagnifierPosition({ xPercent: 50, yPercent: 50 });
  };

  const buildCartWithSelection = () => {
    if (!product) return;
    const isBaseSelected = selectedVariantId === "base";
    const selectedVariant =
      variants.find((variant) => variant.id === selectedVariantId) ?? null;
    const selectedColor =
      colors.find((color) => color.id === selectedColorId) ?? null;
    const selectedSize =
      sizes.find((size) => size.id === selectedSizeId) ?? null;
    if (variants.length > 0 && !selectedVariant && !isBaseSelected) {
      return null;
    }
    const hasAnyOption =
      variants.length > 0 || colors.length > 0 || sizes.length > 0;
    if (
      hasAnyOption &&
      !isBaseSelected &&
      !selectedVariant &&
      !selectedColor &&
      !selectedSize
    ) {
      return null;
    }

    const cartKey = [
      product.id,
      selectedVariant?.id ?? "base",
      selectedColor?.id ?? "nc",
      selectedSize?.id ?? "ns",
    ].join("-");
    const productLabel = [
      selectedVariant
        ? `${product.name} · ${selectedVariant.description}`
        : product.name,
      selectedColor?.description ? `Color: ${selectedColor.description}` : "",
      selectedSize?.description ? `Talla: ${selectedSize.description}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const priceToStore = selectedVariant
      ? getEffectiveCatalogPrice(
          selectedVariant.price,
          selectedVariant.promotionPrice,
        )
      : getEffectiveCatalogPrice(product.price, product.promotionPrice);
    const wholesalePriceToStore = selectedVariant
      ? selectedVariant.wholesalePrice
      : product.wholesalePrice;
    const wholesaleMinQuantityToStore = selectedVariant
      ? selectedVariant.wholesaleMinQuantity
      : product.wholesaleMinQuantity;
    const costToStore = selectedVariant?.costPerItem ?? undefined;

    const key = `catalog-v2-cart:${product.businessId}`;
    const raw = window.localStorage.getItem(key);
    const current = raw ? (JSON.parse(raw) as StorefrontCartItem[]) : [];
    const existing = current.find(
      (item) => (item.cartKey ?? String(item.productId)) === cartKey,
    );
    const updated = existing
      ? current.map((item) =>
          (item.cartKey ?? String(item.productId)) === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [
          ...current,
          {
            cartKey,
            productId: product.id,
            variantId: selectedVariant?.id,
            colorId: selectedColor?.id,
            sizeId: selectedSize?.id,
            colorName: selectedColor?.description,
            sizeName: selectedSize?.description,
            name: productLabel,
            price: priceToStore,
            wholesalePrice: wholesalePriceToStore,
            wholesaleMinQuantity: wholesaleMinQuantityToStore,
            cost: costToStore,
            quantity,
            image: selectedVariant?.image || product.image,
          },
        ];

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

    navigate(`/v2/catalogo/${product!.businessId}`);
  };

  const buyNow = () => {
    setDetailError(null);
    const ok = buildCartWithSelection();
    if (!ok) {
      setDetailError("Selecciona una opción antes de continuar.");
      return;
    }
    navigate("/catalogo/pedido");
  };

  if (loading)
    return (
      <main className="mx-auto grid max-w-5xl gap-4 p-4">
        <p className="text-[var(--text-secondary)]">Cargando producto...</p>
      </main>
    );
  if (!product)
    return (
      <main className="mx-auto grid max-w-5xl gap-4 p-4">
        <p className="text-[var(--text-secondary)]">
          No encontramos este producto.
        </p>
      </main>
    );
  const images = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  );
  const isBaseSelected = selectedVariantId === "base";
  const selectedColor =
    colors.find((color) => color.id === selectedColorId) ?? null;
  const visibleVariants = variants.filter((variant) =>
    variantMatchesColor(variant, selectedColor),
  );
  const selectedVariant =
    visibleVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const selectedVariantImage = selectedVariant?.image?.trim() || "";
  const displayImages = selectedVariantImage ? [selectedVariantImage] : images;
  const currentImage =
    displayImages[activeImage] ?? displayImages[0] ?? product.image;
  const selectedWholesalePrice = selectedVariant
    ? selectedVariant.wholesalePrice
    : product.wholesalePrice;
  const selectedWholesaleMinQuantity = selectedVariant
    ? selectedVariant.wholesaleMinQuantity
    : product.wholesaleMinQuantity;
  const effectivePrice = selectedVariant
    ? getEffectiveCatalogPriceForQuantity(
        selectedVariant.price,
        selectedVariant.promotionPrice,
        selectedVariant.wholesalePrice,
        selectedVariant.wholesaleMinQuantity,
        quantity,
      )
    : getEffectiveCatalogPriceForQuantity(
        product.price,
        product.promotionPrice,
        product.wholesalePrice,
        product.wholesaleMinQuantity,
        quantity,
      );
  const baseDisplayPrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const selectedWholesalePriceValue = getCatalogPriceValue(
    selectedWholesalePrice,
  );
  const selectedWholesaleMinQuantityValue = Number(
    selectedWholesaleMinQuantity,
  );
  const hasWholesaleOffer =
    selectedWholesalePriceValue !== null &&
    Number.isFinite(selectedWholesaleMinQuantityValue) &&
    selectedWholesaleMinQuantityValue > 0;
  const isWholesaleActive =
    hasWholesaleOffer && quantity >= selectedWholesaleMinQuantityValue;
  const remainingWholesalePieces = hasWholesaleOffer
    ? Math.max(0, selectedWholesaleMinQuantityValue - quantity)
    : 0;
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
              <button
                type="button"
                onClick={() =>
                  openPreview(currentImage, product.name ?? "Producto")
                }
                className="group relative block w-full overflow-hidden rounded-xl"
                aria-label="Ver imagen del producto en grande"
              >
                <img
                  className="h-[300px] w-full rounded-xl bg-[var(--bg-subtle)] object-cover transition-transform duration-200 group-hover:scale-[1.01] md:h-[390px]"
                  src={currentImage}
                  alt={product.name}
                />
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  Ver más
                </span>
              </button>
              {displayImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                    onClick={() =>
                      setActiveImage(
                        (prev) =>
                          (prev - 1 + displayImages.length) %
                          displayImages.length,
                      )
                    }
                    aria-label="Imagen anterior"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                    onClick={() =>
                      setActiveImage(
                        (prev) => (prev + 1) % displayImages.length,
                      )
                    }
                    aria-label="Imagen siguiente"
                  >
                    <FiChevronRight />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {displayImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={
                          index === activeImage
                            ? "h-2 w-5 rounded-full bg-white"
                            : "h-2 w-2 rounded-full bg-white/65"
                        }
                        onClick={() => setActiveImage(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() =>
                openPreview(currentImage, product.name ?? "Producto")
              }
              className="w-fit rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--bg-surface)]"
            >
              Ver más
            </button>
            {displayImages.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-lg border ${index === activeImage ? "border-[var(--text-primary)]" : "border-[var(--border-default)]"}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-14 w-14 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid h-[300px] place-items-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-muted)] md:h-[390px]">
            Sin imagen
          </div>
        )}
        <article className="grid content-start gap-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">
              {product.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {product.description || "Sin descripción."}
            </p>
          </header>
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {isWholesaleActive ? "Precio mayoreo" : "Precio menudeo"}
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <strong className="text-3xl font-extrabold text-[var(--text-primary)]">
                    {formatCatalogPrice(effectivePrice, money)}
                  </strong>
                  {getCatalogPriceValue(baseDisplayPrice) &&
                  effectivePrice !== getCatalogPriceValue(baseDisplayPrice) ? (
                    <small className="text-sm font-semibold text-[var(--text-muted)] line-through">
                      {formatCatalogPrice(baseDisplayPrice, money)}
                    </small>
                  ) : null}
                </div>
              </div>
            </div>

            {hasWholesaleOffer ? (
              <div className="relative mt-3 grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-[var(--text-secondary)]">
                    {isWholesaleActive
                      ? `Ya tienes el mejor precio`
                      : `Agrega ${remainingWholesalePieces} ${remainingWholesalePieces === 1 ? "pieza" : "piezas"} más para activar el precio de mayoreo.`}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 text-[var(--text-primary)] shadow-sm">
                    {formatCatalogPrice(selectedWholesalePrice, money)} / pza.
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          {variants.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Variantes
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  key="base"
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    isBaseSelected
                      ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                  }`}
                  onClick={() => {
                    setSelectedVariantId("base");
                    setActiveImage(0);
                  }}
                >
                  {product.name}
                </button>
                {visibleVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      selectedVariantId === variant.id
                        ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    }`}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setActiveImage(0);
                    }}
                  >
                    {variant.description}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {colors.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      selectedColorId === color.id
                        ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    }`}
                    onClick={() => {
                      setSelectedColorId((current) =>
                        current === color.id ? null : color.id,
                      );
                      setSelectedVariantId((current) => {
                        if (!current || current === "base") return current;
                        const currentVariant =
                          variants.find((variant) => variant.id === current) ??
                          null;
                        return currentVariant &&
                          variantMatchesColor(currentVariant, color)
                          ? current
                          : null;
                      });
                    }}
                  >
                    {color.description}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {sizes.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Talla
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      selectedSizeId === size.id
                        ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    }`}
                    onClick={() =>
                      setSelectedSizeId((current) =>
                        current === size.id ? null : size.id,
                      )
                    }
                  >
                    {size.description}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-2">
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-lg text-[var(--text-primary)]"
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              −
            </button>
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
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-lg text-[var(--text-primary)]"
              type="button"
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </button>
          </div>
          {detailError ? (
            <p className="text-sm font-medium text-red-500">{detailError}</p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="min-h-11 rounded-xl bg-[var(--text-primary)] px-4 text-sm font-bold text-[var(--text-inverse)]"
              type="button"
              onClick={addToCart}
            >
              Agregar al carrito
            </button>
            <button
              className="min-h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 text-sm font-bold text-[var(--text-primary)]"
              type="button"
              onClick={buyNow}
            >
              Comprar ahora
            </button>
          </div>
        </article>
      </section>

      {previewOpen && previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-5xl">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={closePreview}
                className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-sm shadow hover:bg-white"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="relative max-h-[80vh] w-full overflow-hidden rounded-2xl bg-zinc-900 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/30 px-3 py-2 text-white">
                <p className="text-xs text-zinc-200">
                  Pasa el mouse sobre la imagen y usa la rueda para controlar el
                  zoom.
                </p>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((current) =>
                        Math.max(1.5, Number((current - 0.2).toFixed(1))),
                      )
                    }
                    className="rounded-lg bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-600"
                  >
                    -
                  </button>

                  <label className="text-xs text-zinc-200">Zoom</label>

                  <input
                    type="range"
                    min={1.5}
                    max={5}
                    step={0.1}
                    value={zoomLevel}
                    onChange={(event) =>
                      setZoomLevel(Number(event.target.value))
                    }
                    className="accent-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((current) =>
                        Math.min(5, Number((current + 0.2).toFixed(1))),
                      )
                    }
                    className="rounded-lg bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-600"
                  >
                    +
                  </button>

                  <span className="w-10 text-right text-xs">
                    {zoomLevel.toFixed(1)}x
                  </span>

                  <button
                    type="button"
                    onClick={resetZoom}
                    className="rounded-lg bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-600"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div
                className="relative flex h-[68vh] items-center justify-center overflow-hidden rounded-xl"
                onMouseMove={handleMagnifierMove}
                onMouseEnter={() => setShowMagnifier(true)}
                onMouseLeave={() => setShowMagnifier(false)}
                onWheel={handleWheelZoom}
              >
                <img
                  src={previewSrc}
                  alt={previewAlt}
                  className="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl"
                  draggable={false}
                />

                {showMagnifier && (
                  <div
                    className="pointer-events-none absolute hidden h-56 w-56 rounded-full border-2 border-white/80 shadow-2xl md:block"
                    style={{
                      top: `calc(${magnifierPosition.yPercent}% - 112px)`,
                      left: `calc(${magnifierPosition.xPercent}% - 112px)`,
                      backgroundImage: `url(${previewSrc})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${zoomLevel * 100}%`,
                      backgroundPosition: `${magnifierPosition.xPercent}% ${magnifierPosition.yPercent}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
