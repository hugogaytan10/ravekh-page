import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../../index";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import "./PosV2TableZonesPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const sanitizeTableName = (value: string): string => value.replace(/\s+/g, " ").replace(/[<>]/g, "").trimStart();

export const PosV2TableZonesPage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [tableZoneId, setTableZoneId] = useState<number | null>(null);
  const [zones, setZones] = useState<Array<{ id: number; name: string; isActive: boolean }>>([]);
  const [isTableOrderEnabled, setIsTableOrderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosTableZonePage();
  }, []);

  const businessId = Number(businessIdInput);
  const cleanToken = token.trim();
  const hasSession = Boolean(cleanToken) && Number.isFinite(businessId) && businessId > 0;

  const loadZones = useCallback(async () => {
    if (!hasSession) {
      setError("Completa token y business id válidos para administrar mesas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cards = await page.getTableZoneCards(businessId, cleanToken, search.trim());
      setZones(cards);
      setIsTableOrderEnabled(cards.length > 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las mesas.");
    } finally {
      setLoading(false);
    }
  }, [businessId, cleanToken, hasSession, page, search]);

  useEffect(() => {
    if (hasSession) {
      loadZones();
    }
  }, [hasSession, loadZones]);

  const handleSaveSession = () => {
    if (!hasSession) {
      setError("Necesitas token y business id válidos.");
      return;
    }

    window.localStorage.setItem(TOKEN_KEY, cleanToken);
    window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    setSuccessMessage("Sesión conectada para gestión de mesas.");
    setError(null);
    loadZones();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!hasSession) {
      setError("Conecta sesión para registrar mesas.");
      return;
    }

    const safeName = sanitizeTableName(name).trim();
    if (safeName.length < 3) {
      setError("El nombre de la mesa debe tener al menos 3 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await page.upsertTableZone(cleanToken, { businessId, name: safeName, isActive: true }, tableZoneId ?? undefined);
      setName("");
      setTableZoneId(null);
      setSuccessMessage(tableZoneId ? "Mesa actualizada correctamente." : "Mesa creada correctamente.");
      await loadZones();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la mesa.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTableOrders = async () => {
    if (!hasSession) {
      setError("Conecta sesión para activar o desactivar pedidos con mesa.");
      return;
    }

    const nextValue = !isTableOrderEnabled;
    setSaving(true);
    setError(null);

    try {
      const result = await page.updateTableOrdersStatus(businessId, nextValue, cleanToken);
      setIsTableOrderEnabled(result);
      setSuccessMessage(result ? "Pedidos con mesa activados." : "Pedidos con mesa desactivados.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el estado de mesas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PosV2Shell title="Mesas" subtitle="Configuración v2 de mesas desacoplada del legacy">
      <section className="pos-v2-table-zones">
        <header className="pos-v2-table-zones__header">
          <div>
            <h2>Mesas y zonas</h2>
            <p>Crea, edita y consulta mesas para pedidos en salón con arquitectura moderna.</p>
          </div>
        </header>

        <section className="pos-v2-table-zones__controls">
          <article>
            <h3>Pedidos con mesa</h3>
            <p>{isTableOrderEnabled ? "Activo" : "Inactivo"}</p>
            <button type="button" onClick={handleToggleTableOrders} disabled={saving || !hasSession}>
              {isTableOrderEnabled ? "Desactivar" : "Activar"}
            </button>
          </article>

          <form onSubmit={handleSubmit}>
            <h3>{tableZoneId ? "Editar mesa" : "Nueva mesa"}</h3>
            <label>
              Nombre
              <input
                value={name}
                onChange={(event) => setName(sanitizeTableName(event.target.value))}
                placeholder="Ej. Mesa terraza"
                maxLength={50}
              />
            </label>
            <button type="submit" disabled={saving || !hasSession}>{saving ? "Guardando..." : tableZoneId ? "Guardar cambios" : "Crear mesa"}</button>
          </form>
        </section>

        <section className="pos-v2-table-zones__list">
          <header>
            <h3>Listado de mesas</h3>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar mesa"
              aria-label="Buscar mesa"
            />
          </header>

          <ul>
            {loading ? (
              <li className="is-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </li>
            ) : null}
            {!loading && zones.length === 0 ? <li className="is-empty">Sin mesas registradas para este negocio.</li> : zones.map((zone) => (
              <li key={zone.id}>
                <div>
                  <strong>{zone.name}</strong>
                  <span>{zone.isActive ? "Activa" : "Inactiva"}</span>
                </div>
                <button type="button" onClick={() => {
                  setTableZoneId(zone.id);
                  setName(zone.name);
                }}>
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </PosV2Shell>
  );
};
