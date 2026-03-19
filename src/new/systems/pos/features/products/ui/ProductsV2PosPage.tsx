import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { SaveManagedProductDto } from "../model/ManagedProduct";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const DEFAULT_BUSINESS_ID = Number(import.meta.env.VITE_POS_BUSINESS_ID ?? 0);
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type ProductItemVm = {
  id: number;
  name: string;
  available: boolean;
};

export const ProductsV2PosPage = () => {
  const [businessId, setBusinessId] = useState(() => {
    const storedBusinessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? 0);
    return storedBusinessId || DEFAULT_BUSINESS_ID;
  });
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [products, setProducts] = useState<ProductItemVm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosProductsPage();
  }, []);

  const loadProducts = async () => {
    if (!businessId || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await page.loadProducts(businessId, token);
      setProducts(list);
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

    const payload: SaveManagedProductDto = {
      businessId,
      name,
      description,
      forSale: true,
      showInStore: true,
      available: true,
      price: Number(price),
      stock: Number(stock),
      costPerItem: null,
      barcode: null,
      categoryId: null,
      images: [],
      variants: [],
    };

    setSaving(true);
    setError(null);

    try {
      await page.saveProduct(payload, token);
      setName("");
      setDescription("");
      setPrice("0");
      setStock("0");
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (productId: number) => {
    if (!token) {
      setError("Token es obligatorio para archivar.");
      return;
    }

    try {
      await page.archiveProduct(productId, token);
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo archivar producto.");
    }
  };

  return (
    <PosV2Shell
      title="Productos"
      subtitle="Experiencia UI del POS clásico, implementada en código nuevo."
    >
      <section style={{ display: "grid", gap: "1rem" }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Business ID
          <input type="number" value={businessId || ""} onChange={(event) => setBusinessId(Number(event.target.value))} />
        </label>
        <label>
          Token
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="JWT token" />
        </label>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <h2>Alta de producto</h2>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" required />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" required />
        <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Precio" required />
        <input type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} placeholder="Stock" required />
        <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
      </form>

      {loading ? <p>Cargando productos...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <h2 style={{ marginBottom: 0 }}>Listado</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
            <span>
              #{product.id} · {product.name} · {product.available ? "Disponible" : "Archivado"}
            </span>
            {product.available ? (
              <button type="button" onClick={() => handleArchive(product.id)}>
                Archivar
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      </section>
    </PosV2Shell>
  );
};
