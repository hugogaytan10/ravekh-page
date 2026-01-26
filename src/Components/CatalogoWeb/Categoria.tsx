
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getProductsByCategoryIdAndDisponibilty, getVariantsByProductIdPublic } from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";
import { Variant } from "./PuntoVenta/Model/Variant";
import { VariantSelectionModal, getBaseVariantKey } from "./VariantSelectionModal";

export const MainCategoria: React.FC = () => {
    const { idCategoria } = useParams<{
        idCategoria: string;
    }>();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [telefono, setTelefono] = useState<string | null>(null);
    const context = useContext(AppContext);
    const [notPay, setNotPay] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [variantProduct, setVariantProduct] = useState<Producto | null>(null);
    const [variantOptions, setVariantOptions] = useState<Variant[]>([]);
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variantLoading, setVariantLoading] = useState(false);
    const catalogoId =
        (context.idBussiness !== "0" ? context.idBussiness : localStorage.getItem("idBusiness")) ?? "";

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


    useEffect(() => {
        /*context.setIdBussiness(idBusiness);
        getProductsByBusiness(idBusiness).then((data) => {
          if (data.length === 0) {
            return;
          }
          setProductos(data || []);
          setTelefono(data[0].PhoneNumber || null);
          context.setPhoneNumber(data[0].PhoneNumber || null);
          localStorage.setItem("telefono", data[0].PhoneNumber || "");
        });*/
        //rescatamos el id del negocio del local storage
      
        if (idCategoria) {
            setLoadingProducts(true);
            getProductsByCategoryIdAndDisponibilty(idCategoria)
                .then((data) => {
                    setProductos(Array.isArray(data) ? data : []);
                })
                .finally(() => {
                    setLoadingProducts(false);
                });
        }
        if (!context.phoneNumber) {
            const storedPhoneNumber = localStorage.getItem("telefono");
            if (storedPhoneNumber) {
                context.setPhoneNumber(storedPhoneNumber);
                setTelefono(storedPhoneNumber);
            }
        }else{
            setTelefono(context.phoneNumber);
        }
    }, [context.idBussiness, idCategoria]);

    useEffect(() => {
        if (!context.phoneNumber) {
            const storedPhoneNumber = localStorage.getItem("telefono");
            if (storedPhoneNumber) {
                context.setPhoneNumber(storedPhoneNumber);
                setTelefono(storedPhoneNumber);
            }
        }else{
            setTelefono(context.phoneNumber);
        }
        const menuIcono = document.getElementById("menuIcono");
        //ocultamos ese menu
        menuIcono?.classList.add("hidden");
        //mostramos el menu de navegacion
        const menuNavegacion = document.getElementById("menuIconoCatalogo");
        menuNavegacion?.classList.remove("hidden");

        //mostramos la imagen del catalogo
        const menuImagen = document.getElementById("imgCatalogo");
        menuImagen?.classList.remove("hidden");

        //ocultamos la flecha de regreso
        const arrowIcon = document.getElementById("backCatalogo");
        arrowIcon?.classList.add("hidden");
    }, []);

    useEffect(() => {
        //rescatamos el id del negocio del local storage
        const storedIdBusiness = localStorage.getItem("idBusiness");
        if (storedIdBusiness && storedIdBusiness == "92") {
            setNotPay(true);
        }
    }, [productos]);

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

            context.addProductToCart({ ...product, Variant_Id: null });
        },
        [context, fetchVariantsForProduct, openVariantModal]
    );

    const handleConfirmVariant = useCallback(
        (selections: { variant: Variant; quantity: number }[]) => {
            if (!variantProduct) return;

            selections.forEach(({ variant, quantity }) => {
                const basePrice = variant.PromotionPrice ?? variant.Price ?? variantProduct.Price;

                context.addProductToCart({
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
        [context, variantProduct]
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

    if(notPay) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
                <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Lo sentimos</h1>
                <p className="text-lg text-[var(--text-secondary)]">No puedes comprar en esta tienda.</p>
                <p className="text-lg text-[var(--text-secondary)]">Por favor, contacta a la tienda para más información.</p>
            </div>
        );
    }
    return (
        <HelmetProvider>
            <>
                <Helmet>
                    <meta name="theme-color" content="#F64301" />
                </Helmet>
                <div className="px-4 pt-44 pb-12 min-h-screen w-full max-w-screen-xl mx-auto bg-[var(--bg-primary)]">
                    {loadingProducts ? (
                        <ProductGridSkeleton items={10} />
                    ) : sanitizedProducts.length === 0 ? (
                        <div className="text-center mt-10">
                            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                                No hay productos disponibles
                            </h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Por favor, vuelve a intentarlo más tarde o explora otras
                                categorías.
                            </p>
                            {catalogoId && (
                                <NavLink
                                    to={catalogoId ? `/catalogo/${catalogoId}` : "/"}
                                    className="inline-flex mt-6 px-6 py-2 rounded-full text-white font-medium shadow-sm bg-[var(--action-primary)]"
                                >
                                    Ver todo
                                </NavLink>
                            )}
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

                    {/* Botón de WhatsApp */}
                    <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
                        <a href={`https://api.whatsapp.com/send?phone=52${telefono}`}>
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
                        storeColor={context.color}
                    />
                </div>
            </>
        </HelmetProvider>
    );
};
