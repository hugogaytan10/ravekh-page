import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2CatalogPage.css";

const API_BASE_URL = getPosApiBaseUrl();

type CatalogProductView = {
  id: number;
  title: string;
  description: string;
};

export const PosV2CatalogPage = () => {
  const [session] = useState(() => {
    const snapshot = readPosSessionSnapshot();
    return {
      ...snapshot,
      hasSession: snapshot.token.length > 0 && Number.isFinite(snapshot.businessId) && snapshot.businessId > 0,
    };
  });

  const [products, setProducts] = useState<CatalogProductView[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createCatalogPage();
  }, []);

  const reload = async () => {
    if (!session.hasSession) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const entries = await page.loadPublishedProducts(session.businessId, session.token);
      setProducts(entries);
    } catch {
      setError("No fue posible cargar el catálogo publicado.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [page, session.businessId, session.hasSession, session.token]);

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();

    if (!session.hasSession) {
      setError("No hay sesión activa para publicar productos.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3 || cleanDescription.length < 6) {
      setError("Agrega un título (mín. 3) y una descripción (mín. 6). ");
      return;
    }

    setSaving(true);
    setError(null);
    setToast("");

    try {
      const created = await page.publishProduct(session.businessId, {
        title: cleanTitle,
        description: cleanDescription,
      }, session.token);
      setProducts((current) => [created, ...current]);
      setToast("Producto publicado en catálogo correctamente.");
      setTitle("");
      setDescription("");
    } catch {
      setError("No pudimos publicar el producto en catálogo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PosV2Shell title="Catálogo" subtitle="Publicación desacoplada para catálogo web con arquitectura moderna.">
      <section className="pos-v2-catalog" aria-label="Catálogo web v2">
        {!session.hasSession ? <p className="pos-v2-catalog__error">No hay sesión activa para gestionar catálogo.</p> : null}
        {error ? <p className="pos-v2-catalog__error">{error}</p> : null}
        {toast ? <p className="pos-v2-catalog__toast">{toast}</p> : null}

        <article className="pos-v2-catalog__card">
          <header>
            <h2>Publicar producto</h2>
            <p>Flujo rápido para mantener catálogo online sin depender de pantallas legacy.</p>
          </header>
          <form className="pos-v2-catalog__form" onSubmit={handlePublish}>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título del producto" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción para catálogo público" rows={3} />
            <button type="submit" disabled={saving}>{saving ? "Publicando..." : "Publicar"}</button>
          </form>
        </article>

        <article className="pos-v2-catalog__card">
          <header>
            <h2>Productos publicados</h2>
            <p>{loading ? "Cargando catálogo..." : `${products.length} producto(s) publicados`}</p>
          </header>
          <div className="pos-v2-catalog__list">
            {products.map((product) => (
              <article key={product.id} className="pos-v2-catalog__item">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <small>ID: {product.id}</small>
              </article>
            ))}
            {!loading && products.length === 0 ? <p>Aún no hay productos publicados.</p> : null}
          </div>
        </article>
      </section>
    </PosV2Shell>
  );
};
