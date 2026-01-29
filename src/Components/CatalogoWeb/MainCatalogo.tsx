import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  confirmCheckoutPayment,
  getBusinessById,
  getProductsByBusinessWithStock,
  getVariantsByProductIdPublic,
  insertOrder,
} from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";
import defaultImage from "../../assets/ravekh.png";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";
import { Variant } from "./PuntoVenta/Model/Variant";
import { VariantSelectionModal, getBaseVariantKey } from "./VariantSelectionModal";
import { Order } from "./Modelo/Order";
import { OrderDetails } from "./Modelo/OrderDetails";
interface MainCatalogoProps {
  idBusiness?: string;
}

export const MainCatalogo: React.FC<MainCatalogoProps> = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [telefono, setTelefono] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [notPay, setNotPay] = useState<boolean>(false);
  const [notPayMessage, setNotPayMessage] = useState<string | null>(null);
  const [variantProduct, setVariantProduct] = useState<Producto | null>(null);
  const [variantOptions, setVariantOptions] = useState<Variant[]>([]);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Agregado al carrito");
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [pendingStripeOrder, setPendingStripeOrder] = useState<{
    order: Order;
    orderDetails: OrderDetails[];
    storePhoneNumber?: string | null;
    whatsappMessage?: string;
    paid?: boolean;
    saved?: boolean;
  } | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const pendingSaveRef = useRef(false);

  const context = useContext(AppContext);
  const addProductToCart = context.addProductToCart;
  const cartVariantQuantities = useMemo(() => {
    const map: Record<number, number> = {};

    context.cart.forEach((item) => {
      if (item.Quantity == null) return;

      const variantKey =
        item.Variant_Id != null ? item.Variant_Id : getBaseVariantKey(item.Id);

      map[variantKey] = (map[variantKey] ?? 0) + item.Quantity;
    });

    return map;
  }, [context.cart]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const triggerToast = useCallback((message = "Agregado al carrito") => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 1800);
  }, []);

  const ensurePendingOrderSaved = useCallback(async () => {
    if (!pendingStripeOrder || pendingStripeOrder.saved || pendingSaveRef.current) return;
    pendingSaveRef.current = true;
    setPendingLoading(true);
    setPendingError(null);

    try {
      const optimistic = { ...pendingStripeOrder, saved: true };
      localStorage.setItem("pendingStripeOrder", JSON.stringify(optimistic));
      setPendingStripeOrder(optimistic);

      const response = await insertOrder(
        pendingStripeOrder.order,
        pendingStripeOrder.orderDetails
      );
      if (!response || response?.error) {
        throw new Error(response?.message || "No se pudo registrar el pedido.");
      }

      context.clearCart();
      localStorage.removeItem("cart");
      localStorage.removeItem("cartBusinessId");
    } catch (error: any) {
      setPendingError(error?.message || "No se pudo registrar el pedido.");
      const rollback = { ...pendingStripeOrder, saved: false };
      localStorage.setItem("pendingStripeOrder", JSON.stringify(rollback));
      setPendingStripeOrder(rollback);
    } finally {
      setPendingLoading(false);
      pendingSaveRef.current = false;
    }
  }, [pendingStripeOrder]);

  const handlePendingDecision = useCallback(
    (sendWhatsapp: boolean) => {
      if (!pendingStripeOrder) return;

      if (sendWhatsapp) {
        const phone =
          pendingStripeOrder.storePhoneNumber || context.phoneNumber || localStorage.getItem("telefono");
        const message = pendingStripeOrder.whatsappMessage;
        if (phone && message) {
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
        }
      }

      localStorage.removeItem("pendingStripeOrder");
      setPendingStripeOrder(null);
      setShowPendingModal(false);
      if (idBusiness) {
        navigate(`/catalogo/${idBusiness}`, { replace: true });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pendingStripeOrder, context.phoneNumber, idBusiness, navigate]
  );

  // 2) Efecto para inicializar/ocultar elementos y cargar color/teléfono/nombre del localStorage si no están en contexto
  useEffect(() => {
    if (!context.phoneNumber) {
      const storedPhoneNumber = localStorage.getItem("telefono");
      if (storedPhoneNumber) {
        context.setPhoneNumber(storedPhoneNumber);
        setTelefono(storedPhoneNumber);
      }
    }
    if (!context.color) {
      const storedColor = localStorage.getItem("color");
      if (storedColor) {
        context.setColor(storedColor);
        setColor(storedColor);
      }
    }
    if (!context.nombre) {
      const storedNombre = localStorage.getItem("nombre");
      if (storedNombre) {
        context.setNombre(storedNombre);
      }
    }

    // Ajustes de elementos DOM
    const menuIcono = document.getElementById("menuIcono");
    menuIcono?.classList.add("hidden");
    const menuNavegacion = document.getElementById("menuIconoCatalogo");
    menuNavegacion?.classList.remove("hidden");
    const menuImagen = document.getElementById("imgCatalogo");
    menuImagen?.classList.remove("hidden");
    const arrowIcon = document.getElementById("backCatalogo");
    arrowIcon?.classList.add("hidden");
  }, [context]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      triggerToast("Pago completado correctamente.");
    } else if (paymentStatus === "failed") {
      triggerToast("El pago no se completó. Inténtalo de nuevo.");
    }

    params.delete("payment");
    const next = params.toString();
    const cleanUrl = `${window.location.pathname}${next ? `?${next}` : ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, [triggerToast]);

  useEffect(() => {
    if (!idBusiness) return;
    const raw = localStorage.getItem("pendingStripeOrder");
    if (!raw) return;
    try {
      const pending = JSON.parse(raw);
      const businessId = Number(pending?.order?.Business_Id);
      if (!Number.isFinite(businessId) || String(businessId) !== String(idBusiness)) {
        return;
      }

      if (!pending?.paid && pending?.sessionId) {
        confirmCheckoutPayment(pending.sessionId).then((confirmation) => {
          if (confirmation?.paymentIntentId || confirmation?.sessionId) {
            const updated = { ...pending, paid: true, paidAt: Date.now() };
            localStorage.setItem("pendingStripeOrder", JSON.stringify(updated));
            setPendingStripeOrder(updated);
            setShowPendingModal(true);
          }
        });
        return;
      }

      if (pending?.paid) {
        setPendingStripeOrder(pending);
        setShowPendingModal(true);
      }
    } catch (error) {
      console.error("Error leyendo pedido pendiente:", error);
    }
  }, [idBusiness]);

  useEffect(() => {
    if (!showPendingModal || !pendingStripeOrder) return;
    ensurePendingOrderSaved();
  }, [ensurePendingOrderSaved, pendingStripeOrder, showPendingModal]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = context.searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return productos;
    }

    return productos.filter(
      (product) =>
        product.Name.toLowerCase().includes(normalizedQuery) ||
        (product.Barcode && product.Barcode.includes(context.searchQuery))
    );
  }, [context.searchQuery, productos]);

  const priceFilteredProducts = useMemo(() => {
    const min = context.catalogPriceMin;
    const max = context.catalogPriceMax;
    const withRange = filteredProducts.filter((product) => {
      const price =
        product.PromotionPrice && product.PromotionPrice > 0
          ? product.PromotionPrice
          : product.Price;
      if (min != null && price < min) return false;
      if (max != null && price > max) return false;
      return true;
    });

    if (context.filterProduct.orderAsc || context.filterProduct.orderDesc) {
      const sorted = [...withRange].sort((a, b) => {
        const priceA =
          a.PromotionPrice && a.PromotionPrice > 0 ? a.PromotionPrice : a.Price;
        const priceB =
          b.PromotionPrice && b.PromotionPrice > 0 ? b.PromotionPrice : b.Price;
        return priceA - priceB;
      });
      return context.filterProduct.orderDesc ? sorted.reverse() : sorted;
    }

    return withRange;
  }, [
    filteredProducts,
    context.catalogPriceMin,
    context.catalogPriceMax,
    context.filterProduct.orderAsc,
    context.filterProduct.orderDesc,
  ]);

  const sanitizedProducts = useMemo(
    () =>
      priceFilteredProducts.filter((producto) =>
        Boolean(producto.Image || (producto.Images && producto.Images[0]))
      ),
    [priceFilteredProducts]
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }),
    []
  );

  const formatPrice = useCallback(
    (value: number) => currencyFormatter.format(value),
    [currencyFormatter]
  );

  const openVariantModal = useCallback((product: Producto, variants: Variant[]) => {
    setVariantProduct(product);
    setVariantOptions(variants);
    setVariantModalOpen(true);
  }, []);

  const fetchVariantsForProduct = useCallback(async (product: Producto) => {
    setVariantLoading(true);
    const fetchedVariants = await getVariantsByProductIdPublic(product.Id);
    setVariantLoading(false);
    return fetchedVariants;
  }, []);

  const handleAddToCart = useCallback(
    async (product: Producto) => {
      const inlineVariants = Array.isArray(product.Variants)
        ? (product.Variants.filter(Boolean) as Variant[])
        : [];

      if (inlineVariants.length > 0) {
        openVariantModal(product, inlineVariants);
        return;
      }

      const fetchedVariants = await fetchVariantsForProduct(product);

      if (fetchedVariants.length > 0) {
        openVariantModal(product, fetchedVariants);
        return;
      }

      addProductToCart({ ...product, Variant_Id: null });
      triggerToast();
    },
    [addProductToCart, fetchVariantsForProduct, openVariantModal, triggerToast]
  );

  const handleConfirmVariant = useCallback(
    (selections: { variant: Variant; quantity: number }[]) => {
      if (!variantProduct) return;

      selections.forEach(({ variant, quantity }) => {
        const basePrice = variant.PromotionPrice ?? variant.Price ?? variantProduct.Price;

        addProductToCart({
          ...variantProduct,
          Price: basePrice ?? 0,
          PromotionPrice: variant.PromotionPrice ?? variantProduct.PromotionPrice,
          Variant_Id: variant.Id ?? null,
          VariantDescription: variant.Description,
          Stock: variant.Stock ?? variantProduct.Stock,
          Quantity: quantity,
        });
      });

      setVariantModalOpen(false);
      setVariantProduct(null);
      setVariantOptions([]);
      if (selections.length > 0) {
        triggerToast();
      }
    },
    [addProductToCart, triggerToast, variantProduct]
  );

  const handleCloseVariantModal = useCallback(() => {
    setVariantModalOpen(false);
    setVariantProduct(null);
    setVariantOptions([]);
  }, []);

  const handleQuickView = useCallback(
    async (product: Producto) => {
      const inlineVariants = Array.isArray(product.Variants)
        ? (product.Variants.filter(Boolean) as Variant[])
        : [];

      if (inlineVariants.length > 0) {
        openVariantModal(product, inlineVariants);
        return;
      }

      const fetchedVariants = await fetchVariantsForProduct(product);
      if (fetchedVariants.length > 0) {
        openVariantModal(product, fetchedVariants);
      }
    },
    [fetchVariantsForProduct, openVariantModal]
  );

  const handleRemoveFromCart = useCallback(
    (product: Producto) => {
      context.removeProductFromCart(String(product.Id), null);
    },
    [context]
  );

  const handleDecrementFromCart = useCallback(
    (product: Producto) => {
      const updatedCart = context.cart.reduce((acc, item) => {
        if (item.Id === product.Id && (item.Variant_Id ?? null) === null) {
          const current = item.Quantity ?? 1;
          const next = Math.max(current - 1, 0);
          if (next <= 0) return acc;
          const unitPrice = item.Price ?? 0;
          acc.push({
            ...item,
            Quantity: next,
            SubTotal: Number((unitPrice * next).toFixed(2)),
          });
          return acc;
        }
        acc.push(item);
        return acc;
      }, [] as typeof context.cart);

      context.setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      if (context.idBussiness) {
        localStorage.setItem("cartBusinessId", String(context.idBussiness));
      }
    },
    [context]
  );

  if (notPay) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-primary)]">
        <h1 className="text-2xl font-bold text-[var(--state-error)]">
          {notPayMessage}
        </h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          Por favor, contacta a tu proveedor para más información.
        </p>
      </div>
    );
  }

  const fetchProductsPage = useCallback(
    async (pageToFetch: number, mode: "reset" | "append") => {
      if (!idBusiness) return;
      if (mode === "append" && (loadingMore || !hasNext)) return;

      try {
        if (mode === "reset") setLoadingProducts(true);
        else setLoadingMore(true);

        const resp = await getProductsByBusinessWithStock(
          idBusiness,
          plan || "",
          pageToFetch
        );

        const newProducts: Producto[] = Array.isArray(resp?.data) ? resp.data : [];
        const pagination = resp?.pagination;

        setHasNext(Boolean(pagination?.hasNext));

        setProductos((prev) => {
          if (mode === "reset") return newProducts;
          const map = new Map<number, Producto>();
          prev.forEach((p) => map.set(p.Id, p));
          newProducts.forEach((p) => map.set(p.Id, p));
          return Array.from(map.values());
        });

        setPage(pageToFetch);

        if (newProducts.length > 0) {
          const phone = (newProducts[0] as any).PhoneNumber;
          if (phone) {
            setTelefono(phone);
            context.setPhoneNumber(phone);
            localStorage.setItem("telefono", phone);
          }
        }
      } catch (e) {
        console.error("Error paginando productos:", e);
        if (mode === "reset") setProductos([]);
        setHasNext(false);
      } finally {
        if (mode === "reset") setLoadingProducts(false);
        else setLoadingMore(false);
      }
    },
    [idBusiness, plan, loadingMore, hasNext, context]
  );

  useEffect(() => {
    (async () => {
      try {
        if (idBusiness === "26") {
          window.location.href = "https://mrcongelados.com/";
          return;
        }

        if (idBusiness == "92") {
          setNotPay(true);
          setNotPayMessage("No tienes acceso a este catálogo por falta de pago.");
          return;
        }

        setLoadingProducts(true);

        if (idBusiness) {
          context.setIdBussiness(idBusiness);
          localStorage.setItem("idBusiness", idBusiness);
        }
        const storedCartRaw = localStorage.getItem("cart");
        const storedCart: Producto[] = storedCartRaw ? JSON.parse(storedCartRaw) : [];
        const storedCartBusinessId = localStorage.getItem("cartBusinessId");
        const isDifferentBusiness =
          (storedCartBusinessId && storedCartBusinessId !== idBusiness) ||
          storedCart.some((item) => item?.Business_Id?.toString() !== idBusiness);
        if (isDifferentBusiness) {
          localStorage.removeItem("cart");
          localStorage.removeItem("cartBusinessId");
          context.clearCart();
        } else if (storedCart.length > 0 && idBusiness && !storedCartBusinessId) {
          localStorage.setItem("cartBusinessId", idBusiness);
        }

        // 1) negocio
        const dataBusiness = await getBusinessById(idBusiness || "0");
        if (dataBusiness) {
          setColor(dataBusiness.Color || null);
          context.setColor(dataBusiness.Color || null);
          localStorage.setItem("color", dataBusiness.Color || "");

          context.setNombre(dataBusiness.Name || null);
          localStorage.setItem("nombre", dataBusiness.Name || "");

          setPlan(dataBusiness.Plan);

          context.setPhoneNumber(dataBusiness.PhoneNumber || null);
          localStorage.setItem("telefono", dataBusiness.PhoneNumber || "");
        }

        // 2) reset pagination + fetch page 1
        setProductos([]);
        setPage(1);
        setHasNext(true);

        // importante: como setPlan es async, usa el plan directo del negocio aquí:
        const resp = await getProductsByBusinessWithStock(
          idBusiness || "1",
          dataBusiness?.Plan || "",
          1
        );
        const firstPageProducts: Producto[] = Array.isArray(resp?.data) ? resp.data : [];
        setProductos(firstPageProducts);
        setHasNext(Boolean(resp?.pagination?.hasNext));
        setPage(1);

        if (firstPageProducts.length > 0) {
          const phone = (firstPageProducts[0] as any).PhoneNumber;
          if (phone) {
            setTelefono(phone);
            context.setPhoneNumber(phone);
            localStorage.setItem("telefono", phone);
          }
        }
      } catch (error) {
        console.error("Error cargando catálogo:", error);
        setProductos([]);
        setHasNext(false);
      } finally {
        setLoadingProducts(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBusiness]);

  const loadNextPage = useCallback(() => {
    if (!hasNext || loadingMore || loadingProducts) return;
    const next = page + 1;
    void fetchProductsPage(next, "append");
  }, [hasNext, loadingMore, loadingProducts, page, fetchProductsPage]);

  useEffect(() => {
    if (!hasNext) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNext, loadNextPage]);


  const shareName =
    context.nombre || localStorage.getItem("nombre") || "Catálogo de Productos";

  // 6) Render
  return (
    <HelmetProvider>
      <>
        <Helmet>
          <meta name="theme-color" content={color || "#6D01D1"} />
          <title>{shareName}</title>
          <meta
            name="description"
            content="Explora nuestro catálogo de productos y encuentra todo lo que necesitas a precios increíbles. ¡Compra ahora!"
          />
          <meta property="og:type" content="website" />
          <meta
            name="theme-color"
            content={context.idBussiness === '115' ? "#000000" : color || "#6D01D1"}
          />
          <title>{shareName}</title>
          <meta
            property="og:title"
            content={shareName}
          />
          <meta
            property="og:description"
            content="Explora nuestro catálogo de productos y encuentra todo lo que necesitas a precios increíbles. ¡Compra ahora!"
          />
          <meta
            property="og:image"
            content={
              productos.length > 0 && (productos[0].Image || productos[0].Images?.[0])
                ? productos[0].Image || productos[0].Images?.[0]
                : defaultImage
            }
          />
          <meta property="og:url" content={window.location.href} />
        </Helmet>

        <div className="px-4 pt-52 pb-12 min-h-screen w-full max-w-screen-xl mx-auto bg-[var(--bg-primary)]">
          <div
            className={`pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 transition-opacity duration-200 ${
              showToast ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white shadow-sm">
              {toastMessage}
            </div>
          </div>
          {loadingProducts ? (
            // 👇 Skeleton mientras cargan los productos
            <ProductGridSkeleton items={10} />
          ) :productos.length === 0 ? (
            <div className="text-center mt-10">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                No hay productos disponibles
              </h2>
              <p className="text-[var(--text-secondary)] mt-2">
                Por favor, vuelve a intentarlo más tarde o explora otras categorías.
              </p>
            </div>
          ) : (
            <ProductGrid
              products={sanitizedProducts}
              telefono={telefono}
              onAdd={handleAddToCart}
              formatPrice={formatPrice}
              existingQuantities={cartVariantQuantities}
              onQuickView={handleQuickView}
              onRemove={handleRemoveFromCart}
              onDecrement={handleDecrementFromCart}
            />
          )}

          {hasNext && (
            <div ref={loadMoreRef} className="h-10"></div>
          )}

          {loadingMore && (
            <div className="text-center py-4 text-[var(--text-secondary)]">
              Cargando más productos...
            </div>
          )}

          {/* Botón de WhatsApp */}
          {
            /*
  
          <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
            <a href={`https://api.whatsapp.com/send?phone=${idBusiness === "115"
              ?"1"
              :"52"}${telefono}`}>
              <img src={logoWhasa} alt="WS" className="h-12 w-12" />
            </a>
          </div>

         */
          }

          {/* Modal de selección de variantes */}
          {showPendingModal && pendingStripeOrder && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
              <div className="bg-[var(--bg-surface)] rounded-t-[var(--radius-lg)] p-6 w-full border border-[var(--border-default)]">
                <h2 className="text-lg font-semibold mb-2 text-center text-[var(--text-primary)]">
                  Pedido pagado
                </h2>
                <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">
                  ¿Gustas mandar un mensaje por WhatsApp al comprar tu orden?
                </p>
                {pendingError && (
                  <p className="mb-4 text-center text-sm text-[var(--state-error)]">
                    {pendingError}
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handlePendingDecision(false)}
                    disabled={pendingLoading}
                    className="bg-[var(--action-disabled)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    {pendingLoading ? "Guardando..." : "Cerrar"}
                  </button>
                  <button
                    onClick={() => handlePendingDecision(true)}
                    disabled={pendingLoading}
                    className="bg-[var(--action-primary)] text-white py-2 px-6 rounded-full shadow-sm"
                  >
                    {pendingLoading ? "Enviando..." : "Sí, enviar"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <VariantSelectionModal
            product={variantProduct}
            variants={variantOptions}
            isOpen={variantModalOpen}
            onClose={handleCloseVariantModal}
            onConfirm={handleConfirmVariant}
            existingVariantQuantities={cartVariantQuantities}
            storeColor={color}
          />
        </div>
      </>
    </HelmetProvider>
  );
};
