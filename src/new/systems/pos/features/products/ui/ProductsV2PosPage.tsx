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
  available: boolean;
  forSale: boolean;
  showInStore: boolean;
  price: number | null;
  stock: number | null;
  image: string | null;
  images: string[];
  variants: ProductVariant[];
};

type VariantFormVm = {
  key: string;
  description: string;
  price: string;
  stock: string;
  barcode: string;
  color: string;
};

type ViewMode = "grid" | "list";

const toImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;

  try {
    return new URL(image.startsWith("/") ? image.slice(1) : image, API_BASE_URL).toString();
  } catch {
    return null;
  }
};

const createVariantDraft = (): VariantFormVm => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  price: "",
  stock: "",
  barcode: "",
  color: "",
});

export const ProductsV2PosPage = () => {
  const [businessId, setBusinessId] = useState(() => {
    const storedBusinessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? 0);
    return storedBusinessId || DEFAULT_BUSINESS_ID;
  });
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [products, setProducts] = useState<ProductItemVm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");
  const [extraImages, setExtraImages] = useState("");
  const [forSale, setForSale] = useState(true);
  const [showInStore, setShowInStore] = useState(true);
  const [available, setAvailable] = useState(true);
  const [variants, setVariants] = useState<VariantFormVm[]>([]);

  const service = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosProductsService();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("0");
    setStock("0");
    setImage("");
    setExtraImages("");
    setForSale(true);
    setShowInStore(true);
    setAvailable(true);
    setVariants([]);
  };

  const loadProducts = async () => {
    if (!businessId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const list = await service.listProducts(businessId, token);
      const mapped: ProductItemVm[] = list.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        available: product.available,
        forSale: product.forSale,
        showInStore: product.showInStore,
        price: product.price,
        stock: product.stock,
        image: product.image,
        images: product.images,
        variants: product.variants,
      }));
      setProducts(mapped);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar productos v2.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    if (businessId) {
      window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    }
  }, [businessId]);

  useEffect(() => {
    loadProducts();
  }, [businessId, token]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products
      .filter((product) => (showArchived ? true : product.available))
      .filter((product) => {
        if (!normalizedSearch) return true;

        return (
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch) ||
          String(product.id).includes(normalizedSearch)
        );
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
        color: variant.color.trim() || null,
        price: variant.price.trim() ? Number(variant.price) : null,
        stock: variant.stock.trim() ? Number(variant.stock) : null,
        costPerItem: null,
        promotionPrice: null,
      }));
  };

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

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    const parsedExtraImages = extraImages
      .split(",")
      .map((candidate) => candidate.trim())
      .filter(Boolean);

    const payload: SaveManagedProductDto = {
      id: editingId ?? undefined,
      businessId,
      name,
      description,
      forSale,
      showInStore,
      available,
      price: parsedPrice,
      stock: parsedStock,
      image: image.trim() || undefined,
      images: parsedExtraImages,
      costPerItem: null,
      barcode: null,
      categoryId: null,
      variants: mappedVariants(),
    };

    setSaving(true);
    setError(null);

    try {
      await service.saveProduct(payload, token);
      resetForm();
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar producto.");
    } finally {
      setSaving(false);
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
      setPrice(String(detail.price ?? 0));
      setStock(String(detail.stock ?? 0));
      setForSale(detail.forSale);
      setShowInStore(detail.showInStore);
      setAvailable(detail.available);
      setImage(detail.image ?? "");
      setExtraImages(detail.images.join(", "));
      setVariants(
        detail.variants.map((variant, index) => ({
          key: `${detail.id}-${index}`,
          description: variant.description ?? "",
          price: variant.price == null ? "" : String(variant.price),
          stock: variant.stock == null ? "" : String(variant.stock),
          barcode: variant.barcode ?? "",
          color: variant.color ?? "",
        })),
      );
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el producto para edición.");
    }
  };

  const handleArchive = async (productId: number) => {
    if (!token) {
      setError("Token es obligatorio para eliminar/archivar.");
      return;
    }

    setArchivingId(productId);
    setError(null);

    try {
      await service.archiveProduct(productId, token);
      if (editingId === productId) {
        resetForm();
      }
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar/archivar producto.");
    } finally {
      setArchivingId(null);
    }
  };

  const updateVariant = (key: string, field: keyof VariantFormVm, value: string) => {
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant)));
  };

  const removeVariant = (key: string) => {
    setVariants((current) => current.filter((variant) => variant.key !== key));
  };

  return (
    <PosV2Shell title="Productos" subtitle="Catálogo moderno para operar tu POS de forma rápida.">
      <section className="pos-v2-products">
        <header className="pos-v2-products__header">
          <div>
            <h2>Gestión de productos</h2>
            <p>Crea, edita, archiva y administra variantes con una interfaz moderna y responsiva.</p>
          </div>

          <button type="button" className="pos-v2-products__refresh" onClick={loadProducts} disabled={loading || !token || !businessId}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        <section className="pos-v2-products__stats" aria-label="Resumen de productos">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Activos</span>
            <strong>{stats.active}</strong>
          </article>
          <article>
            <span>Archivados</span>
            <strong>{stats.archived}</strong>
          </article>
          <article>
            <span>Con variantes</span>
            <strong>{stats.withVariants}</strong>
          </article>
        </section>

        <section className="pos-v2-products__layout">
          <form className="pos-v2-products__form" onSubmit={handleSubmit}>
            <h3>{editingId ? `Editar #${editingId}` : "Nuevo producto"}</h3>

            <div className="pos-v2-products__field-grid">
              <label>
                Business ID
                <input type="number" value={businessId || ""} onChange={(event) => setBusinessId(Number(event.target.value))} />
              </label>

              <label>
                Token
                <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="JWT token" />
              </label>
            </div>

            <label>
              Nombre
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Hamburguesa clásica" required />
            </label>

            <label>
              Descripción
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe el producto"
                rows={3}
                required
              />
            </label>

            <div className="pos-v2-products__field-grid">
              <label>
                Precio
                <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
              </label>

              <label>
                Stock
                <input type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
              </label>
            </div>

            <div className="pos-v2-products__field-grid">
              <label>
                Imagen principal (URL)
                <input value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
              </label>

              <label>
                Imágenes extra (URL, separadas por coma)
                <input
                  value={extraImages}
                  onChange={(event) => setExtraImages(event.target.value)}
                  placeholder="https://img1, https://img2"
                />
              </label>
            </div>

            <div className="pos-v2-products__toggles">
              <label className="pos-v2-products__toggle-card">
                <input type="checkbox" checked={forSale} onChange={(event) => setForSale(event.target.checked)} />
                <span>A la venta</span>
              </label>
              <label className="pos-v2-products__toggle-card">
                <input type="checkbox" checked={showInStore} onChange={(event) => setShowInStore(event.target.checked)} />
                <span>Mostrar en tienda</span>
              </label>
              <label className="pos-v2-products__toggle-card">
                <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
                <span>Disponible</span>
              </label>
            </div>

            <div className="pos-v2-products__variants">
              <div className="pos-v2-products__variants-head">
                <h4>Variantes</h4>
                <button type="button" onClick={() => setVariants((current) => [...current, createVariantDraft()])}>
                  + Agregar variante
                </button>
              </div>

              {variants.length === 0 ? <p className="pos-v2-products__variants-empty">Sin variantes por ahora.</p> : null}

              {variants.map((variant) => (
                <article key={variant.key} className="pos-v2-products__variant-item">
                  <input
                    value={variant.description}
                    onChange={(event) => updateVariant(variant.key, "description", event.target.value)}
                    placeholder="Nombre variante"
                  />
                  <input
                    value={variant.price}
                    onChange={(event) => updateVariant(variant.key, "price", event.target.value)}
                    placeholder="Precio"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <input
                    value={variant.stock}
                    onChange={(event) => updateVariant(variant.key, "stock", event.target.value)}
                    placeholder="Stock"
                    type="number"
                    min="0"
                    step="1"
                  />
                  <input
                    value={variant.color}
                    onChange={(event) => updateVariant(variant.key, "color", event.target.value)}
                    placeholder="Color"
                  />
                  <input
                    value={variant.barcode}
                    onChange={(event) => updateVariant(variant.key, "barcode", event.target.value)}
                    placeholder="Código de barras"
                  />
                  <button type="button" className="is-delete" onClick={() => removeVariant(variant.key)}>Quitar</button>
                </article>
              ))}
            </div>

            <div className="pos-v2-products__form-actions">
              <button type="submit" className="pos-v2-products__primary" disabled={saving}>
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar producto"}
              </button>
              {editingId ? (
                <button type="button" className="pos-v2-products__secondary" onClick={resetForm}>
                  Cancelar edición
                </button>
              ) : null}
            </div>

            {error ? <p className="pos-v2-products__error" role="alert">{error}</p> : null}
          </form>

          <section className="pos-v2-products__catalog" aria-label="Listado de productos">
            <div className="pos-v2-products__catalog-header">
              <h3>Listado</h3>

              <div className="pos-v2-products__controls">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, ID o descripción"
                  aria-label="Buscar productos"
                />
                <label className="pos-v2-products__switch">
                  <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
                  Mostrar archivados
                </label>
                <div className="pos-v2-products__view-toggle" role="group" aria-label="Cambiar vista">
                  <button type="button" className={viewMode === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
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

            {!loading && visibleProducts.length === 0 ? (
              <p className="pos-v2-products__empty">No hay productos para mostrar con los filtros actuales.</p>
            ) : null}

            {!loading ? (
              <div className={`pos-v2-products__products ${viewMode === "grid" ? "is-grid" : "is-list"}`}>
                {visibleProducts.map((product) => {
                  const preview = toImageUrl(product.image ?? product.images[0] ?? null);

                  return (
                    <article key={product.id} className={`pos-v2-products__card ${!product.available ? "is-archived" : ""}`}>
                      {preview ? (
                        <img src={preview} alt={product.name} className="pos-v2-products__card-image" />
                      ) : (
                        <div className="pos-v2-products__card-image-placeholder" aria-hidden="true">
                          {product.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div className="pos-v2-products__card-content">
                        <div className="pos-v2-products__card-headline">
                          <h4>{product.name}</h4>
                          <span className={product.available ? "is-ok" : "is-muted"}>
                            {product.available ? "Disponible" : "Archivado"}
                          </span>
                        </div>
                        <p>{product.description || `ID: #${product.id}`}</p>
                        <div className="pos-v2-products__card-meta">
                          <strong>{product.price == null ? "--" : `$${product.price.toFixed(2)}`}</strong>
                          <small>Stock: {product.stock ?? "--"}</small>
                        </div>
                        <small className="pos-v2-products__chip-line">
                          {product.forSale ? "Venta: Sí" : "Venta: No"} · {product.showInStore ? "Web: Sí" : "Web: No"} · Variantes: {product.variants.length}
                        </small>
                      </div>

                      <div className="pos-v2-products__card-actions">
                        <button type="button" className="is-edit" onClick={() => handleEdit(product.id)}>Editar</button>
                        {product.available ? (
                          <button
                            type="button"
                            onClick={() => handleArchive(product.id)}
                            disabled={archivingId === product.id}
                          >
                            {archivingId === product.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        </section>
      </section>
    </PosV2Shell>
  );
};
