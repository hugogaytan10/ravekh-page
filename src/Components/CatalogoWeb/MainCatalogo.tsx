import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  getBusinessById,
  getProductsByBusinessWithStock,
  getVariantsByProductIdPublic,
} from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";
import defaultImage from "../../assets/ravekh.png";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";
import { Variant } from "./PuntoVenta/Model/Variant";
import { VariantSelectionModal, getBaseVariantKey } from "./VariantSelectionModal";
interface MainCatalogoProps {
  idBusiness?: string;
}

export const MainCatalogo: React.FC<MainCatalogoProps> = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
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

  const sanitizedProducts = useMemo(
    () =>
      filteredProducts.filter((producto) =>
        Boolean(producto.Image || (producto.Images && producto.Images[0]))
      ),
    [filteredProducts]
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
    },
    [addProductToCart, fetchVariantsForProduct, openVariantModal]
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
    },
    [addProductToCart, variantProduct]
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


  // 6) Render
  return (
    <HelmetProvider>
      <>
        <Helmet>
          <meta name="theme-color" content={color || "#6D01D1"} />
          <title>{context.nombre || "Catálogo de Productos"}</title>
          <meta
            name="description"
            content="Explora nuestro catálogo de productos y encuentra todo lo que necesitas a precios increíbles. ¡Compra ahora!"
          />
          <meta property="og:type" content="website" />
          <meta
            name="theme-color"
            content={context.idBussiness === '115' ? "#000000" : color || "#6D01D1"}
          />
          <title>{context.nombre || "Catálogo de Productos"}</title>
          <meta
            property="og:title"
            content={context.nombre || "Catálogo de Productos"}
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

        <div className="px-4 pt-44 pb-12 min-h-screen w-full max-w-screen-xl mx-auto bg-[var(--bg-primary)]">
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
          <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
            <a href={`https://api.whatsapp.com/send?phone=${idBusiness === "115"
              ?"1"
              :"52"}${telefono}`}>
              <img src={logoWhasa} alt="WS" className="h-12 w-12" />
            </a>
          </div>

         
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
