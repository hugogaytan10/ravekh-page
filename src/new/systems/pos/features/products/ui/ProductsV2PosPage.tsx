import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./ProductsV2PosPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const DEFAULT_BUSINESS_ID = Number(import.meta.env.VITE_POS_BUSINESS_ID ?? 0);
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type ProductItemVm = {
  id: number;
  name: string;
  description: string;
  categoryId: number | null;
  categoryName: string | null;
  color: string | null;
  available: boolean;
  forSale: boolean;
  showInStore: boolean;
  volume: boolean;
  price: number | null;
  promotionPrice: number | null;
  stock: number | null;
  expDate: string | null;
  minStock: number | null;
  optStock: number | null;
  quantity: number | null;
  image: string | null;
  images: string[];
  variants: ProductVariant[];
  extras: Array<{ description: string; type: string }>;
};

type VariantFormVm = {
  key: string;
  id?: number;
  productId?: number;
  description: string;
  price: string;
  promotionPrice: string;
  costPerItem: string;
  stock: string;
  minStock: string;
  optStock: string;
  expDate: string;
  barcode: string;
};

type ViewMode = "grid" | "list";
type ToastState = { type: "success" | "error"; message: string } | null;
type ArchiveDialogState = { id: number; name: string } | null;
type ProductCategoryVm = { id: number; name: string; color: string };

const toImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;

  try {
    return new URL(image.startsWith("/") ? image.slice(1) : image, API_BASE_URL).toString();
  } catch {
    return null;
  }
};

const toDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });

