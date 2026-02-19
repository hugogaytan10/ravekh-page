
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
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [hasPrev, setHasPrev] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [telefono, setTelefono] = useState<string | null>(null);
    const context = useContext(AppContext);
    const [notPay, setNotPay] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [variantProduct, setVariantProduct] = useState<Producto | null>(null);
    const [variantOptions, setVariantOptions] = useState<Variant[]>([]);
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variantLoading, setVariantLoading] = useState(false);
    const [themeColor, setThemeColor] = useState("#F9FAFB");
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


    const fetchProductsPage = useCallback(async (pageToFetch: number) => {
        if (!idCategoria) return;

        try {
            setLoadingProducts(true);
            const response = await getProductsByCategoryIdAndDisponibilty(
                idCategoria,
                "",
                pageToFetch
            );

            if (Array.isArray(response)) {
                setProductos(response);
                setHasNext(false);
                setHasPrev(false);
                setTotalPages(1);
                setPage(1);
                setPageInput("1");
                return;
            }

            const newProducts: Producto[] = Array.isArray(response?.data) ? response.data : [];
            const pagination = response?.pagination;
            setProductos(newProducts);
            setHasNext(Boolean(pagination?.hasNext));
            setHasPrev(Boolean(pagination?.hasPrev));
            setTotalPages(Number(pagination?.totalPages) || 1);
            setPage(pageToFetch);
            setPageInput(String(pageToFetch));
        } catch (error) {
            console.error("Error paginando productos por categoría:", error);
            setProductos([]);
            setHasNext(false);
            setHasPrev(false);
            setTotalPages(1);
        } finally {
            setLoadingProducts(false);
        }
    }, [idCategoria]);

    useEffect(() => {
        if (idCategoria) {
            void fetchProductsPage(1);
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
    }, [context.idBussiness, idCategoria, fetchProductsPage]);

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

    const paginationItems = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const items: Array<number | string> = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);

        if (start > 1) items.push(1);
        if (start > 2) items.push("...");

        for (let current = start; current <= end; current += 1) {
            items.push(current);
        }

        if (end < totalPages - 1) items.push("...");
        if (end < totalPages) items.push(totalPages);

        return items;
    }, [page, totalPages]);

    const handlePageChange = useCallback((nextPage: number) => {
        if (nextPage === page || loadingProducts) return;
        if (nextPage < 1 || nextPage > totalPages) return;
        void fetchProductsPage(nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [fetchProductsPage, loadingProducts, page, totalPages]);

    const handlePageInputChange = useCallback((value: string) => {
        const sanitized = value.replace(/[^\d]/g, "");
        setPageInput(sanitized);
    }, []);

    const handlePageInputSubmit = useCallback(() => {
        const parsed = Number(pageInput);
        if (!Number.isFinite(parsed)) return;
        handlePageChange(parsed);
    }, [handlePageChange, pageInput]);

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
                    <meta name="theme-color" content={themeColor} />
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

                    {totalPages > 1 && (
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={!hasPrev || loadingProducts}
                                className="h-10 px-4 rounded-full border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>

                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {paginationItems.map((item, index) =>
                                    typeof item === "number" ? (
                                        <button
                                            key={`${item}-${index}`}
                                            type="button"
                                            onClick={() => handlePageChange(item)}
                                            disabled={loadingProducts}
                                            className={`h-10 w-10 rounded-full border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                item === page
                                                    ? "bg-[var(--action-primary)] text-white border-[var(--action-primary)]"
                                                    : "border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                                            }`}
                                            aria-current={item === page ? "page" : undefined}
                                        >
                                            {item}
                                        </button>
                                    ) : (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="h-10 w-10 flex items-center justify-center text-[var(--text-secondary)]"
                                        >
                                            {item}
                                        </span>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={!hasNext || loadingProducts}
                                className="h-10 px-4 rounded-full border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Siguiente
                            </button>

                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <span className="hidden sm:inline">Página</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={pageInput}
                                    onChange={(event) => handlePageInputChange(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") handlePageInputSubmit();
                                    }}
                                    className="h-10 w-16 rounded-full border border-[var(--border-default)] bg-transparent text-center text-sm font-semibold text-[var(--text-primary)]"
                                    aria-label="Ir a la página"
                                />
                                <span>de {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={handlePageInputSubmit}
                                    disabled={loadingProducts}
                                    className="h-10 px-4 rounded-full border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Ir
                                </button>
                            </div>
                        </div>
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
