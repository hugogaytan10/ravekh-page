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
import { ProductGrid } from "./ProductGrid";
import { Variant } from "./PuntoVenta/Model/Variant";
import { VariantSelectionModal } from "./VariantSelectionModal";

interface MainCatalogoProps {
  idBusiness?: string;
}

export const MainCatalogo: React.FC<MainCatalogoProps> = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(10); // Mostrar 10 inicialmente
  const [telefono, setTelefono] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [notPay, setNotPay] = useState<boolean>(false);
  const [notPayMessage, setNotPayMessage] = useState<string | null>(null);
  const [variantProduct, setVariantProduct] = useState<Producto | null>(null);
  const [variantOptions, setVariantOptions] = useState<Variant[]>([]);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);

  const context = useContext(AppContext);
  const addProductToCart = context.addProductToCart;
  const cartVariantQuantities = useMemo(() => {
    const map: Record<number, number> = {};

    context.cart.forEach((item) => {
      if (item.Variant_Id != null && item.Quantity != null) {
        map[item.Variant_Id] = (map[item.Variant_Id] ?? 0) + item.Quantity;
      }
    });

    return map;
  }, [context.cart]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 1) useEffect principal: primero saca "plan" del negocio y luego productos
  useEffect(() => {
    (async () => {
      // Redirección especial si es "26"
      if (idBusiness === "26") {
        window.location.href = "https://mrcongelados.com/";
        return;
      }

      if (idBusiness == "92") {
        setNotPay(true);
        setNotPayMessage("No tienes acceso a este catálogo por falta de pago.");
        return;
      }

      // Asegurar que el contexto tenga el ID del negocio
      if (idBusiness) {
        context.setIdBussiness(idBusiness);
        //guradamos el id del negocio en el local storage
        localStorage.setItem("idBusiness", idBusiness);
      }

      // Limpieza de carrito si no coincide el negocio
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const isDifferentBusiness = storedCart.some(
        (item: Producto) => item.Business_Id.toString() !== idBusiness
      );
      if (isDifferentBusiness || storedCart.length === 0) {
        localStorage.removeItem("cart");
        context.clearCart();
      }

      // 1.1) Obtener datos del negocio
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

      // 1.2) Obtener productos con el plan real
      const dataProducts = await getProductsByBusinessWithStock(
        idBusiness || "1",
        dataBusiness?.Plan || ""
      );

      if (dataProducts.length > 0) {
        setProductos(dataProducts);
        setTelefono(dataProducts[0].PhoneNumber || null);
        context.setPhoneNumber(dataProducts[0].PhoneNumber || null);
        localStorage.setItem("telefono", dataProducts[0].PhoneNumber || "");
      } else {
        setProductos([]);
      }

    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBusiness]);

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

  const sanitizedProducts = useMemo(
    () =>
      productos.filter((producto) =>
        Boolean(producto.Image || (producto.Images && producto.Images[0]))
      ),
    [productos]
  );

  const sanitizedLength = sanitizedProducts.length;

  const visibleProducts = useMemo(
    () => sanitizedProducts.slice(0, visibleCount),
    [sanitizedProducts, visibleCount]
  );

  const hasMoreProducts = visibleCount < sanitizedLength;

  // 3) Función para ajustar color en hover
  const adjustColor = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.max(0, r - 100).toString(16).padStart(2, "0");
    const newG = Math.max(0, g - 100).toString(16).padStart(2, "0");
    const newB = Math.max(0, b - 100).toString(16).padStart(2, "0");
    return `#${newR}${newG}${newB}`;
  }, []);

  // 4) Función para cargar más productos
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= sanitizedLength) {
        return prev;
      }
      return Math.min(prev + 10, sanitizedLength);
    });
  }, [sanitizedLength]);

  useEffect(() => {
    const initialCount = sanitizedLength === 0 ? 0 : Math.min(10, sanitizedLength);
    setVisibleCount(initialCount);
  }, [sanitizedLength]);

  // 5) Intersection Observer para cargar más productos cuando se visualiza el "sentinela"
  useEffect(() => {
    if (!hasMoreProducts) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: "200px", // Se dispara cuando está a 200px de la vista
      }
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreProducts, loadMore]);

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

  if (notPay) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">
          {notPayMessage}
        </h1>
        <p className="mt-4 text-gray-600">
          Por favor, contacta a tu proveedor para más información.
        </p>
      </div>
    );
  }

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

        <div className="p-4 min-h-screen w-full max-w-screen-xl mx-auto py-20 mt-8">
          {productos.length === 0 ? (
            <div className="text-center mt-10">
              <h2 className="text-2xl font-semibold text-gray-700">
                No hay productos disponibles
              </h2>
              <p className="text-gray-500 mt-2">
                Por favor, vuelve a intentarlo más tarde o explora otras categorías.
              </p>
            </div>
          ) : (
            <ProductGrid
              products={visibleProducts}
              telefono={telefono}
              color={color}
              adjustColor={adjustColor}
              onAdd={handleAddToCart}
              formatPrice={formatPrice}
            />
          )}

          {/* Sentinela para disparar el Intersection Observer */}
          {hasMoreProducts && (
            <div ref={loadMoreRef} className="h-10"></div>
          )}

          {/* Botón de WhatsApp */}
          <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
            <a href={`https://api.whatsapp.com/send?phone=${idBusiness === "115"
              ?"1"
              :"52"}${telefono}`}>
              <img src={logoWhasa} alt="WS" className="h-12 w-12" />
            </a>
          </div>

          {variantLoading && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 text-white text-lg font-semibold">
              Cargando variantes...
            </div>
          )}

          <VariantSelectionModal
            product={variantProduct}
            variants={variantOptions}
            isOpen={variantModalOpen}
            onClose={handleCloseVariantModal}
            onConfirm={handleConfirmVariant}
            existingVariantQuantities={cartVariantQuantities}
          />
        </div>
      </>
    </HelmetProvider>
  );
};