const createVariantDraft = (): VariantFormVm => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  price: "",
  promotionPrice: "",
  costPerItem: "",
  stock: "",
  minStock: "",
  optStock: "",
  expDate: "",
  barcode: "",
});

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const ProductsV2PosPage = () => {
  const [businessId] = useState(() => {
    const storedBusinessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? 0);
    return storedBusinessId || DEFAULT_BUSINESS_ID;
  });
  const [token] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [products, setProducts] = useState<ProductItemVm[]>([]);
  const [categories, setCategories] = useState<ProductCategoryVm[]>([]);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [categoryColorInput, setCategoryColorInput] = useState("#4F46E5");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState<ArchiveDialogState>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [forSale, setForSale] = useState(true);
  const [showInStore, setShowInStore] = useState(true);
  const [available, setAvailable] = useState(true);
  const [variants, setVariants] = useState<VariantFormVm[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [storedImages, setStoredImages] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);

  const service = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosProductsService();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setForSale(true);
    setShowInStore(true);
    setAvailable(true);
    setVariants([]);
    setSelectedCategoryId(null);
    setSizesInput("");
    setColorsInput("");
    setStoredImages([]);
    setSelectedImageFiles([]);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsFormOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setError(null);
    setIsFormOpen(true);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryNameInput("");
    setCategoryColorInput("#4F46E5");
  };

  const loadProducts = async () => {
    if (!businessId || !token) {
      setError("Inicia sesión para administrar productos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await service.listProducts(businessId, token);
      setProducts(
        list.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          color: product.color,
          available: product.available,
          forSale: product.forSale,
          showInStore: product.showInStore,
          volume: product.volume,
          price: product.price,
          promotionPrice: product.promotionPrice,
          stock: product.stock,
          expDate: product.expDate,
          minStock: product.minStock,
          optStock: product.optStock,
          quantity: product.quantity,
          image: product.image,
          images: product.images,
          variants: product.variants,
          extras: product.extras,
        })),
      );
      const categoryRows = await service.listCategories(businessId, token);
      setCategories(
        categoryRows
          .filter((category) => typeof category.id === "number" && category.id > 0)
          .map((category) => ({ id: category.id as number, name: category.name, color: category.color })),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar productos v2.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [businessId, token]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products
      .filter((product) => (showArchived ? true : product.available))
      .filter((product) => {
        if (!normalizedSearch) return true;

        return product.name.toLowerCase().includes(normalizedSearch) || product.description.toLowerCase().includes(normalizedSearch);
      });
  }, [products, search, showArchived]);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.available).length;
    const archived = products.length - active;
    const withVariants = products.filter((product) => product.variants.length > 0).length;
    return { total: products.length, active, archived, withVariants };
  }, [products]);

  const mappedVariants = (): ProductVariant[] => {
    return variants
      .filter((variant) => variant.description.trim())
      .map((variant) => ({
        description: variant.description.trim(),
        barcode: variant.barcode.trim() || null,
        color: null,
        size: null,
        id: variant.id,
        productId: variant.productId,
        price: toNullableNumber(variant.price),
        stock: toNullableNumber(variant.stock),
        costPerItem: toNullableNumber(variant.costPerItem),
        promotionPrice: toNullableNumber(variant.promotionPrice),
        minStock: toNullableNumber(variant.minStock),
        optStock: toNullableNumber(variant.optStock),
        expDate: variant.expDate.trim() || null,
      }));
  };

  const parseExtrasFromInput = (value: string, type: "TALLA" | "COLOR") =>
    Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean))).map((description) => ({
      description,
      type,
    }));

  const formImagePreviews = useMemo(() => {
    const remote = storedImages.map((img) => toImageUrl(img)).filter(Boolean) as string[];
    const local = selectedImageFiles.map((file) => URL.createObjectURL(file));
    return [...remote, ...local];
  }, [storedImages, selectedImageFiles]);

  useEffect(() => {
    return () => {
      formImagePreviews.forEach((src) => {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, [formImagePreviews]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!businessId) {
      setError("Business ID es obligatorio.");
      return;
    }

    if (!token) {
      setError("Token es obligatorio para operar POS v2.");
      return;
    }

    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    const parsedPrice = price.trim() === "" ? null : Number(price);
    const parsedStock = stock.trim() === "" ? null : Number(stock);

    if (parsedPrice !== null && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (parsedStock !== null && (Number.isNaN(parsedStock) || parsedStock < 0)) {
      setError("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedImages = await Promise.all(selectedImageFiles.map((file) => toDataUrl(file)));
      const allImages = Array.from(new Set([...storedImages, ...selectedImages].filter(Boolean)));

      const payload: SaveManagedProductDto = {
        id: editingId ?? undefined,
        businessId,
        name: name.trim(),
        description: description.trim(),
        forSale,
        showInStore,
        available,
        color: null,
        volume: false,
        price: parsedPrice,
        promotionPrice: null,
        stock: parsedStock,
        expDate: null,
        minStock: null,
        optStock: null,
        quantity: null,
        image: allImages[0] || undefined,
        images: allImages,
        costPerItem: null,
        barcode: null,
        categoryId: selectedCategoryId,
        variants: mappedVariants(),
        extras: [...parseExtrasFromInput(sizesInput, "TALLA"), ...parseExtrasFromInput(colorsInput, "COLOR")],
      };

      await service.saveProduct(payload, token);
      setToast({ type: "success", message: editingId ? "Producto actualizado correctamente." : "Producto creado correctamente." });
      closeFormModal();
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar producto.");
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo guardar producto." });
    } finally {
      setSaving(false);
    }
  };

  const cloneSavePayload = (detail: Awaited<ReturnType<typeof service.getProduct>>): SaveManagedProductDto => ({
    id: detail?.id,
    businessId,
    name: detail?.name ?? "",
    description: detail?.description ?? "",
    forSale: detail?.forSale ?? true,
    showInStore: detail?.showInStore ?? true,
    available: detail?.available ?? true,
    color: detail?.color ?? null,
    volume: detail?.volume ?? false,
    price: detail?.price ?? null,
    promotionPrice: detail?.promotionPrice ?? null,
    stock: detail?.stock ?? null,
    expDate: detail?.expDate ?? null,
    minStock: detail?.minStock ?? null,
    optStock: detail?.optStock ?? null,
    quantity: detail?.quantity ?? null,
    image: detail?.image ?? undefined,
    images: detail?.images ?? [],
    costPerItem: detail?.costPerItem ?? null,
    barcode: detail?.barcode ?? null,
    categoryId: detail?.categoryId ?? null,
    variants: detail?.variants ?? [],
    extras: detail?.extras ?? [],
  });

  const handleRestore = async (productId: number) => {
    if (!token) {
      setToast({ type: "error", message: "Token es obligatorio para restaurar." });
      return;
    }

    setActionLoadingId(productId);
    try {
      const detail = await service.getProduct(productId, token);
      if (!detail) throw new Error("No encontramos el producto para restaurar.");
      await service.saveProduct({ ...cloneSavePayload(detail), available: true }, token);
      setToast({ type: "success", message: `Producto "${detail.name}" restaurado.` });
      await loadProducts();
    } catch (cause) {
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo restaurar producto." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEdit = async (productId: number) => {
    if (!token) {
      setError("Token es obligatorio para editar.");
      return;
    }

    try {
      const detail = await service.getProduct(productId, token);
      if (!detail) {
        throw new Error("No encontramos el producto seleccionado.");
      }

      setEditingId(detail.id);
      setName(detail.name);
      setDescription(detail.description);
      setPrice(detail.price == null ? "" : String(detail.price));
      setStock(detail.stock == null ? "" : String(detail.stock));
      setForSale(detail.forSale);
      setShowInStore(detail.showInStore);
      setAvailable(detail.available);
      setSelectedCategoryId(detail.categoryId ?? null);
      setStoredImages(Array.from(new Set([detail.image, ...detail.images].filter(Boolean) as string[])));
      setSelectedImageFiles([]);
      setSizesInput(detail.extras.filter((extra) => extra.type.toUpperCase() === "TALLA").map((extra) => extra.description).join(", "));
      setColorsInput(detail.extras.filter((extra) => extra.type.toUpperCase() === "COLOR").map((extra) => extra.description).join(", "));
      setVariants(
        detail.variants.map((variant, index) => ({
          key: `${detail.id}-${index}`,
          id: variant.id,
          productId: variant.productId,
          description: variant.description ?? "",
          price: variant.price == null ? "" : String(variant.price),
          promotionPrice: variant.promotionPrice == null ? "" : String(variant.promotionPrice),
          costPerItem: variant.costPerItem == null ? "" : String(variant.costPerItem),
          stock: variant.stock == null ? "" : String(variant.stock),
          minStock: variant.minStock == null ? "" : String(variant.minStock),
          optStock: variant.optStock == null ? "" : String(variant.optStock),
          expDate: variant.expDate ?? "",
          barcode: variant.barcode ?? "",
        })),
      );
      setError(null);
      setIsFormOpen(true);
      setToast(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el producto para edición.");
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo cargar el producto para edición." });
    }
  };

  const requestArchive = (productId: number, productName: string) => {
    setArchiveDialog({ id: productId, name: productName });
  };

  const handleArchive = async () => {
    if (!archiveDialog) return;

    if (!token) {
      setError("Token es obligatorio para eliminar/archivar.");
      setToast({ type: "error", message: "Token es obligatorio para eliminar/archivar." });
      return;
    }

    setArchivingId(archiveDialog.id);
    setError(null);

    try {
      await service.archiveProduct(archiveDialog.id, token);
      if (editingId === archiveDialog.id) {
        closeFormModal();
      }
      setToast({ type: "success", message: `Producto "${archiveDialog.name}" archivado.` });
      setArchiveDialog(null);
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar/archivar producto.");
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo eliminar/archivar producto." });
    } finally {
      setArchivingId(null);
    }
  };

  const handleImageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    setSelectedImageFiles((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeVariant = (key: string) => setVariants((current) => current.filter((variant) => variant.key !== key));

  const updateVariant = (key: string, field: keyof VariantFormVm, value: string) => {
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant)));
  };

  const saveCategory = async () => {
    if (!token || !businessId) return;
    if (!categoryNameInput.trim()) return;

    try {
      if (editingCategoryId) {
        await service.updateCategory({ id: editingCategoryId, businessId, name: categoryNameInput.trim(), color: categoryColorInput }, token);
        setToast({ type: "success", message: "Categoría actualizada." });
      } else {
        await service.createCategory({ businessId, name: categoryNameInput.trim(), color: categoryColorInput }, token);
        setToast({ type: "success", message: "Categoría creada." });
      }
      resetCategoryForm();
      await loadProducts();
    } catch (cause) {
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo guardar categoría." });
    }
  };

  const editCategory = (category: ProductCategoryVm) => {
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
    setCategoryColorInput(category.color || "#4F46E5");
    setShowCategoryManager(true);
  };

  const deleteCategory = async (categoryId: number) => {
    if (!token) return;
    try {
      await service.deleteCategory(categoryId, token);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
      setToast({ type: "success", message: "Categoría eliminada." });
      await loadProducts();
    } catch (cause) {
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo eliminar categoría." });
    }
  };

  return (
    <PosV2Shell title="Productos" subtitle="Catálogo moderno para operar tu POS de forma rápida.">
      <section className="pos-v2-products">
        <header className="pos-v2-products__header">
          <div>
            <h2>Gestión de productos</h2>
            <p>Alta y edición en modal, manteniendo la vista del catálogo limpia y rápida para POS.</p>
          </div>

          <div className="pos-v2-products__header-actions">
            <button type="button" className="pos-v2-products__secondary" onClick={openCreateModal}>+ Nuevo</button>
            <button type="button" className="pos-v2-products__secondary" onClick={() => setShowCategoryManager(true)}>Categorías</button>
            <button type="button" className="pos-v2-products__refresh" onClick={loadProducts} disabled={loading || !token || !businessId}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        {error ? <p className="pos-v2-products__error" role="alert">{error}</p> : null}
        {toast ? <p className={`pos-v2-products__toast is-${toast.type}`} role="status">{toast.message}</p> : null}

        <section className="pos-v2-products__stats" aria-label="Resumen de productos">
          <article><span>Total</span><strong>{stats.total}</strong></article>
          <article><span>Activos</span><strong>{stats.active}</strong></article>
          <article><span>Archivados</span><strong>{stats.archived}</strong></article>
          <article><span>Con variantes</span><strong>{stats.withVariants}</strong></article>
        </section>

        <section className="pos-v2-products__catalog" aria-label="Listado de productos">
          <div className="pos-v2-products__catalog-header">
            <h3>Listado</h3>

            <div className="pos-v2-products__controls">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o descripción" aria-label="Buscar productos" />

              <div className="pos-v2-products__view-toggle" role="group" aria-label="Cambiar vista">
                <button type="button" className={viewMode === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")}>Cuadrícula</button>
                <button type="button" className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")}>Lista</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={`pos-v2-products__skeletons ${viewMode === "grid" ? "is-grid" : "is-list"}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <article key={`skeleton-${index}`} className="pos-v2-products__skeleton-card" aria-hidden="true">
                  <div className="pos-v2-products__skeleton-media" />
                  <div className="pos-v2-products__skeleton-line" />
                  <div className="pos-v2-products__skeleton-line short" />
                </article>
              ))}
            </div>
          ) : null}

          {!loading && visibleProducts.length === 0 ? <p className="pos-v2-products__empty">No hay productos para mostrar con los filtros actuales.</p> : null}

          {!loading ? (
            <div className={`pos-v2-products__products ${viewMode === "grid" ? "is-grid" : "is-list"}`}>
              {visibleProducts.map((product) => {
                const imageCandidates = [product.image, ...product.images].map((candidate) => toImageUrl(candidate)).filter(Boolean) as string[];
                const uniqueImages = Array.from(new Set(imageCandidates));
                const preview = uniqueImages[0] ?? null;
                const colors = Array.from(new Set([
                  ...product.variants.map((variant) => variant.color?.trim()),
                  ...product.extras.filter((extra) => extra.type.toUpperCase() === "COLOR").map((extra) => extra.description.trim()),
                ].filter(Boolean) as string[]));
                const sizes = Array.from(new Set([
                  ...product.variants.map((variant) => variant.size?.trim()),
                  ...product.extras.filter((extra) => extra.type.toUpperCase() === "TALLA").map((extra) => extra.description.trim()),
                ].filter(Boolean) as string[]));

                return (
                  <article key={product.id} className={`pos-v2-products__card ${!product.available ? "is-archived" : ""}`}>
                    {preview ? <img src={preview} alt={product.name} className="pos-v2-products__card-image" loading="lazy" /> : <div className="pos-v2-products__card-image-placeholder" aria-hidden="true">{product.name.slice(0, 1).toUpperCase()}</div>}

                    <div className="pos-v2-products__card-content">
                      <div className="pos-v2-products__card-headline">
                        <h4>{product.name}</h4>
                        <span className={product.available ? "is-ok" : "is-muted"}>{product.available ? "Disponible" : "Archivado"}</span>
                      </div>

                      <div className="pos-v2-products__card-meta">
                        <strong>{product.price == null ? "--" : `$${product.price.toFixed(2)}`}</strong>
                        <small>Stock: {product.stock ?? "--"}</small>
                      </div>
                      {product.categoryName ? <small className="pos-v2-products__simple-meta">Categoría: {product.categoryName}</small> : null}

                      <small className="pos-v2-products__simple-meta">Variantes: {product.variants.length} · Fotos: {uniqueImages.length}</small>
                      {(colors.length > 0 || sizes.length > 0) ? (
                        <small className="pos-v2-products__simple-meta">
                          {colors.length > 0 ? `Colores: ${colors.join(", ")}` : "Colores: --"} · {sizes.length > 0 ? `Tallas: ${sizes.join(", ")}` : "Tallas: --"}
                        </small>
                      ) : null}
                    </div>

                    <div className="pos-v2-products__card-actions">
                      <button type="button" className="is-edit" onClick={() => handleEdit(product.id)}>Editar</button>

                      {product.available ? (
                        <button type="button" onClick={() => requestArchive(product.id, product.name)} disabled={archivingId === product.id}>
                          {archivingId === product.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="is-restore"
                          onClick={() => handleRestore(product.id)}
                          disabled={actionLoadingId === product.id}
                        >
                          {actionLoadingId === product.id ? "Procesando..." : "Restaurar"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        {isFormOpen ? (
          <div className="pos-v2-products__modal-backdrop" role="presentation" onClick={closeFormModal}>
            <section className="pos-v2-products__modal w-full max-h-[92vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Formulario de producto" onClick={(event) => event.stopPropagation()}>
              <header className="pos-v2-products__modal-head">
                <h3>{editingId ? `Editar producto #${editingId}` : "Nuevo producto"}</h3>
                <button type="button" className="pos-v2-products__secondary" onClick={closeFormModal} aria-label="Regresar al catálogo">← Regresar</button>
              </header>

              <form className="pos-v2-products__form" onSubmit={handleSubmit}>
                <label>
                  Nombre
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Hamburguesa clásica" required />
                </label>

                <label>
                  Descripción
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe el producto (opcional)" rows={3} />
                </label>

                <fieldset className="pos-v2-products__variants" aria-label="Categoría de producto">
                  <div className="pos-v2-products__variants-head">
                    <h4>Categoría</h4>
                  </div>
                  <div className="pos-v2-products__chips">
                    <button type="button" className={selectedCategoryId == null ? "is-active" : ""} onClick={() => setSelectedCategoryId(null)}>Sin categoría</button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={selectedCategoryId === category.id ? "is-active" : ""}
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="pos-v2-products__field-grid">
                  <label>
                    Precio (opcional)
                    <input type="number" min="0" step="0.01" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} />
                  </label>

                  <label>
                    Stock (opcional)
                    <input type="number" min="0" step="1" inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} />
                  </label>
                </div>

                <label>
                  Fotos del producto
                  <input type="file" accept="image/*" multiple onChange={handleImageInput} />
                </label>

                {formImagePreviews.length > 0 ? (
                  <div className="pos-v2-products__image-preview" aria-label="Vista previa de fotos">
                    {formImagePreviews.slice(0, 8).map((photo, index) => (
                      <img key={`preview-${index}`} src={photo} alt={`Vista previa ${index + 1}`} loading="lazy" />
                    ))}
                  </div>
                ) : null}

                <div className="pos-v2-products__toggles">
                  <label className="pos-v2-products__toggle-card">
                    <input type="checkbox" checked={forSale} onChange={(event) => setForSale(event.target.checked)} />
                    <span className="pos-v2-products__switch-ui" aria-hidden="true" />
                    <span>A la venta</span>
                  </label>
                  <label className="pos-v2-products__toggle-card">
                    <input type="checkbox" checked={showInStore} onChange={(event) => setShowInStore(event.target.checked)} />
                    <span className="pos-v2-products__switch-ui" aria-hidden="true" />
                    <span>Mostrar en tienda</span>
                  </label>
                  <label className="pos-v2-products__toggle-card">
                    <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
                    <span className="pos-v2-products__switch-ui" aria-hidden="true" />
                    <span>Disponible</span>
                  </label>
                </div>

                <fieldset className="pos-v2-products__variants" aria-label="Variantes del producto">
                  <div className="pos-v2-products__variants-head">
                    <h4>Variantes</h4>
                    <button type="button" onClick={() => setVariants((current) => [...current, createVariantDraft()])}>+ Agregar variante</button>
                  </div>

                  {variants.length === 0 ? <p className="pos-v2-products__variants-empty">Sin variantes por ahora.</p> : null}

                  {variants.map((variant, index) => (
                    <article key={variant.key} className="pos-v2-products__variant-item">
                      <div className="pos-v2-products__variant-head">
                        <strong>Variante {index + 1}</strong>
                        <button type="button" className="is-delete" onClick={() => removeVariant(variant.key)}>Eliminar</button>
                      </div>
                      <div className="pos-v2-products__variant-grid">
                        <input value={variant.description} onChange={(event) => updateVariant(variant.key, "description", event.target.value)} placeholder="Descripción" aria-label={`Nombre de variante ${index + 1}`} />
                        <input value={variant.barcode} onChange={(event) => updateVariant(variant.key, "barcode", event.target.value)} placeholder="Código de barras" aria-label={`Código de barras de variante ${index + 1}`} />
                        <input value={variant.price} onChange={(event) => updateVariant(variant.key, "price", event.target.value)} placeholder="Precio" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Precio de variante ${index + 1}`} />
                        <input value={variant.promotionPrice} onChange={(event) => updateVariant(variant.key, "promotionPrice", event.target.value)} placeholder="Promoción" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Promoción de variante ${index + 1}`} />
                        <input value={variant.costPerItem} onChange={(event) => updateVariant(variant.key, "costPerItem", event.target.value)} placeholder="Costo" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Costo de variante ${index + 1}`} />
                        <input value={variant.stock} onChange={(event) => updateVariant(variant.key, "stock", event.target.value)} placeholder="Stock" type="number" min="0" step="1" inputMode="numeric" aria-label={`Stock de variante ${index + 1}`} />
                        <input value={variant.minStock} onChange={(event) => updateVariant(variant.key, "minStock", event.target.value)} placeholder="Stock mínimo" type="number" min="0" step="1" inputMode="numeric" aria-label={`Stock mínimo de variante ${index + 1}`} />
                        <input value={variant.optStock} onChange={(event) => updateVariant(variant.key, "optStock", event.target.value)} placeholder="Stock óptimo" type="number" min="0" step="1" inputMode="numeric" aria-label={`Stock óptimo de variante ${index + 1}`} />
                        <input value={variant.expDate} onChange={(event) => updateVariant(variant.key, "expDate", event.target.value)} placeholder="Fecha de caducidad" type="date" aria-label={`Fecha de caducidad de variante ${index + 1}`} />
                      </div>
                    </article>
                  ))}
                </fieldset>

                <fieldset className="pos-v2-products__variants" aria-label="Tallas y colores">
                  <div className="pos-v2-products__variants-head">
                    <h4>Tallas y colores (Extras)</h4>
                  </div>
                  <input value={sizesInput} onChange={(event) => setSizesInput(event.target.value)} placeholder="Tallas por coma. Ej: S, M, XL" aria-label="Tallas del producto" />
                  <input value={colorsInput} onChange={(event) => setColorsInput(event.target.value)} placeholder="Colores por coma. Ej: AZUL, VERDE" aria-label="Colores del producto" />
                </fieldset>

                <div className="pos-v2-products__form-actions is-modal">
                  <button type="button" className="pos-v2-products__secondary" onClick={closeFormModal}>Cancelar</button>
                  <button type="submit" className="pos-v2-products__primary" disabled={saving}>{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar producto"}</button>
                </div>
              </form>
            </section>
          </div>
        ) : null}

        {archiveDialog ? (
          <div className="pos-v2-products__modal-backdrop is-sheet" role="presentation" onClick={() => setArchiveDialog(null)}>
            <section className="pos-v2-products__modal pos-v2-products__modal-sheet w-full max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Confirmar eliminación" onClick={(event) => event.stopPropagation()}>
              <header className="pos-v2-products__modal-head">
                <h3>¿Eliminar producto?</h3>
              </header>
              <p>Este producto se marcará como archivado y dejará de mostrarse en venta activa.</p>
              <strong>{archiveDialog.name}</strong>
              <div className="pos-v2-products__form-actions is-modal">
                <button type="button" className="pos-v2-products__secondary" onClick={() => setArchiveDialog(null)}>Cancelar</button>
                <button type="button" className="pos-v2-products__primary is-danger" onClick={handleArchive} disabled={archivingId === archiveDialog.id}>
                  {archivingId === archiveDialog.id ? "Archivando..." : "Sí, archivar"}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {showCategoryManager ? (
          <div className="pos-v2-products__modal-backdrop" role="presentation" onClick={() => setShowCategoryManager(false)}>
            <section className="pos-v2-products__modal pos-v2-products__modal--compact w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Gestión de categorías" onClick={(event) => event.stopPropagation()}>
              <header className="pos-v2-products__modal-head">
                <h3>Gestionar categorías</h3>
                <button type="button" className="pos-v2-products__secondary" onClick={() => setShowCategoryManager(false)} aria-label="Regresar al catálogo">← Regresar</button>
              </header>

              <div className="pos-v2-products__field-grid">
                <label>
                  Nombre categoría
                  <input value={categoryNameInput} onChange={(event) => setCategoryNameInput(event.target.value)} placeholder="Ej. Bebidas" />
                </label>
                <label>
                  Color
                  <input type="color" value={categoryColorInput} onChange={(event) => setCategoryColorInput(event.target.value)} />
                </label>
              </div>
              <div className="pos-v2-products__form-actions">
                <button type="button" className="pos-v2-products__secondary" onClick={resetCategoryForm}>Limpiar</button>
                <button type="button" className="pos-v2-products__primary" onClick={saveCategory}>{editingCategoryId ? "Guardar cambios" : "Crear categoría"}</button>
              </div>

              <div className="pos-v2-products__category-list">
                {categories.length === 0 ? <p className="pos-v2-products__variants-empty">Aún no hay categorías.</p> : null}
                {categories.map((category) => (
                  <article key={category.id} className="pos-v2-products__category-item">
                    <span className="pos-v2-products__category-dot" style={{ backgroundColor: category.color }} aria-hidden="true" />
                    <strong>{category.name}</strong>
                    <small>{category.color}</small>
                    <div className="pos-v2-products__card-actions">
                      <button type="button" className="is-edit" onClick={() => editCategory(category)}>Editar</button>
                      <button type="button" onClick={() => deleteCategory(category.id)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
