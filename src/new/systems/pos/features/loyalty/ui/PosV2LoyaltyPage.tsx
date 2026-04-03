import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./PosV2LoyaltyPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const QR_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const randomChunk = (length: number): string => Array.from({ length }, () => QR_ALPHABET[Math.floor(Math.random() * QR_ALPHABET.length)]).join("");
const buildCouponQrCode = (): string => `QR-${randomChunk(5)}-${randomChunk(4)}`;
const pad = (value: number): string => String(value).padStart(2, "0");
const toLegacyDateTime = (value: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const isCouponActive = (coupon: { maxRedemptions: number; totalUsers: number; valid: string }) => {
  const availableByLimit = Number(coupon.totalUsers) < Number(coupon.maxRedemptions);
  if (!coupon.valid) return availableByLimit;
  const expiration = new Date(coupon.valid);
  if (Number.isNaN(expiration.getTime())) return availableByLimit;
  return availableByLimit && expiration.getTime() >= Date.now();
};

export const PosV2LoyaltyPage = () => {
  const location = useLocation();
  const [session] = useState(() => {
    const snapshot = readPosSessionSnapshot();
    return {
      ...snapshot,
      hasSession: snapshot.token.length > 0 && Number.isFinite(snapshot.businessId) && snapshot.businessId > 0,
    };
  });
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("10");
  const [validDateTime, setValidDateTime] = useState("");
  const [topClientsSort, setTopClientsSort] = useState<"mostFrequent" | "leastFrequent">("mostFrequent");
  const [visitLog, setVisitLog] = useState<Array<{ userId: number; userName: string; date: string; visitCount: number; totalVisits: number }>>([]);
  const [couponList, setCouponList] = useState<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string }>>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [coupon, setCoupon] = useState<{ id: number; qr?: string; description: string; maxRedemptions: number; valid?: string } | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{ name: string; phone: string; address: string; plan: string; chargesEnabled: boolean } | null>(null);
  const [couponDescriptionQuery, setCouponDescriptionQuery] = useState("");
  const [visitQuery, setVisitQuery] = useState("");
  const [isVisitFilterOpen, setIsVisitFilterOpen] = useState(false);
  const [visitQrQuantity, setVisitQrQuantity] = useState("1");
  const [visitQrTtl, setVisitQrTtl] = useState("60");
  const [visitQrLoading, setVisitQrLoading] = useState(false);
  const [visitQrTokens, setVisitQrTokens] = useState<Array<{ token: string; qrUrl: string }>>([]);
  const [dynamicQrLoading, setDynamicQrLoading] = useState(false);
  const [dynamicQr, setDynamicQr] = useState<{ token: string; qrUrl: string; refreshAfterSeconds: number } | null>(null);
  const [couponQrValue, setCouponQrValue] = useState("");
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isTopClientsModalOpen, setIsTopClientsModalOpen] = useState(false);
  const [modalCouponQuery, setModalCouponQuery] = useState("");
  const [printerFormat, setPrinterFormat] = useState<"58" | "80">("80");
  const [couponEditing, setCouponEditing] = useState<{ id: number; qr: string; description: string; maxRedemptions: string; validDateTime: string } | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createLoyaltyPage();
  }, []);

  const loyaltyView: "coupons" | "visits" | "all" = useMemo(() => {
    if (location.pathname === POS_V2_PATHS.coupons) return "coupons";
    if (location.pathname === POS_V2_PATHS.visits) return "visits";
    return "all";
  }, [location.pathname]);

  const subtitle = loyaltyView === "coupons"
    ? "Cupones"
    : loyaltyView === "visits"
      ? "Visitas"
      : "Fidelidad";

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!session.hasSession) {
      setError("No hay sesión activa para crear cupones.");
      return;
    }

    const qr = couponQrValue || buildCouponQrCode();
    const safeDescription = description.trim();
    const maxRedemptions = Number(limitUsers);

    if (safeDescription.length < 3 || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa solo los campos obligatorios: descripción (mín. 3) y límite de canjes.");
      return;
    }

    setSavingCoupon(true);
    setError(null);
    setToast("");

    try {
      const created = await page.createCoupon(
        session.businessId,
        { qr, description: safeDescription, maxRedemptions, valid: toLegacyDateTime(validDateTime) },
        session.token,
      );
      setCoupon(created);
      setToast("Cupón de fidelidad creado correctamente.");
      setDescription("");
      setLimitUsers("10");
      setValidDateTime("");
      setCouponQrValue(created.qr || qr);
    } catch {
      setError("No fue posible crear el cupón de fidelidad.");
    } finally {
      setSavingCoupon(false);
    }
  };

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "visits")) return;
    setLoadingVisits(true);
    page.getVisitHistory(session.businessId, session.token)
      .then((history) => setVisitLog(history))
      .catch(() => setVisitLog([]))
      .finally(() => setLoadingVisits(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  useEffect(() => {
    if (!session.hasSession) return;

    fetch(new URL(`business/${session.businessId}`, API_BASE_URL).toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json() as Record<string, unknown>;
        setBusinessInfo({
          name: String(payload.Name ?? payload.name ?? `Negocio #${session.businessId}`),
          phone: String(payload.PhoneNumber ?? payload.phoneNumber ?? "No disponible"),
          address: String(payload.Address ?? payload.address ?? "No disponible"),
          plan: String(payload.Plan ?? payload.plan ?? "No definido"),
          chargesEnabled: Number(payload.ChargesEnabled ?? payload.chargesEnabled ?? 0) === 1,
        });
      })
      .catch(() => setBusinessInfo(null));
  }, [session.businessId, session.hasSession, session.token]);

  const groupedCoupons = useMemo(() => ({
    actives: couponList.filter((entry) => isCouponActive(entry)),
    inactives: couponList.filter((entry) => !isCouponActive(entry)),
  }), [couponList]);

  const filteredCoupons = useMemo(() => {
    const term = couponDescriptionQuery.trim().toLowerCase();
    if (!term) return couponList;
    return couponList.filter((entry) => entry.description.toLowerCase().includes(term));
  }, [couponDescriptionQuery, couponList]);

  const visitsSummary = useMemo(() => {
    const totalVisits = visitLog.reduce((acc, visit) => acc + Number(visit.visitCount || 0), 0);
    const customers = new Set(visitLog.map((visit) => visit.userId).filter((id) => id > 0));
    return {
      totalVisits,
      uniqueCustomers: customers.size,
    };
  }, [visitLog]);

  const topClients = useMemo(() => {
    const byUser = new Map<number, { userId: number; userName: string; totalVisits: number; lastVisit?: string }>();
    visitLog.forEach((visit) => {
      const current = byUser.get(visit.userId) || {
        userId: visit.userId,
        userName: visit.userName || `Cliente ${visit.userId}`,
        totalVisits: 0,
        lastVisit: "",
      };
      current.totalVisits = Math.max(current.totalVisits, Number(visit.totalVisits || 0), Number(visit.visitCount || 0));
      current.lastVisit = visit.date;
      byUser.set(visit.userId, current);
    });
    const normalized = Array.from(byUser.values());
    return normalized
      .sort((a, b) => (topClientsSort === "mostFrequent" ? b.totalVisits - a.totalVisits : a.totalVisits - b.totalVisits))
      .slice(0, 8);
  }, [topClientsSort, visitLog]);

  const maxTopVisits = useMemo(
    () => topClients.reduce((max, item) => Math.max(max, Number(item.totalVisits || 0)), 0),
    [topClients],
  );

  const filteredVisits = useMemo(() => {
    const term = visitQuery.trim().toLowerCase();
    if (!term) return visitLog;
    return visitLog.filter((visit) =>
      `${visit.userName} ${visit.userId}`.toLowerCase().includes(term),
    );
  }, [visitLog, visitQuery]);

  const visitsByCustomer = useMemo(() => {
    return [...topClients].slice(0, 10);
  }, [topClients]);

  const defaultDomain = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "https://ravekh.com";
  }, []);

  const couponsDomain = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.hostname.includes("localhost") ? "http://localhost:5173" : "https://ravekh.com";
    }
    return "https://ravekh.com";
  }, []);

  const currentCouponLink = useMemo(() => {
    if (!coupon) return "";
    const suffix = coupon.id || coupon.qr;
    return suffix ? `${couponsDomain}/cupones/${suffix}` : "";
  }, [coupon, couponsDomain]);

  const couponQrDisplayValue = useMemo(() => {
    if (currentCouponLink) return currentCouponLink;
    if (coupon?.qr) return coupon.qr;
    return couponQrValue;
  }, [coupon?.qr, couponQrValue, currentCouponLink]);

  const handlePrintCouponQr = () => {
    const value = couponQrDisplayValue;
    if (!value) return;
    const printWindow = window.open("", "_blank", "width=420,height=720");
    if (!printWindow) return;
    const qrImage = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(value)}" width="220" height="220" alt="QR" />`;
    printWindow.document.write(`<!doctype html><html><head><title>Imprimir cupón</title></head><body><div style="text-align:center;font-family:Arial;padding:16px;">${qrImage}<p style="font-size:12px;word-break:break-all;">${value}</p></div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const printVisitTicket = (qrValue: string, title = "QR visita") => {
    if (!qrValue) return;
    const printWindow = window.open("", "_blank", "width=420,height=720");
    if (!printWindow) return;
    const qrImage = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrValue)}" width="220" height="220" alt="QR" />`;
    printWindow.document.write(`<!doctype html><html><head><title>${title}</title><style>@page{size:${printerFormat}mm auto;margin:4mm;}body{font-family:Arial;text-align:center;}h3{font-size:14px;}</style></head><body><h3>${title}</h3>${qrImage}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePrintVisitBatch = () => {
    const values = visitQrTokens
      .map((item) => item.qrUrl || (item.token ? `${couponsDomain}/visit/redeem?token=${encodeURIComponent(item.token)}` : ""))
      .filter(Boolean);
    if (!values.length) return;
    const printWindow = window.open("", "_blank", "width=520,height=900");
    if (!printWindow) return;
    const cards = values.map((value, index) => `<div style="border:1px dashed #cbd5e1;border-radius:8px;padding:8px;margin-bottom:8px;text-align:center;"><p style="font-size:12px;margin:4px 0;">QR ${index + 1}</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}" width="180" height="180" alt="QR"/></div>`).join("");
    printWindow.document.write(`<!doctype html><html><head><title>Lote QR visitas</title><style>@page{size:${printerFormat}mm auto;margin:4mm;}body{font-family:Arial;}</style></head><body>${cards}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleUpdateCoupon = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession || !couponEditing) return;
    const maxRedemptions = Number(couponEditing.maxRedemptions);
    if (!couponEditing.description.trim() || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa correctamente la edición del cupón.");
      return;
    }

    try {
      const updated = await page.updateCoupon(
        couponEditing.id,
        session.businessId,
        {
          qr: couponEditing.qr,
          description: couponEditing.description.trim(),
          maxRedemptions,
          valid: toLegacyDateTime(couponEditing.validDateTime),
        },
        session.token,
      );

      setCouponList((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setCoupon((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
      setCouponEditing(null);
      setToast("Cupón actualizado correctamente.");
    } catch {
      setError("No se pudo actualizar el cupón.");
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!session.hasSession) return;
    setDeletingCouponId(couponId);
    try {
      await page.deleteCoupon(couponId, session.token);
      setCouponList((prev) => prev.filter((item) => item.id !== couponId));
      setCoupon((prev) => (prev?.id === couponId ? null : prev));
      setToast("Cupón eliminado correctamente.");
    } catch {
      setError("No se pudo eliminar el cupón.");
    } finally {
      setDeletingCouponId(null);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "coupons")) return;
    setLoadingCoupons(true);
    page.listCoupons(session.businessId, session.token)
      .then((coupons) => setCouponList(coupons))
      .catch(() => setCouponList([]))
      .finally(() => setLoadingCoupons(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  const handleGenerateVisitQrs = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession) {
      setError("No hay sesión activa para generar QR de visitas.");
      return;
    }

    const quantity = Number(visitQrQuantity);
    const ttlMinutes = Number(visitQrTtl);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
      setError("Cantidad y vigencia deben ser mayores a 0.");
      return;
    }

    setVisitQrLoading(true);
    setError(null);
    try {
      const domain = defaultDomain;
      const tokens = await page.generateVisitQrs(session.businessId, { quantity, ttlMinutes, domain }, session.token);
      setVisitQrTokens(tokens);
      setToast(`Se generaron ${tokens.length} QR de visitas.`);
    } catch {
      setVisitQrTokens([]);
      setError("No se pudieron generar los QR de visitas.");
    } finally {
      setVisitQrLoading(false);
    }
  };

  const handleGenerateDynamicQr = async () => {
    if (!session.hasSession) {
      setError("No hay sesión activa para generar QR dinámico.");
      return;
    }

    setDynamicQrLoading(true);
    setError(null);
    try {
      const nextQr = await page.generateDynamicVisitQr(session.businessId, defaultDomain, session.token);
      setDynamicQr(nextQr);
      setToast("QR dinámico actualizado correctamente.");
    } catch {
      setDynamicQr(null);
      setError("No se pudo generar el QR dinámico.");
    } finally {
      setDynamicQrLoading(false);
    }
  };

  return (
    <PosV2Shell title="Fidelidad" subtitle={subtitle}>
      <section className="pos-v2-loyalty">
        {!session.hasSession ? <p className="pos-v2-loyalty__error">No hay sesión activa para usar fidelidad.</p> : null}
        {error ? <p className="pos-v2-loyalty__error">{error}</p> : null}
        {toast ? <p className="pos-v2-loyalty__toast pos-v2-loyalty__toast-floating">{toast}</p> : null}


        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <div className="pos-v2-loyalty__header-actions">
            <h2>Cupones</h2>
            <div className="pos-v2-loyalty__quick-actions">
              <button type="button" onClick={() => setIsCouponsModalOpen(true)}>Mis cupones</button>
            </div>
          </div>
          <div className="pos-v2-loyalty__kpis">
            <p><strong>{couponList.length}</strong><span>Totales</span></p>
            <p><strong>{groupedCoupons.actives.length}</strong><span>Activos</span></p>
            <p><strong>{groupedCoupons.inactives.length}</strong><span>Inactivos</span></p>
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Crear cupón</h2>
          <form onSubmit={handleCreate} className="pos-v2-loyalty__form">
            <p className="pos-v2-loyalty__hint">Descripción y límite son obligatorios. QR automático.</p>
            <label>
              Descripción del beneficio <span>*</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. 2x1 en bebidas" required />
            </label>
            <label>
              Límite de canjes <span>*</span>
              <input value={limitUsers} inputMode="numeric" onChange={(event) => setLimitUsers(event.target.value.replace(/[^\d]/g, ""))} placeholder="Ej. 20" required />
            </label>
            <label>
              Vigencia (opcional)
              <input type="datetime-local" value={validDateTime} onChange={(event) => setValidDateTime(event.target.value)} />
            </label>
            <button type="submit" disabled={savingCoupon}>{savingCoupon ? "Guardando..." : "Crear cupón"}</button>
          </form>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <h2>Detalle actual</h2>
          {!coupon ? <p>No hay cupón seleccionado.</p> : (
            <div className="pos-v2-loyalty__detail">
              <p><strong>ID:</strong> {coupon.id}</p>
              <p><strong>Descripción:</strong> {coupon.description}</p>
              <p><strong>Límite:</strong> {coupon.maxRedemptions} canjes</p>
              <p><strong>QR:</strong> <span className="pos-v2-loyalty__code">{coupon.qr || couponQrValue || "N/A"}</span></p>
              {coupon.valid ? <p><strong>Vigencia:</strong> {new Date(coupon.valid).toLocaleString("es-MX")}</p> : null}
              {couponQrDisplayValue ? (
                <div className="pos-v2-loyalty__coupon-qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(couponQrDisplayValue)}`}
                    alt="QR de cupón"
                    width={170}
                    height={170}
                  />
                  <p>{couponQrDisplayValue}</p>
                  <div className="pos-v2-loyalty__quick-actions">
                    <button type="button" onClick={handlePrintCouponQr}>Imprimir QR</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </article> : null}

       

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Resumen de visitas</h2>
          <div className="pos-v2-loyalty__kpis">
            <p><strong>{visitsSummary.totalVisits}</strong><span>Visitas registradas</span></p>
            <p><strong>{visitsSummary.uniqueCustomers}</strong><span>Clientes únicos</span></p>
            <p><strong>{topClients.length}</strong><span>Top clientes</span></p>
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <div className="pos-v2-loyalty__header-actions">
            <h2>Generación QR visitas</h2>
            <div className="pos-v2-loyalty__tabs" aria-label="Formato de impresión">
              <button type="button" className={printerFormat === "58" ? "is-active" : ""} onClick={() => setPrinterFormat("58")}>58 mm</button>
              <button type="button" className={printerFormat === "80" ? "is-active" : ""} onClick={() => setPrinterFormat("80")}>80 mm</button>
            </div>
          </div>
          <form className="pos-v2-loyalty__form" onSubmit={handleGenerateVisitQrs}>
            <label>
              Cantidad de QR
              <input value={visitQrQuantity} onChange={(event) => setVisitQrQuantity(event.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <label>
              Vigencia en minutos
              <input value={visitQrTtl} onChange={(event) => setVisitQrTtl(event.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <button type="submit" disabled={visitQrLoading}>{visitQrLoading ? "Generando..." : "Generar QR de visitas"}</button>
            <button type="button" onClick={handlePrintVisitBatch} disabled={visitQrTokens.length === 0}>Imprimir lote de QR</button>
          </form>
          <div className="pos-v2-loyalty__detail">
            {visitQrTokens.slice(0, 5).map((item, index) => {
              const qrValue = item.qrUrl || (item.token ? `${couponsDomain}/visit/redeem?token=${encodeURIComponent(item.token)}` : "");
              return (
                <article key={`${item.token}-${index}`} className="pos-v2-loyalty__row-card">
                  <div className="pos-v2-loyalty__coupon-qr">
                    {qrValue ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(qrValue)}`}
                        alt="QR de visita"
                        width={170}
                        height={170}
                      />
                    ) : null}
                    <p>Token: <span className="pos-v2-loyalty__code">{item.token || "-"}</span></p>
                    <p className="pos-v2-loyalty__code">{qrValue || "Sin URL"}</p>
                    <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={() => printVisitTicket(qrValue, `Ticket visita #${index + 1}`)}>Imprimir ticket</button>
                  </div>
                </article>
              );
            })}
            {!visitQrLoading && visitQrTokens.length === 0 ? <p>Aún no hay QR generados en esta sesión.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>QR dinámico</h2>
          <div className="pos-v2-loyalty__quick-actions">
            <button type="button" onClick={handleGenerateDynamicQr} disabled={dynamicQrLoading}>
              {dynamicQrLoading ? "Actualizando..." : "Generar siguiente QR dinámico"}
            </button>
          </div>
          <div className="pos-v2-loyalty__detail">
            {!dynamicQr ? <p>No hay QR dinámico generado aún.</p> : (
              <>
                <div className="pos-v2-loyalty__meta">
                  <strong>Token:</strong>
                  <span className="pos-v2-loyalty__code pos-v2-loyalty__code--block">{dynamicQr.token || "-"}</span>
                </div>
                <div className="pos-v2-loyalty__meta">
                  <strong>URL:</strong>
                  <span className="pos-v2-loyalty__code pos-v2-loyalty__code--block">{dynamicQr.qrUrl}</span>
                </div>
                <p><strong>Renueva en:</strong> {dynamicQr.refreshAfterSeconds}s</p>
                <div className="pos-v2-loyalty__coupon-qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(dynamicQr.qrUrl)}`}
                    alt="QR dinámico"
                    width={170}
                    height={170}
                  />
                </div>
              </>
            )}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Top clientes fieles</h2>
          <div className="pos-v2-loyalty__header-actions">
            <p className="pos-v2-loyalty__caption">Aquí podrás ver el top de tus clientes fieles.</p>
            <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={() => setIsVisitFilterOpen(true)}>
              Filtrar orden
            </button>
            <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={() => setIsTopClientsModalOpen(true)}>
              Pantalla top clientes
            </button>
          </div>
          <div className="pos-v2-loyalty__detail">
            {topClients.map((visit) => (
              <article key={`top-${visit.userId}`} className="pos-v2-loyalty__row-card">
                <div className="pos-v2-loyalty__row-head">
                  <p>{visit.userName}</p>
                  <strong>{visit.totalVisits} visita(s)</strong>
                </div>
                <div className="pos-v2-loyalty__progress" aria-hidden="true">
                  <span
                    style={{ width: `${maxTopVisits > 0 ? Math.round((visit.totalVisits / maxTopVisits) * 100) : 0}%` }}
                  />
                </div>
                <small>Última visita: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleDateString("es-MX") : "N/A"}</small>
              </article>
            ))}
            {!loadingVisits && topClients.length === 0 ? <p>Aún no hay datos para top de clientes.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Visitas totales por cliente</h2>
          <div className="pos-v2-loyalty__detail">
            {visitsByCustomer.map((item) => (
              <p key={`total-${item.userId}`}>
                {item.userName} · <strong>{item.totalVisits}</strong> visita(s)
              </p>
            ))}
            {!loadingVisits && visitsByCustomer.length === 0 ? <p>No hay visitas registradas todavía.</p> : null}
          </div>
        </article> : null}

        {(loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <h2>Historial de visitas</h2>
          <div className="pos-v2-loyalty__form">
            <label>
              Buscar cliente por nombre/ID
              <input value={visitQuery} onChange={(event) => setVisitQuery(event.target.value)} placeholder="Ej. Juan o 123" />
            </label>
          </div>
          <div className="pos-v2-loyalty__detail">
            <p><strong>Historial:</strong> {loadingVisits ? "cargando..." : `${filteredVisits.length} registro(s)`}</p>
            {filteredVisits.slice(0, 8).map((visit, index) => (
              <p key={`${visit.userId}-${visit.date}-${index}`}>
                {visit.userName || `Usuario ${visit.userId || "-"}`} · +{visit.visitCount} visita(s) · Total: {visit.totalVisits} · {new Date(visit.date).toLocaleString("es-MX")}
              </p>
            ))}
            {!loadingVisits && filteredVisits.length === 0 ? <p>No hay visitas registradas para ese filtro.</p> : null}
          </div>
        </article> : null}
        {isVisitFilterOpen ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Filtros de visitas">
            <div className="pos-v2-loyalty__modal-card">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Ordenar top clientes</h3>
                <button type="button" onClick={() => setIsVisitFilterOpen(false)} aria-label="Cerrar filtros">×</button>
              </div>
              <p>Selecciona cómo quieres ordenar el listado.</p>
              <button
                type="button"
                className={topClientsSort === "mostFrequent" ? "is-active" : ""}
                onClick={() => {
                  setTopClientsSort("mostFrequent");
                  setIsVisitFilterOpen(false);
                }}
              >
                Más frecuentes
              </button>
              <button
                type="button"
                className={topClientsSort === "leastFrequent" ? "is-active" : ""}
                onClick={() => {
                  setTopClientsSort("leastFrequent");
                  setIsVisitFilterOpen(false);
                }}
              >
                Menos frecuentes
              </button>
            </div>
          </section>
        ) : null}

        {isCouponsModalOpen ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Mis cupones">
            <div className="pos-v2-loyalty__modal-card pos-v2-loyalty__modal-card--wide">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Mis cupones</h3>
                <button type="button" onClick={() => setIsCouponsModalOpen(false)} aria-label="Cerrar cupones">×</button>
              </div>
              <form className="pos-v2-loyalty__form">
                <label>
                  Buscar cupón
                  <input
                    value={modalCouponQuery}
                    onChange={(event) => setModalCouponQuery(event.target.value)}
                    placeholder="Descripción"
                  />
                </label>
              </form>
              <p>{loadingCoupons ? "Cargando cupones..." : `${couponList.length} cupón(es) encontrados.`}</p>
              <div className="pos-v2-loyalty__modal-grid">
                {couponList.filter((entry) => entry.description.toLowerCase().includes(modalCouponQuery.trim().toLowerCase())).map((entry) => {
                  const isActive = isCouponActive(entry);
                  const couponLink = `${couponsDomain}/cupones/${entry.id || entry.qr}`;
                  return (
                    <article key={`modal-coupon-${entry.id}-${entry.qr}`} className="pos-v2-loyalty__row-card">
                      <div className="pos-v2-loyalty__row-head">
                        <p>{entry.description || "Cupón"}</p>
                        <strong>{isActive ? "Activo" : "Inactivo"}</strong>
                      </div>
                      <small>{entry.totalUsers}/{entry.maxRedemptions} canjes</small>
                      <small className="pos-v2-loyalty__code">{couponLink}</small>
                      <div className="pos-v2-loyalty__quick-actions">
                        <button
                          type="button"
                          onClick={() => setCouponEditing({
                            id: entry.id,
                            qr: entry.qr,
                            description: entry.description,
                            maxRedemptions: String(entry.maxRedemptions),
                            validDateTime: entry.valid ? new Date(entry.valid).toISOString().slice(0, 16) : "",
                          })}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(entry.id)}
                          disabled={deletingCouponId === entry.id}
                        >
                          {deletingCouponId === entry.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!loadingCoupons && couponList.length === 0 ? <p>No hay cupones creados aún.</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {isTopClientsModalOpen ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Top clientes frecuentes">
            <div className="pos-v2-loyalty__modal-card pos-v2-loyalty__modal-card--wide">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Top clientes frecuentes</h3>
                <button type="button" onClick={() => setIsTopClientsModalOpen(false)} aria-label="Cerrar top clientes">×</button>
              </div>
              <p>Resumen completo de recurrencia y última visita.</p>
              <div className="pos-v2-loyalty__modal-grid">
                {topClients.map((visit) => (
                  <article key={`modal-top-${visit.userId}`} className="pos-v2-loyalty__row-card">
                    <div className="pos-v2-loyalty__row-head">
                      <p>{visit.userName}</p>
                      <strong>{visit.totalVisits}</strong>
                    </div>
                    <small>Última visita: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleString("es-MX") : "N/A"}</small>
                  </article>
                ))}
                {!loadingVisits && topClients.length === 0 ? <p>No hay datos para mostrar.</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {couponEditing ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Editar cupón">
            <div className="pos-v2-loyalty__modal-card">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Editar cupón</h3>
                <button type="button" onClick={() => setCouponEditing(null)} aria-label="Cerrar edición">×</button>
              </div>
              <form className="pos-v2-loyalty__form" onSubmit={handleUpdateCoupon}>
                <label>
                  Descripción
                  <input
                    value={couponEditing.description}
                    onChange={(event) => setCouponEditing((prev) => prev ? { ...prev, description: event.target.value } : prev)}
                  />
                </label>
                <label>
                  Límite de canjes
                  <input
                    value={couponEditing.maxRedemptions}
                    onChange={(event) => setCouponEditing((prev) => prev ? { ...prev, maxRedemptions: event.target.value.replace(/[^\d]/g, "") } : prev)}
                  />
                </label>
                <label>
                  Vigencia (opcional)
                  <input
                    type="datetime-local"
                    value={couponEditing.validDateTime}
                    onChange={(event) => setCouponEditing((prev) => prev ? { ...prev, validDateTime: event.target.value } : prev)}
                  />
                </label>
                <button type="submit">Guardar cambios</button>
              </form>
            </div>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
