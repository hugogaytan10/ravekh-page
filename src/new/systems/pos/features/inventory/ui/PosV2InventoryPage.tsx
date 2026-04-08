import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2InventoryPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

type SessionState = { token: string; businessId: number; hasSession: boolean };
type InventoryCard = { id: number; name: string; stock: number; price: number; status: "low" | "ok" };

const getSafeSession = (): SessionState => {
  const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
  const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  return { token, businessId, hasSession: token.length > 0 && Number.isFinite(businessId) && businessId > 0 };
};

export const PosV2InventoryPage = () => {
  const [session] = useState(getSafeSession);
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState("8");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [editingCard, setEditingCard] = useState<InventoryCard | null>(null);
  const [newStock, setNewStock] = useState("");

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosInventoryPage();
  }, []);

  const safeThreshold = Math.max(0, Number(threshold || 0));

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cards.filter((card) => (normalized ? card.name.toLowerCase().includes(normalized) : true));
  }, [cards, query]);

  const summary = useMemo(() => {
    const lowStockCount = cards.filter((card) => card.status === "low").length;
    const totalUnits = cards.reduce((acc, card) => acc + Math.max(card.stock, 0), 0);
    const inventoryValue = cards.reduce((acc, card) => acc + Math.max(card.stock, 0) * Math.max(card.price, 0), 0);
    return { lowStockCount, totalUnits, inventoryValue };
  }, [cards]);

  const loadCards = async () => {
    if (!session.hasSession) {
      setError("No hay sesión activa para consultar inventario.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = await page.getInventoryCards(session.businessId, session.token, safeThreshold);
      setCards(rows);
    } catch {
      setCards([]);
      setError("No se pudo cargar el inventario. Verifica token, negocio o disponibilidad del API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.hasSession) {
      loadCards();
    }
  }, [session.hasSession]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const openEditStock = (card: InventoryCard) => {
    setEditingCard(card);
    setNewStock(String(card.stock));
  };

  const submitEditStock = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingCard) return;

    const stockValue = Number(newStock);
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setError("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    setSavingId(editingCard.id);
    setError(null);

    try {
      await page.updateItemStock(editingCard.id, stockValue, session.token);
      setToast(`Stock de ${editingCard.name} actualizado.`);
      setEditingCard(null);
      await loadCards();
    } catch {
      setError("No fue posible actualizar el stock del producto.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <PosV2Shell title="Inventario" subtitle="Control de stock desacoplado del código anterior para operación y pruebas v2.">
      <section className="pos-v2-inventory">
        <header className="pos-v2-inventory__header">
          <div>
            <h2>Inventario operativo</h2>
            <p>Consulta productos, detecta faltantes y ajusta stock por artículo.</p>
          </div>
          <button type="button" onClick={loadCards} disabled={loading}>Actualizar</button>
        </header>

        {!session.hasSession ? <p className="pos-v2-inventory__error">No hay sesión activa. Inicia sesión para administrar inventario.</p> : null}
        {error ? <p className="pos-v2-inventory__error">{error}</p> : null}
        {toast ? <p className="pos-v2-inventory__toast">{toast}</p> : null}

        <section className="pos-v2-inventory__summary" aria-label="Resumen de inventario">
          <article><small>Productos con stock bajo</small><strong>{summary.lowStockCount}</strong></article>
          <article><small>Unidades totales</small><strong>{summary.totalUnits}</strong></article>
          <article><small>Valor aproximado</small><strong>{moneyFormatter.format(summary.inventoryValue)}</strong></article>
        </section>

        <section className="pos-v2-inventory__filters">
          <label>
            Buscar producto
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Café, Hamburguesa..." />
          </label>
          <label>
            Umbral stock bajo
            <input value={threshold} inputMode="numeric" onChange={(event) => setThreshold(event.target.value.replace(/[^\d]/g, ""))} onBlur={() => loadCards()} />
          </label>
        </section>

        <ul className="pos-v2-inventory__list">
          {loading ? <li className="is-empty">Cargando inventario...</li> : null}
          {!loading && filteredCards.map((card) => (
            <li key={card.id}>
              <div>
                <strong>{card.name}</strong>
                <small>{moneyFormatter.format(card.price)} · Stock actual: {card.stock}</small>
              </div>
              <div className="pos-v2-inventory__item-actions">
                <span className={card.status === "low" ? "is-low" : "is-ok"}>{card.status === "low" ? "Stock bajo" : "Stock estable"}</span>
                <button type="button" onClick={() => openEditStock(card)} disabled={savingId === card.id}>Editar</button>
              </div>
            </li>
          ))}
          {!loading && filteredCards.length === 0 ? <li className="is-empty">No hay productos para el filtro seleccionado.</li> : null}
        </ul>

        {editingCard ? (
          <section className="pos-v2-inventory__modal" role="dialog" aria-modal="true" aria-label="Editar stock" onClick={() => setEditingCard(null)}>
            <form onSubmit={submitEditStock} onClick={(event) => event.stopPropagation()}>
              <h3>Editar stock</h3>
              <p>{editingCard.name}</p>
              <label>
                Nuevo stock
                <input value={newStock} inputMode="numeric" onChange={(event) => setNewStock(event.target.value.replace(/[^\d]/g, ""))} />
              </label>
              <div>
                <button type="button" className="is-secondary" onClick={() => setEditingCard(null)}>Cancelar</button>
                <button type="submit" disabled={savingId === editingCard.id}>{savingId === editingCard.id ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
