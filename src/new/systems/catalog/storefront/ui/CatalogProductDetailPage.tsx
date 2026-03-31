import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi } from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import { StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import "./CatalogProductDetailPage.css";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export const CatalogProductDetailPage = () => {
  const navigate = useNavigate();
  const { productId = "", phone = "" } = useParams<{ productId: string; phone: string }>();
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
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
      } finally {
        setLoading(false);
      }
    };

    if (productId) void run();
  }, [pageLogic, productId]);

  const addToCart = () => {
    if (!product) return;
    const key = `catalog-v2-cart:${product.businessId}`;
    const raw = window.localStorage.getItem(key);
    const current = raw ? (JSON.parse(raw) as StorefrontCartItem[]) : [];
    const existing = current.find((item) => item.productId === product.id);
    const updated = existing
      ? current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...current, { productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];

    window.localStorage.setItem(key, JSON.stringify(updated));

    navigate(`/v2/catalogo/${product.businessId}`);
  };

  if (loading) return <main className="catalog-v2-detail"><p>Cargando producto...</p></main>;
  if (!product) return <main className="catalog-v2-detail"><p>No encontramos este producto.</p></main>;

  return (
    <main className="catalog-v2-detail">
      <button type="button" className="catalog-v2-detail__back" onClick={() => navigate(`/v2/catalogo/${product.businessId}`)}>← Volver al catálogo</button>

      <section className="catalog-v2-detail__card">
        {product.image ? <img src={product.image} alt={product.name} /> : <div className="catalog-v2-detail__placeholder">Sin imagen</div>}
        <article>
          <h1>{product.name}</h1>
          <p>{product.description || "Sin descripción."}</p>
          <div className="catalog-v2-detail__price">
            {product.promotionPrice && product.promotionPrice > 0 ? (
              <>
                <strong>{money(product.promotionPrice)}</strong>
                <small>{money(product.price)}</small>
              </>
            ) : (
              <strong>{money(product.price)}</strong>
            )}
          </div>
          <div className="catalog-v2-detail__actions">
            <button type="button" onClick={addToCart}>Agregar al carrito</button>
            {phone ? <Link to={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</Link> : null}
          </div>
        </article>
      </section>
    </main>
  );
};
