import {CouponBranchScope} from "./CouponBranchScope";
import {couponBranchLabel} from "../../../../loyalty/rewards-management/model/RewardCoupon";
import {buildPosAuthHeaders, onPosBranchUpdated, readActivePosBranchId} from "../../../shared/config/posBranch";
import { FiPlus, FiGrid, FiCamera, FiUsers, FiChevronRight } from "react-icons/fi";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { renderQrAsDataUrl } from "./qrImage";
import { subscribeToDynamicVisitQr } from "../api/dynamicVisitQrStream";
import { WEB_COUPONS_DOMAIN } from "../../../../loyalty/features/coupons/config/couponsEnv";
import { hasPosDynamicVisitsQrModule, hasPosLoyaltyModule } from "../../../shared/config/posLoyaltyPlan";
import { readPosBusinessFeatures } from "../../../shared/config/posFeatureFlags";
import { FeatureUnlockModal, type UnlockFeature } from "../../../shared/ui/FeatureUnlockModal";
import { onPosBusinessUpdated } from "../../../shared/config/posBusinessEvents";
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


const openPrintPreview = ({ title, content, paperMm = "80" }: { title: string; content: string; paperMm?: "58" | "80" }) => {
  const printWindow = window.open("", "_blank", "width=520,height=900");
  if (!printWindow) return;

  const html = `<!doctype html>
  <html>
    <head>
      <title>${title}</title>
      <style>
        :root { font-family: Arial, sans-serif; }
        @page { size: ${paperMm}mm auto; margin: 4mm; }
        body { margin: 0; background: #f1f5f9; color: #0f172a; }
        .preview-actions { position: sticky; top: 0; z-index: 10; background: #0f172a; color: #fff; padding: 10px; display: flex; justify-content: center; }
        .preview-actions button { border: 0; border-radius: 999px; padding: 8px 14px; font-weight: 700; cursor: pointer; background: #22c55e; color: #052e16; }
        .ticket { margin: 12px auto; max-width: ${paperMm === "58" ? "58mm" : "80mm"}; background: #fff; border-radius: 10px; padding: 10px; text-align: center; }
        h3 { margin: 0 0 8px 0; font-size: 14px; }
        p { margin: 6px 0; font-size: 12px; word-break: break-all; }
        img { display: block; margin: 0 auto; width: 220px; height: 220px; }
        @media print {
          body { background: #fff; }
          .preview-actions { display: none; }
          .ticket { margin: 0 auto; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="preview-actions"><button type="button" onclick="window.print()">Imprimir ticket</button></div>
      ${content}
    </body>
  </html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
};

const getVisitCycleProgress = (totalVisits: number, minVisits: number) => {
  const safeMinVisits = Number.isFinite(minVisits) && minVisits > 0 ? minVisits : 0;
  const safeTotalVisits = Number.isFinite(totalVisits) && totalVisits > 0 ? totalVisits : 0;

  if (!safeMinVisits) {
    return {
      minVisits: 0,
      visitsIntoCycle: safeTotalVisits,
      completedRewards: 0,
      progressPercent: 0,
      cycleLabel: `${safeTotalVisits} visita(s)`,
    };
  }

  const visitsIntoCycle = safeTotalVisits % safeMinVisits;
  const completedRewards = Math.floor(safeTotalVisits / safeMinVisits);
  const progressPercent = Math.round((visitsIntoCycle / safeMinVisits) * 100);

  return {
    minVisits: safeMinVisits,
    visitsIntoCycle,
    completedRewards,
    progressPercent,
    cycleLabel: `${visitsIntoCycle} de ${safeMinVisits}`,
  };
};

const isCouponActive = (coupon: { maxRedemptions: number; totalUsers: number; valid: string; branchIds?:number[]|null; branchNames?:string[] }) => {
  const availableByLimit = Number(coupon.totalUsers) < Number(coupon.maxRedemptions);
  if (!coupon.valid) return availableByLimit;
  const expiration = new Date(coupon.valid);
  if (Number.isNaN(expiration.getTime())) return availableByLimit;
  return availableByLimit && expiration.getTime() >= Date.now();
};

export const PosV2LoyaltyPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get("section") || "home";
  const openSection = (value: string) => { setSearchParams(value === "home" ? {} : { section: value }); setError(null); };
  const showSection = (value: string) => loyaltyView === "all" || section === value;
  const [session] = useState(() => {
    const snapshot = readPosSessionSnapshot();
    return {
      ...snapshot,
      hasSession: snapshot.token.length > 0 && Number.isFinite(snapshot.businessId) && snapshot.businessId > 0,
    };
  });
  const [couponBranchIds,setCouponBranchIds]=useState<number[]|null>(null);
  const [description, setDescription] = useState("");
  const [limitUsers, setLimitUsers] = useState("10");
  const [validDateTime, setValidDateTime] = useState("");
  const [topClientsSort, setTopClientsSort] = useState<"mostFrequent" | "leastFrequent">("mostFrequent");
  const [visitLog, setVisitLog] = useState<Array<{ userId: number; userName: string; date: string; visitCount: number; totalVisits: number; minVisits: number }>>([]);
  const [couponList, setCouponList] = useState<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string; branchIds?:number[]|null; branchNames?:string[] }>>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [coupon, setCoupon] = useState<{ id: number; qr?: string; description: string; maxRedemptions: number; valid?: string } | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{ name: string; phone: string; address: string; plan: string; chargesEnabled: boolean; couponsPlan: 0 | 1 | 2 } | null>(null);
  const [businessInfoLoading, setBusinessInfoLoading] = useState(true);
  const [businessInfoError, setBusinessInfoError] = useState<string | null>(null);
  const businessInfoRequestRef = useRef(0);
  const [unlockModal, setUnlockModal] = useState<{ title: string; message: string; buttonText: string; unlockFeature?: UnlockFeature } | null>(null);
  const [couponDescriptionQuery, setCouponDescriptionQuery] = useState("");
  const [branchKey,setBranchKey]=useState(()=>readActivePosBranchId());
  const [historyCustomer,setHistoryCustomer]=useState<{userId:number;userName:string}|null>(null);
  const [customerVisits,setCustomerVisits]=useState<Array<{Id?:number;Date?:string;BranchName?:string|null}>>([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [historyError,setHistoryError]=useState("");
  useEffect(()=>onPosBranchUpdated(branch=>{
    setBranchKey(branch.id);
    dynamicQrVersionRef.current+=1;
    setDynamicQr(null);
    setVisitQrTokens([]);
    setHistoryCustomer(null);
  }),[]);
  useEffect(()=>{
    if(!historyCustomer) return;
    const controller=new AbortController();
    setHistoryLoading(true);setHistoryError("");setCustomerVisits([]);
    fetch(new URL(`visits/user/${historyCustomer.userId}/business/${session.businessId}`,API_BASE_URL),{
      headers:buildPosAuthHeaders(session.token),signal:controller.signal,
    }).then(async response=>{
      if(!response.ok) throw new Error("No se pudo cargar el historial de visitas.");
      const rows=await response.json();
      if(!controller.signal.aborted) setCustomerVisits(Array.isArray(rows)?rows:rows?.visits||[]);
    }).catch(error=>{
      if(!controller.signal.aborted)setHistoryError(error.message);
    }).finally(()=>{if(!controller.signal.aborted)setHistoryLoading(false);});
    return ()=>controller.abort();
  },[historyCustomer,session.businessId,session.token]);
  const [visitQuery, setVisitQuery] = useState("");
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
  const [couponEditing, setCouponEditing] = useState<{ id: number; qr: string; description: string; maxRedemptions: string; validDateTime: string; branchIds:number[]|null } | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null);
  const dynamicQrRequestInFlightRef = useRef(false);
  const dynamicQrVersionRef = useRef(0);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createLoyaltyPage();
  }, []);

  const loyaltyView: "coupons" | "visits" | "all" = useMemo(() => {
    if (location.pathname === POS_V2_PATHS.coupons) return "coupons";
    if (location.pathname === POS_V2_PATHS.visits) return "visits";
    return "all";
  }, [location.pathname]);
  const sections = loyaltyView === "coupons" ? ["home", "create", "detail"] : ["home", "generate", "dynamic", "top"];
  const section = sections.includes(requestedSection) ? requestedSection : "home";

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

    if(couponBranchIds!==null&&!couponBranchIds.length){setError("Selecciona al menos una sucursal.");return;}
    setSavingCoupon(true);
    setError(null);
    setToast("");

    try {
      const created = await page.createCoupon(
        session.businessId,
        { qr, description: safeDescription, maxRedemptions, valid: toLegacyDateTime(validDateTime), branchIds:couponBranchIds },
        session.token,
      );
      setCoupon(created);
      openSection("detail");
      setToast("Cupón de fidelidad creado correctamente.");
      setDescription("");
      setLimitUsers("10");
      setValidDateTime("");
      setCouponQrValue(created.qr || qr);
    } catch(cause) {
      setError(cause instanceof Error?cause.message:"No fue posible crear el cupón de fidelidad.");
    } finally {
      setSavingCoupon(false);
    }
  };

  useEffect(() => {
    if (!session.hasSession || (loyaltyView !== "all" && loyaltyView !== "visits")) return;
    setLoadingVisits(true);
    setVisitError(null);
    page.getVisitHistory(session.businessId, session.token)
      .then((history) => setVisitLog(history))
      .catch((cause) => {
        setVisitLog([]);
        setVisitError(cause instanceof Error ? cause.message : "No se pudieron cargar los clientes frecuentes.");
      })
      .finally(() => setLoadingVisits(false));
  }, [loyaltyView, page, session.businessId, session.hasSession, session.token]);

  const loadBusinessInfo = useCallback(async () => {
    if (!session.hasSession) return;
    const requestId = ++businessInfoRequestRef.current;
    setBusinessInfoLoading(true);
    setBusinessInfoError(null);
    try {
      const response = await fetch(new URL(`business/${session.businessId}`, API_BASE_URL).toString(), {
        headers: { "Content-Type": "application/json", token: session.token, Authorization: `Bearer ${session.token}` },
      });
      if (!response.ok) throw new Error("No se pudieron verificar tus permisos de fidelidad. Intenta nuevamente.");
      const payload = await response.json() as Record<string, unknown>;
      const features = readPosBusinessFeatures(payload);
      if (features.fidelity === null) throw new Error("El negocio no devolvió tus permisos de fidelidad. Intenta nuevamente.");
      if (requestId !== businessInfoRequestRef.current) return;
      setBusinessInfo({
        name: features.businessName || `Negocio #${session.businessId}`,
        phone: String(payload.PhoneNumber ?? payload.phoneNumber ?? "No disponible"),
        address: String(payload.Address ?? payload.address ?? "No disponible"),
        plan: features.plan || "No definido",
        chargesEnabled: Number(payload.ChargesEnabled ?? payload.chargesEnabled ?? 0) === 1,
        couponsPlan: features.fidelity,
      });
    } catch (cause) {
      if (requestId === businessInfoRequestRef.current) setBusinessInfoError(cause instanceof Error ? cause.message : "No se pudieron verificar tus permisos de fidelidad.");
    } finally {
      if (requestId === businessInfoRequestRef.current) setBusinessInfoLoading(false);
    }
  }, [session.businessId, session.hasSession, session.token]);

  useEffect(() => {
    void loadBusinessInfo();
    const unsubscribe = onPosBusinessUpdated((detail) => {
      if (detail.businessId === session.businessId) void loadBusinessInfo();
    });
    return () => { businessInfoRequestRef.current += 1; unsubscribe(); };
  }, [loadBusinessInfo, session.businessId]);

  const couponsPlan = businessInfo?.couponsPlan ?? null;
  const permissionsReady = !businessInfoLoading && !businessInfoError && couponsPlan !== null;
  const loyaltyModuleEnabled = permissionsReady && couponsPlan !== null && hasPosLoyaltyModule(couponsPlan);
  const dynamicQrModuleEnabled = permissionsReady && couponsPlan !== null && hasPosDynamicVisitsQrModule(couponsPlan);
  const openLoyaltyUnlock = () => {
    setUnlockModal({
      title: "Desbloquea fidelidad",
      message: "Activa las herramientas de fidelidad para crear cupones, registrar visitas y premiar a tus clientes frecuentes.",
      buttonText: "Desbloquear fidelidad",
      unlockFeature: "Fidelity",
    });
  };
  const openDynamicQrUnlock = () => {
    setUnlockModal({
      title: "Desbloquea los QR dinámicos",
      message: "Activa esta función premium para generar QRs dinámicos, automatizar visitas y ofrecer una experiencia más pro a tus clientes.",
      buttonText: "Desbloquear función",
      unlockFeature: "DynamicQr",
    });
  };

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
    const byUser = new Map<number, number>();
    visitLog.forEach((visit) => {
      if (!Number.isFinite(visit.userId) || visit.userId <= 0) return;
      const current = byUser.get(visit.userId) ?? 0;
      byUser.set(visit.userId, Math.max(current, Number(visit.totalVisits || 0), Number(visit.visitCount || 0)));
    });

    const totalVisits = Array.from(byUser.values()).reduce((acc, visits) => acc + visits, 0);
    return {
      totalVisits,
      uniqueCustomers: byUser.size,
    };
  }, [visitLog]);

  const topClients = useMemo(() => {
    const byUser = new Map<number, { userId: number; userName: string; totalVisits: number; minVisits: number; lastVisit?: string }>();
    visitLog.forEach((visit) => {
      const current = byUser.get(visit.userId) || {
        userId: visit.userId,
        userName: visit.userName || `Cliente ${visit.userId}`,
        totalVisits: 0,
        minVisits: 0,
        lastVisit: "",
      };
      current.totalVisits = Math.max(current.totalVisits, Number(visit.totalVisits || 0), Number(visit.visitCount || 0));
      current.minVisits = Math.max(current.minVisits, Number(visit.minVisits || 0));
      current.lastVisit = visit.date;
      byUser.set(visit.userId, current);
    });
    const normalized = Array.from(byUser.values());
    return normalized
      .sort((a, b) => (topClientsSort === "mostFrequent" ? b.totalVisits - a.totalVisits : a.totalVisits - b.totalVisits))
      .slice(0, 8);
  }, [topClientsSort, visitLog]);


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
    const configuredDomain = WEB_COUPONS_DOMAIN.trim();
    if (configuredDomain) return configuredDomain.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "https://ravekh.com";
  }, []);

  const currentCouponLink = useMemo(() => {
    if (!coupon) return "";
    const suffix = coupon.id || coupon.qr;
    return suffix ? `${couponsDomain}/coupons/${suffix}` : "";
  }, [coupon, couponsDomain]);

  const couponQrDisplayValue = useMemo(() => {
    if (currentCouponLink) return currentCouponLink;
    if (coupon?.qr) return coupon.qr;
    return couponQrValue;
  }, [coupon?.qr, couponQrValue, currentCouponLink]);

  const handlePrintCouponQr = () => {
    const value = couponQrDisplayValue;
    if (!value) return;
    const qrImage = `<img src="${renderQrAsDataUrl(value)}" width="220" height="220" alt="QR" />`;
    openPrintPreview({
      title: "Imprimir cupón",
      paperMm: printerFormat,
      content: `<div class="ticket"><h3>Cupón de fidelidad</h3>${qrImage}<p>${value}</p></div>`,
    });
  };

  const printVisitTicket = (qrValue: string, title = "QR visita") => {
    if (!qrValue) return;
    const qrImage = `<img src="${renderQrAsDataUrl(qrValue)}" width="220" height="220" alt="QR" />`;
    openPrintPreview({
      title,
      paperMm: printerFormat,
      content: `<div class="ticket"><h3>${title}</h3>${qrImage}<p>${qrValue}</p></div>`,
    });
  };

  const handlePrintVisitBatch = () => {
    const values = visitQrTokens
      .map((item) => item.qrUrl || (item.token ? `${couponsDomain}/coupons/visits/redeem?token=${encodeURIComponent(item.token)}` : ""))
      .filter(Boolean);
    if (!values.length) return;

    const cards = values
      .map((value, index) => {
        const qrImage = `<img src="${renderQrAsDataUrl(value)}" width="220" height="220" alt="QR" />`;
        return `<div class="ticket"><h3>QR ${index + 1}</h3>${qrImage}<p>${value}</p></div>`;
      })
      .join("");

    openPrintPreview({
      title: "Lote QR visitas",
      paperMm: printerFormat,
      content: cards,
    });
  };

  const handleUpdateCoupon = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession || !couponEditing) return;
    const maxRedemptions = Number(couponEditing.maxRedemptions);
    if (!couponEditing.description.trim() || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0) {
      setError("Completa correctamente la edición del cupón.");
      return;
    }

    if(couponEditing.branchIds!==null&&!couponEditing.branchIds.length){setError("Selecciona al menos una sucursal.");return;}
    try {
      const updated = await page.updateCoupon(
        couponEditing.id,
        session.businessId,
        {
          qr: couponEditing.qr,
          description: couponEditing.description.trim(),
          maxRedemptions,
          valid: toLegacyDateTime(couponEditing.validDateTime),
          branchIds:couponEditing.branchIds,
        },
        session.token,
      );

      setCouponList((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setCoupon((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
      setCouponEditing(null);
      setToast("Cupón actualizado correctamente.");
    } catch(cause) {
      setError(cause instanceof Error?cause.message:"No se pudo actualizar el cupón.");
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
    const state = (location.state as { webCouponRedeemSuccess?: string } | null) ?? null;
    const message = state?.webCouponRedeemSuccess?.trim();
    if (!message) return;
    setToast(message);
  }, [location.state]);

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

  const dynamicQrActive = session.hasSession && dynamicQrModuleEnabled
    && (loyaltyView === "all" || (loyaltyView === "visits" && section === "dynamic"));

  const refreshDynamicQr = useCallback(async () => {
    if (!session.hasSession || dynamicQrRequestInFlightRef.current) return;
    dynamicQrRequestInFlightRef.current = true;
    const version = ++dynamicQrVersionRef.current;
    setDynamicQrLoading(true);
    setError(null);
    try {
      const nextQr = await page.generateDynamicVisitQr(session.businessId, defaultDomain, session.token);
      if (version === dynamicQrVersionRef.current) setDynamicQr(nextQr);
    } catch (cause) {
      if (version !== dynamicQrVersionRef.current) return;
      setDynamicQr(null);
      setError(cause instanceof Error ? cause.message : "No se pudo generar el QR dinámico.");
    } finally {
      dynamicQrRequestInFlightRef.current = false;
      setDynamicQrLoading(false);
    }
  }, [branchKey, defaultDomain, page, session.businessId, session.hasSession, session.token]);

  useEffect(() => {
    if (!dynamicQrActive) return;
    void refreshDynamicQr();
    return subscribeToDynamicVisitQr(API_BASE_URL, session.businessId, (nextQr) => {
      dynamicQrVersionRef.current += 1;
      setDynamicQr(nextQr);
      setError(null);
    });
  }, [branchKey, dynamicQrActive, refreshDynamicQr, session.businessId]);

  useEffect(() => {
    if (!dynamicQrActive || dynamicQrLoading) return;
    const timeoutId = window.setTimeout(() => void refreshDynamicQr(), (dynamicQr?.refreshAfterSeconds ?? 5) * 1000);
    return () => window.clearTimeout(timeoutId);
  }, [dynamicQrActive, dynamicQr, dynamicQrLoading, refreshDynamicQr]);

  const handleGenerateDynamicQr = async () => {
    if (!dynamicQrModuleEnabled) {
      openDynamicQrUnlock();
      return;
    }

    await refreshDynamicQr();
  };

  if (session.hasSession && !permissionsReady) {
    return <PosV2Shell title={subtitle}><section className="pos-v2-loyalty">
      {businessInfoError ? <><p role="alert">{businessInfoError}</p><button type="button" onClick={() => void loadBusinessInfo()}>Reintentar verificación</button></> : <p role="status">Verificando permisos de fidelidad…</p>}
    </section></PosV2Shell>;
  }

  return (
    <PosV2Shell title={subtitle} subtitle={loyaltyView === "coupons" ? "Beneficios para tus clientes" : loyaltyView === "visits" ? "Premia a quienes vuelven" : "Cupones y visitas"}>
      <section className="pos-v2-loyalty">
        {loyaltyView !== "all" && section !== "home" ? <button className="pos-v2-loyalty__ghost-btn" type="button" onClick={() => openSection("home")}>← Volver a {subtitle.toLowerCase()}</button> : null}
        {loyaltyView !== "all" && section === "home" ? <article className="pos-v2-loyalty__home">
          <h2>{loyaltyView === "coupons" ? "Beneficios para tus clientes" : "Premia a quienes vuelven"}</h2>
          <p>{loyaltyView === "coupons" ? "Crea, administra y valida cupones desde un solo lugar." : "Registra visitas y reconoce a tus clientes frecuentes."}</p>
          <div className="pos-v2-loyalty__home-actions">
            <button type="button" onClick={() => loyaltyModuleEnabled ? openSection(loyaltyView === "coupons" ? "create" : "generate") : openLoyaltyUnlock()}>
              <span className="pos-settings__icon"><FiPlus size={20} /></span><span><strong>{loyaltyView === "coupons" ? "Crear cupón" : "Generar QR de visitas"}</strong><small>{loyaltyView === "coupons" ? "Define beneficio, vigencia y límite de uso" : "Crea códigos para registrar visitas"}</small></span><FiChevronRight />
            </button>
            <button type="button" onClick={() => loyaltyModuleEnabled ? (loyaltyView === "coupons" ? setIsCouponsModalOpen(true) : openSection("top")) : openLoyaltyUnlock()}>
              <span className="pos-settings__icon">{loyaltyView === "coupons" ? <FiGrid size={20} /> : <FiUsers size={20} />}</span><span><strong>{loyaltyView === "coupons" ? "Mis cupones" : "Clientes frecuentes"}</strong><small>{loyaltyView === "coupons" ? "Consulta vigencia, usos y disponibilidad" : "Consulta visitas y recompensas"}</small></span><FiChevronRight />
            </button>
            {loyaltyView === "visits" ? <button type="button" onClick={() => openSection("dynamic")}><span className="pos-settings__icon"><FiCamera size={20} /></span><span><strong>QR dinámico</strong><small>Un código que se actualiza automáticamente</small></span><FiChevronRight /></button> : null}
          </div>
        </article> : null}
        {!session.hasSession ? <p className="pos-v2-loyalty__error">No hay sesión activa para usar fidelidad.</p> : null}
        {session.hasSession && !loyaltyModuleEnabled ? <p className="pos-v2-loyalty__error">Tu módulo de fidelidad está bloqueado. Puedes ver las opciones y desbloquearlas cuando quieras.</p> : null}
        {error ? <p className="pos-v2-loyalty__error">{error}</p> : null}
        {toast ? <p className="pos-v2-loyalty__toast pos-v2-loyalty__toast-floating">{toast}</p> : null}


        {!loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "coupons") ? <article className="pos-v2-loyalty__card">
          <div className="pos-v2-loyalty__header-actions">
            <h2>Cupones bloqueados</h2>
            <div className="pos-v2-loyalty__quick-actions">
              <button type="button" onClick={openLoyaltyUnlock}>Desbloquear fidelidad</button>
            </div>
          </div>
          <p>Activa fidelidad para crear cupones, promociones y beneficios para tus clientes frecuentes.</p>
        </article> : null}

        {!loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") ? <article className="pos-v2-loyalty__card">
          <div className="pos-v2-loyalty__header-actions">
            <h2>Visitas bloqueadas</h2>
            <div className="pos-v2-loyalty__quick-actions">
              <button type="button" onClick={openLoyaltyUnlock}>Desbloquear fidelidad</button>
            </div>
          </div>
          <p>Activa las visitas para registrar recurrencia, medir clientes frecuentes y entregar recompensas.</p>
        </article> : null}

        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "coupons") && showSection("home") ? <article className="pos-v2-loyalty__card">
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

        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "coupons") && showSection("create") ? <article className="pos-v2-loyalty__card">
          <h2>Crear cupón</h2>
          <form onSubmit={handleCreate} className="pos-v2-loyalty__form">
            <CouponBranchScope value={couponBranchIds} onChange={setCouponBranchIds} token={session.token}/>
            <p className="pos-v2-loyalty__hint">Descripción y límite son obligatorios. QR automático.</p>
            <label>
              Descripción del beneficio <span>*</span>
              <input autoCorrect="on" spellCheck={true} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. 2x1 en bebidas" required />
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

        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "coupons") && showSection("detail") ? <article className="pos-v2-loyalty__card">
          <h2>Detalle actual</h2>
          {!coupon ? <p>No hay cupón seleccionado.</p> : (
            <div className="pos-v2-loyalty__detail">
              <p><strong>ID:</strong> {coupon.id}</p>
              <p><strong>Descripción:</strong> {coupon.description}</p>
              <p>{couponBranchLabel(coupon.branchIds,coupon.branchNames)}</p>
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



        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") && showSection("home") ? <article className="pos-v2-loyalty__card">
          <h2>Resumen de visitas</h2>
          <div className="pos-v2-loyalty__kpis">
            <p><strong>{visitsSummary.totalVisits}</strong><span>Visitas registradas</span></p>
            <p><strong>{visitsSummary.uniqueCustomers}</strong><span>Clientes únicos</span></p>
            <p><strong>{topClients.length}</strong><span>Top clientes</span></p>
          </div>
        </article> : null}

        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") && showSection("generate") ? <article className="pos-v2-loyalty__card">
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
            {visitQrTokens.map((item, index) => {
              const qrValue = item.qrUrl || (item.token ? `${couponsDomain}/coupons/visits/redeem?token=${encodeURIComponent(item.token)}` : "");
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

        {!dynamicQrModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") && showSection("dynamic") ? <article className="pos-v2-loyalty__card">
          <h2>QR dinámico</h2>
          <p>Desbloquea los QR dinámicos, auto actualización y mayor control de visitas.</p>
          <div className="pos-v2-loyalty__quick-actions">
            <button type="button" onClick={openDynamicQrUnlock}>Desbloquear función</button>
          </div>
        </article> : null}

        {loyaltyModuleEnabled && dynamicQrModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") && showSection("dynamic") ? <article className="pos-v2-loyalty__card pos-v2-loyalty__card--dynamic">
          <h2>QR dinámico</h2>
          <div className="pos-v2-loyalty__quick-actions">
            <button type="button" onClick={handleGenerateDynamicQr} disabled={dynamicQrLoading}>
              {dynamicQrLoading ? "Actualizando..." : "Generar siguiente QR dinámico"}
            </button>
          </div>
          <div className="pos-v2-loyalty__detail">
            {!dynamicQr ? <p role="status">{dynamicQrLoading ? "Generando QR dinámico…" : "No hay un QR disponible. Se volverá a intentar automáticamente."}</p> : (
              <>
                <p>Escanea este QR para registrar una visita. Se actualiza al escanearse y cada {dynamicQr.refreshAfterSeconds} segundos.</p>
                <div className="pos-v2-loyalty__coupon-qr">
                  <img
                    src={renderQrAsDataUrl(dynamicQr.qrUrl)}
                    alt="QR dinámico"
                    width={260}
                    height={260}
                  />
                </div>
              </>
            )}
          </div>
        </article> : null}

        {loyaltyModuleEnabled && (loyaltyView === "all" || loyaltyView === "visits") && showSection("top") ? <article className="pos-v2-loyalty__card">
          <h2>Clientes frecuentes</h2>
          <div className="pos-v2-loyalty__header-actions">
            <p className="pos-v2-loyalty__caption">Aquí podrás ver el top de tus clientes fieles.</p>
            <label>Ordenar por
              <select aria-label="Orden de clientes frecuentes" value={topClientsSort} onChange={(event) => setTopClientsSort(event.target.value as "mostFrequent" | "leastFrequent")}>
                <option value="mostFrequent">Más frecuentes</option><option value="leastFrequent">Menos frecuentes</option>
              </select>
            </label>
            <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={() => setIsTopClientsModalOpen(true)}>
              Pantalla top clientes
            </button>
          </div>
          {loadingVisits ? <p role="status">Cargando clientes frecuentes…</p> : null}
          {visitError ? <p className="pos-v2-loyalty__error" role="alert">{visitError}</p> : null}
          <div className="pos-v2-loyalty__detail">
            {topClients.map((visit) => (
              <article key={`top-${visit.userId}`} className="pos-v2-loyalty__row-card">
                <div className="pos-v2-loyalty__row-head">
                  <p>{visit.userName}</p>
                  <strong>{visit.totalVisits} visita(s)</strong>
                </div>
                <div className="pos-v2-loyalty__progress" aria-hidden="true">
                  <span
                    style={{ width: `${getVisitCycleProgress(visit.totalVisits, visit.minVisits).progressPercent}%` }}
                  />
                </div>
                <small>
                  Ciclo actual: {getVisitCycleProgress(visit.totalVisits, visit.minVisits).cycleLabel}
                  {getVisitCycleProgress(visit.totalVisits, visit.minVisits).minVisits > 0
                    ? ` · recompensa cada ${getVisitCycleProgress(visit.totalVisits, visit.minVisits).minVisits} visitas`
                    : ""}
                </small>
                <small>Última visita: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleDateString("es-MX") : "N/A"}</small>
                <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={()=>{setIsTopClientsModalOpen(false);setHistoryCustomer(visit);}}>Ver visitas y sucursales</button>
              </article>
            ))}
            {!loadingVisits && !visitError && topClients.length === 0 ? <p>Aún no hay datos para top de clientes.</p> : null}
          </div>
        </article> : null}

        <FeatureUnlockModal
          open={Boolean(unlockModal) && permissionsReady && (unlockModal?.unlockFeature === "DynamicQr" ? !dynamicQrModuleEnabled : !loyaltyModuleEnabled)}
          onClose={() => setUnlockModal(null)}
          title={unlockModal?.title}
          message={unlockModal?.message}
          buttonText={unlockModal?.buttonText}
          unlockFeature={unlockModal?.unlockFeature}
        />

        {loyaltyModuleEnabled && isCouponsModalOpen ? (
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
                  const couponLink = `${couponsDomain}/coupons/${entry.id || entry.qr}`;
                  return (
                    <article key={`modal-coupon-${entry.id}-${entry.qr}`} className="pos-v2-loyalty__row-card">
                      <div className="pos-v2-loyalty__row-head">
                        <p>{entry.description || "Cupón"}</p>
                        <strong>{isActive ? "Activo" : "Inactivo"}</strong>
                      </div>
                      <small>{entry.totalUsers}/{entry.maxRedemptions} canjes</small>
                      <small>{couponBranchLabel(entry.branchIds,entry.branchNames)}</small>
                      <small className="pos-v2-loyalty__code">{couponLink}</small>
                      <div className="pos-v2-loyalty__quick-actions">
                        <button type="button" onClick={() => { setCoupon(entry); setIsCouponsModalOpen(false); openSection("detail"); }}>Ver cupón</button>
                        <button
                          type="button"
                          onClick={() => setCouponEditing({
                            id: entry.id,
                            qr: entry.qr,
                            description: entry.description,
                            maxRedemptions: String(entry.maxRedemptions),
                            branchIds:entry.branchIds ?? null,
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
              {loadingVisits ? <p role="status">Cargando clientes frecuentes…</p> : null}
              {visitError ? <p className="pos-v2-loyalty__error" role="alert">{visitError}</p> : null}
              <div className="pos-v2-loyalty__modal-grid">
                {topClients.map((visit) => (
                  <article key={`modal-top-${visit.userId}`} className="pos-v2-loyalty__row-card">
                    <div className="pos-v2-loyalty__row-head">
                      <p>{visit.userName}</p>
                      <strong>{visit.totalVisits}</strong>
                    </div>
                    <small>
                      Ciclo: {getVisitCycleProgress(visit.totalVisits, visit.minVisits).cycleLabel}
                      {getVisitCycleProgress(visit.totalVisits, visit.minVisits).completedRewards > 0
                        ? ` · premios logrados: ${getVisitCycleProgress(visit.totalVisits, visit.minVisits).completedRewards}`
                        : ""}
                    </small>
                    <small>Última visita: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleString("es-MX") : "N/A"}</small>
                    <button type="button" className="pos-v2-loyalty__ghost-btn" onClick={()=>{setIsTopClientsModalOpen(false);setHistoryCustomer(visit);}}>Ver visitas y sucursales</button>
                  </article>
                ))}
                {!loadingVisits && !visitError && topClients.length === 0 ? <p>No hay datos para mostrar.</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {historyCustomer ? (
          <section className="pos-v2-loyalty__modal" role="dialog" aria-modal="true" aria-label="Historial de visitas">
            <div className="pos-v2-loyalty__modal-card">
              <div className="pos-v2-loyalty__modal-head">
                <h3>Visitas de {historyCustomer.userName}</h3>
                <button type="button" onClick={()=>setHistoryCustomer(null)} aria-label="Cerrar historial">×</button>
              </div>
              {historyLoading ? <p role="status">Cargando visitas…</p> : historyError ? <p role="alert">{historyError}</p> : (
                <div className="pos-v2-loyalty__detail">
                  {customerVisits.map((visit,index)=><article key={visit.Id ?? index} className="pos-v2-loyalty__row-card">
                    <p>{visit.BranchName || "Sucursal no registrada"}</p>
                    <small>{visit.Date ? new Date(visit.Date).toLocaleString("es-MX") : "Sin fecha disponible"}</small>
                  </article>)}
                  {!customerVisits.length ? <p>Sin visitas registradas.</p> : null}
                </div>
              )}
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
                <CouponBranchScope value={couponEditing.branchIds} onChange={ids=>setCouponEditing(previous=>previous?{...previous,branchIds:ids}:previous)} token={session.token}/>
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
