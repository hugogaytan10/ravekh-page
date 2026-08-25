import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { ManagedProduct } from "../model/ManagedProduct";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./ProductsV2PosPage.css";

const PAGE_SIZE = 20;

export const DiscontinuedProductsV2PosPage = () => {
  const navigate = useNavigate();
  const [{ token, businessId }] = useState(() => readPosSessionSnapshot());
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const service = useMemo(
    () => new ModernSystemsFactory(getPosApiBaseUrl()).createPosProductsService(),
    [],
  );

  const loadProducts = async (page = currentPage) => {
    if (!token || !Number.isFinite(businessId) || businessId <= 0) {
      setError("Inicia sesión para consultar los productos descontinuados.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await service.listNoAvailableProductsPaginated(businessId, token, page, PAGE_SIZE);
      setProducts(Array.isArray(response.products) ? response.products : []);
      setCurrentPage(response.pagination.page);
      setPageInput(String(response.pagination.page));
      setTotalPages(Math.max(response.pagination.totalPages, 1));
      setTotalItems(response.pagination.total);
    } catch (cause) {
      setProducts([]);
      setError(cause instanceof Error ? cause.message : "No fue posible cargar los productos descontinuados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts(1);
  }, []);

  const goToPage = (event: FormEvent) => {
    event.preventDefault();
    const requestedPage = Math.min(totalPages, Math.max(1, Number(pageInput) || 1));
    void loadProducts(requestedPage);
  };

  const restoreProduct = async (product: ManagedProduct) => {
    if (!token) return;
    setRestoringId(product.id);
    setError(null);
    setToast(null);
    try {
      await service.restoreProduct(product.id, token);
      const targetPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setToast(`Producto "${product.name}" restaurado correctamente.`);
      await loadProducts(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible restaurar el producto.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <PosV2Shell title="Productos descontinuados" subtitle="Consulta los productos eliminados de tu catálogo.">
      <section className="pos-v2-products">
        <header className="pos-v2-products__header">
          <div>
            <h2>Productos descontinuados</h2>
            <p>Estos productos ya no están disponibles para venta.</p>
          </div>
          <div className="pos-v2-products__header-actions">
            <button type="button" className="pos-v2-products__secondary" onClick={() => navigate(POS_V2_PATHS.products)}>
              ← Volver a productos
            </button>
            <button type="button" className="pos-v2-products__refresh" onClick={() => loadProducts(currentPage)} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        {error ? <p className="pos-v2-products__error" role="alert">{error}</p> : null}
        {toast ? <p className="pos-v2-products__toast is-success" role="status">{toast}</p> : null}

        <section className="pos-v2-products__catalog" aria-label="Productos descontinuados">
          {loading ? (
            <div className="pos-v2-products__skeletons is-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  className="pos-v2-products__skeleton-card"
                  key={`discontinued-skeleton-${index}`}
                  aria-hidden="true"
                >
                  <div className="pos-v2-products__skeleton-media" />
                  <div className="pos-v2-products__skeleton-line" />
                  <div className="pos-v2-products__skeleton-line short" />
                </article>
              ))}
            </div>
          ) : null}

          {!loading && products.length > 0 ? (
            <div className="pos-v2-products__products is-grid">
              {products.map((product) => (
                <article className="pos-v2-products__card is-archived" key={product.id}>
                  {product.image ? (
                    <img className="pos-v2-products__card-image" src={product.image} alt={product.name} />
                  ) : (
                    <div className="pos-v2-products__card-image-placeholder" aria-hidden="true">{product.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="pos-v2-products__card-content">
                    <div className="pos-v2-products__card-headline">
                      <h4>{product.name}</h4>
                      <span className="is-muted">Descontinuado</span>
                    </div>
                    <p className="pos-v2-products__simple-meta">{product.categoryName || "Sin categoría"}</p>
                    <div className="pos-v2-products__card-meta">
                      <strong>{product.price === null ? "Sin precio" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(product.price)}</strong>
                      <small>Stock: {product.stock ?? 0}</small>
                    </div>
                    <div className="pos-v2-products__card-actions">
                      <button
                        type="button"
                        className="is-restore"
                        onClick={() => restoreProduct(product)}
                        disabled={restoringId === product.id}
                      >
                        {restoringId === product.id ? "Restaurando..." : "Restaurar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!loading && products.length === 0 && !error ? <p className="pos-v2-products__empty">No hay productos descontinuados.</p> : null}

          {!loading && products.length > 0 ? (
            <nav className="pos-v2-products__pagination" aria-label="Paginación de productos descontinuados">
              <button type="button" onClick={() => loadProducts(currentPage - 1)} disabled={currentPage <= 1}>Anterior</button>
              <span>Página {currentPage} de {totalPages} · {totalItems} productos</span>
              <form className="pos-v2-products__pagination-goto" onSubmit={goToPage}>
                <label>
                  Ir a
                  <input type="number" min={1} max={totalPages} value={pageInput} onChange={(event) => setPageInput(event.target.value)} aria-label="Ir a página" />
                </label>
                <button type="submit" disabled={totalPages <= 1}>Ir</button>
              </form>
              <button type="button" onClick={() => loadProducts(currentPage + 1)} disabled={currentPage >= totalPages}>Siguiente</button>
            </nav>
          ) : null}
        </section>
      </section>
    </PosV2Shell>
  );
};
