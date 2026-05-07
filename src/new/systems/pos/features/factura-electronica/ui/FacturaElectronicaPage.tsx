import { useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { getFacturaElectronicaApiBaseUrl, getFacturaElectronicaEnvHelp } from "../config/facturaElectronicaEnv";
import { facturaElectronicaService } from "../services/facturaElectronica.service";
import {
  BillingSetupState,
  BusinessAccount,
  BusinessAccountDraft,
  BusinessAccountSyncRequest,
  CreateInvoiceRequestPayload,
  FacturationStatusResponse,
  InvoiceConceptDraft,
  InvoiceDraft,
  InvoiceFileFormat,
  InvoiceFlowState,
  IssuerFiscalDraft,
  ReceiverDraft,
  TaxIssuer,
  TaxIssuerCreateRequest,
} from "../model/facturaElectronica.types";
import "./FacturaElectronicaPage.css";

type SectionId = "setup" | "invoice";
type ActionId = "bootstrap" | "business" | "issuer" | "csd" | "expeditionPlace" | "series" | "status" | "invoiceRequest" | "issue" | "viewInvoice" | "files";

const DEFAULT_SOURCE_SYSTEM = "ravekh-pos";
const DEFAULT_CURRENCY = "MXN";
const DEFAULT_EXPORTATION = "01";
const DEFAULT_PAYMENT_FORM = "01";
const DEFAULT_PAYMENT_METHOD = "PUE";
const DEFAULT_SERIE = "A";
const GENERIC_PUBLIC_RFC = "XAXX010101000";

const normalizeText = (value: string | undefined): string => (value ?? "").trim();
const normalizeRfc = (value: string | undefined): string => normalizeText(value).toUpperCase();
const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return undefined;
};

const createInitialBusinessDraft = (): BusinessAccountDraft => {
  const session = readPosSessionSnapshot();
  return {
    sourceSystem: DEFAULT_SOURCE_SYSTEM,
    externalBusinessId: session.businessId > 0 ? String(session.businessId) : "",
    businessName: "",
    tradeName: "",
    contactEmail: "",
    contactPhone: "",
    defaultCurrency: DEFAULT_CURRENCY,
  };
};

const createEmptyIssuerDraft = (): IssuerFiscalDraft => ({ rfc: "", legalName: "", tradeName: "", fiscalRegime: "", taxZipCode: "", email: "", phone: "" });
const createEmptyReceiverDraft = (): ReceiverDraft => ({ rfc: "", name: "", fiscalRegime: "", taxZipCode: "", cfdiUse: "" });
const createInitialInvoiceDraft = (employeeId: number): InvoiceDraft => ({
  externalDocumentId: "",
  externalUserId: employeeId > 0 ? String(employeeId) : "",
  paymentForm: DEFAULT_PAYMENT_FORM,
  paymentMethod: DEFAULT_PAYMENT_METHOD,
  currency: DEFAULT_CURRENCY,
  expeditionPlace: "",
  exportation: DEFAULT_EXPORTATION,
  serie: DEFAULT_SERIE,
});
const createInitialConceptDraft = (): InvoiceConceptDraft => ({
  description: "Venta de mostrador",
  productServiceCode: "01010101",
  unitCode: "H87",
  unitName: "Pieza",
  quantity: 1,
  unitPrice: 100,
  taxObject: "02",
  iva16: true,
});

const getEntityId = (entity: unknown, keys: string[]): number | undefined => {
  const candidates = [entity, (entity as { data?: unknown } | null)?.data];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    for (const key of keys) {
      const id = toNumber((candidate as Record<string, unknown>)[key]);
      if (id) return id;
    }
  }
  return undefined;
};

const unwrapArray = <T,>(payload: T[] | { items?: T[]; rows?: T[]; data?: T[] } | undefined): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const buildBusinessPayload = (draft: BusinessAccountDraft): BusinessAccountSyncRequest => ({
  sourceSystem: normalizeText(draft.sourceSystem) || DEFAULT_SOURCE_SYSTEM,
  externalBusinessId: normalizeText(draft.externalBusinessId),
  businessName: normalizeText(draft.businessName),
  tradeName: normalizeText(draft.tradeName) || normalizeText(draft.businessName),
  contactEmail: normalizeText(draft.contactEmail),
  contactPhone: normalizeText(draft.contactPhone),
  defaultCurrency: normalizeText(draft.defaultCurrency) || DEFAULT_CURRENCY,
});

const buildIssuerPayload = (businessAccountId: number, issuerDraft: IssuerFiscalDraft): TaxIssuerCreateRequest => ({
  businessAccountId,
  rfc: normalizeRfc(issuerDraft.rfc),
  legalName: normalizeText(issuerDraft.legalName),
  tradeName: normalizeText(issuerDraft.tradeName),
  fiscalRegime: normalizeText(issuerDraft.fiscalRegime),
  taxZipCode: normalizeText(issuerDraft.taxZipCode),
  email: normalizeText(issuerDraft.email),
  phone: normalizeText(issuerDraft.phone),
  status: "active",
  isDefault: true,
});

const getCurrentCfdiPeriod = (): { months: string; year: string } => {
  const today = new Date();
  return { months: String(today.getMonth() + 1).padStart(2, "0"), year: String(today.getFullYear()) };
};

const calculateTotals = (concept: InvoiceConceptDraft): { subtotal: number; taxesTotal: number; total: number } => {
  const quantity = Number.isFinite(concept.quantity) ? concept.quantity : 0;
  const unitPrice = Number.isFinite(concept.unitPrice) ? concept.unitPrice : 0;
  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const taxesTotal = concept.iva16 ? Number((subtotal * 0.16).toFixed(2)) : 0;
  return { subtotal, taxesTotal, total: Number((subtotal + taxesTotal).toFixed(2)) };
};

const buildInvoiceRequestPayload = (
  businessPayload: BusinessAccountSyncRequest,
  selectedIssuer: TaxIssuer,
  receiverDraft: ReceiverDraft,
  invoiceDraft: InvoiceDraft,
  conceptDraft: InvoiceConceptDraft,
): CreateInvoiceRequestPayload => {
  const totals = calculateTotals(conceptDraft);
  const cfdiPeriod = getCurrentCfdiPeriod();
  const receiverRfc = normalizeRfc(receiverDraft.rfc);
  const receiverName = normalizeText(receiverDraft.name).toUpperCase();

  const shouldAddGlobalInformation =
    receiverRfc === GENERIC_PUBLIC_RFC ||
    receiverName === "PUBLICO EN GENERAL" ||
    receiverName === "PÚBLICO EN GENERAL";

  const issuerEmail = normalizeText(selectedIssuer.email ?? selectedIssuer.Email);
  const issuerPhone = normalizeText(selectedIssuer.phone ?? selectedIssuer.Phone);

  const businessSnapshot: BusinessAccountSyncRequest = {
    ...businessPayload,
    contactEmail:
      normalizeText(businessPayload.contactEmail) ||
      issuerEmail ||
      "contacto@ravekh.com",
    contactPhone:
      normalizeText(businessPayload.contactPhone) ||
      issuerPhone ||
      "0000000000",
  };

  return {
    sourceSystem: DEFAULT_SOURCE_SYSTEM,
    sourceDocumentType: "order",
    externalDocumentId: normalizeText(invoiceDraft.externalDocumentId),
    externalUserId: normalizeText(invoiceDraft.externalUserId),
    business: businessSnapshot,
    issuer: { rfc: normalizeRfc(selectedIssuer.rfc) },

    receiver: {
      rfc: receiverRfc,
      name: normalizeText(receiverDraft.name),
      fiscalRegime: normalizeText(receiverDraft.fiscalRegime),
      taxZipCode: normalizeText(receiverDraft.taxZipCode),
      cfdiUse: normalizeText(receiverDraft.cfdiUse),
    },

    cfdi: {
      type: "I",
      paymentForm: normalizeText(invoiceDraft.paymentForm),
      paymentMethod: normalizeText(invoiceDraft.paymentMethod),
      currency: normalizeText(invoiceDraft.currency),
      exchangeRate: null,
      expeditionPlace: normalizeText(invoiceDraft.expeditionPlace),
      exportation: normalizeText(invoiceDraft.exportation),
      ...(shouldAddGlobalInformation
        ? {
          globalInformation: {
            periodicity: "04",
            months: cfdiPeriod.months,
            year: cfdiPeriod.year,
          },
        }
        : {}),
    },

    totals: {
      subtotal: totals.subtotal,
      discount: 0,
      taxesTotal: totals.taxesTotal,
      total: totals.total,
    },

    concepts: [
      {
        externalItemId: "1",
        productServiceCode: normalizeText(conceptDraft.productServiceCode),
        sku: "VENTA-MOSTRADOR",
        description: normalizeText(conceptDraft.description),
        unitCode: normalizeText(conceptDraft.unitCode),
        unitName: normalizeText(conceptDraft.unitName),
        quantity: conceptDraft.quantity,
        unitPrice: conceptDraft.unitPrice,
        discount: 0,
        subtotal: totals.subtotal,
        taxObject: normalizeText(conceptDraft.taxObject),
        total: totals.total,
        taxes: conceptDraft.iva16
          ? [
            {
              taxCode: "002",
              taxName: "IVA",
              factorType: "Tasa",
              rate: 0.16,
              base: totals.subtotal,
              amount: totals.taxesTotal,
              isRetention: false,
            },
          ]
          : [],
        metadata: { source: "frontend" },
      },
    ],
  };
};

const mapStatusToSetup = (status: FacturationStatusResponse, current: BillingSetupState): BillingSetupState => ({
  ...current,
  businessAccountId: status.businessAccountId ?? current.businessAccountId,
  taxIssuerId: status.taxIssuerId ?? current.taxIssuerId,
  issuerRfc: status.issuerRfc ?? current.issuerRfc,
  issuerName: status.issuerName ?? current.issuerName,
  fiscalRegime: status.fiscalRegime ?? current.fiscalRegime,
  taxZipCode: status.taxZipCode ?? current.taxZipCode,
  expeditionPlace: status.expeditionPlace ?? current.expeditionPlace,
  serie: status.serie ?? current.serie,
  readyToInvoice: Boolean(status.readyToInvoice),
  missingSteps: status.missingSteps ?? [],
});

const getErrorMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : "Ocurrió un error inesperado en Facturación Electrónica.");
const isExpectedFile = (file: File | null, extension: ".cer" | ".key"): boolean => file instanceof File && file.name.toLowerCase().endsWith(extension);
const requireValue = (value: string | undefined, message: string): void => {
  if (!normalizeText(value)) throw new Error(message);
};

const triggerBrowserDownload = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getIssuerId = (issuer: TaxIssuer | undefined): number | undefined => issuer?.taxIssuerId ?? issuer?.id;
const getIssuerName = (issuer: TaxIssuer | undefined): string => issuer?.legalName ?? issuer?.name ?? issuer?.tradeName ?? "";

export const FacturaElectronicaPage = () => {
  const apiBaseUrl = useMemo(() => getFacturaElectronicaApiBaseUrl(), []);
  const sessionSnapshot = useMemo(() => readPosSessionSnapshot(), []);
  const [activeSection, setActiveSection] = useState<SectionId>("setup");
  const [businessDraft, setBusinessDraft] = useState<BusinessAccountDraft>(() => createInitialBusinessDraft());
  const [issuerDraft, setIssuerDraft] = useState<IssuerFiscalDraft>(() => createEmptyIssuerDraft());
  const [receiverDraft, setReceiverDraft] = useState<ReceiverDraft>(() => createEmptyReceiverDraft());
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>(() => createInitialInvoiceDraft(sessionSnapshot.employeeId));
  const [conceptDraft, setConceptDraft] = useState<InvoiceConceptDraft>(() => createInitialConceptDraft());
  const [expeditionDraft, setExpeditionDraft] = useState({ zipCode: "", description: "Sucursal principal" });
  const [seriesDraft, setSeriesDraft] = useState({ serie: DEFAULT_SERIE, nextFolio: 1 });
  const [setup, setSetup] = useState<BillingSetupState>({ readyToInvoice: false, missingSteps: [] });
  const [invoiceFlow, setInvoiceFlow] = useState<InvoiceFlowState>({ serie: DEFAULT_SERIE });
  const [issuers, setIssuers] = useState<TaxIssuer[]>([]);
  const [selectedIssuerId, setSelectedIssuerId] = useState<number | undefined>();
  const [loadingAction, setLoadingAction] = useState<ActionId | null>(null);
  const [messages, setMessages] = useState<Partial<Record<ActionId, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<ActionId, string>>>({});
  const [certificate, setCertificate] = useState<File | null>(null);
  const [privateKey, setPrivateKey] = useState<File | null>(null);
  const [privateKeyPassword, setPrivateKeyPassword] = useState("");

  const businessPayload = useMemo(() => buildBusinessPayload(businessDraft), [businessDraft]);
  const selectedIssuer = issuers.find((issuer) => getIssuerId(issuer) === selectedIssuerId) ?? issuers[0];
  const totals = useMemo(() => calculateTotals(conceptDraft), [conceptDraft]);

  const setActionMessage = (action: ActionId, message: string) => {
    setMessages((current) => ({ ...current, [action]: message }));
    setErrors((current) => ({ ...current, [action]: "" }));
  };

  const runAction = async (action: ActionId, callback: () => Promise<void>) => {
    if (!apiBaseUrl) {
      setErrors((current) => ({ ...current, [action]: getFacturaElectronicaEnvHelp() }));
      return;
    }

    setLoadingAction(action);
    setErrors((current) => ({ ...current, [action]: "" }));
    try {
      await callback();
    } catch (cause) {
      setErrors((current) => ({ ...current, [action]: getErrorMessage(cause) }));
    } finally {
      setLoadingAction(null);
    }
  };

  const updateBusinessDraft = (field: keyof BusinessAccountDraft, value: string) => setBusinessDraft((current) => ({ ...current, [field]: value }));
  const updateIssuerDraft = (field: keyof IssuerFiscalDraft, value: string) => setIssuerDraft((current) => ({ ...current, [field]: field === "rfc" ? value.toUpperCase() : value }));
  const updateReceiverDraft = (field: keyof ReceiverDraft, value: string) => setReceiverDraft((current) => ({ ...current, [field]: field === "rfc" ? value.toUpperCase() : value }));
  const updateInvoiceDraft = (field: keyof InvoiceDraft, value: string) => setInvoiceDraft((current) => ({ ...current, [field]: field === "currency" || field === "serie" ? value.toUpperCase() : value }));
  const updateConceptDraft = (field: keyof InvoiceConceptDraft, value: string | number | boolean) => setConceptDraft((current) => ({ ...current, [field]: value }));

  const validateBusinessDraft = () => {
    requireValue(businessPayload.externalBusinessId, "Captura el ID externo del negocio.");
    requireValue(businessPayload.businessName, "Captura el nombre del negocio.");
  };
  const validateIssuerDraft = () => {
    requireValue(issuerDraft.rfc, "Captura el RFC del emisor fiscal.");
    requireValue(issuerDraft.legalName, "Captura la razón social del emisor fiscal.");
    requireValue(issuerDraft.fiscalRegime, "Captura el régimen fiscal del emisor.");
    requireValue(issuerDraft.taxZipCode, "Captura el código postal fiscal del emisor.");
  };
  const validateReceiverDraft = () => {
    requireValue(receiverDraft.rfc, "Captura el RFC del receptor.");
    requireValue(receiverDraft.name, "Captura el nombre o razón social del receptor.");
    requireValue(receiverDraft.fiscalRegime, "Captura el régimen fiscal del receptor.");
    requireValue(receiverDraft.taxZipCode, "Captura el código postal fiscal del receptor.");
    requireValue(receiverDraft.cfdiUse, "Captura el uso CFDI del receptor.");
  };

  const applyBusinessAccount = (account: BusinessAccount) => {
    const id = account.businessAccountId ?? account.id;
    setSetup((current) => ({ ...current, businessAccountId: id ?? current.businessAccountId }));
    setBusinessDraft((current) => ({
      ...current,
      externalBusinessId: account.externalBusinessId ?? current.externalBusinessId,
      businessName: account.businessName ?? current.businessName,
      tradeName: account.tradeName ?? current.tradeName,
      contactEmail: account.contactEmail ?? current.contactEmail,
      contactPhone: account.contactPhone ?? current.contactPhone,
      defaultCurrency: account.defaultCurrency ?? current.defaultCurrency,
    }));
    if (account.defaultCurrency) setInvoiceDraft((current) => ({ ...current, currency: account.defaultCurrency ?? current.currency }));
    return id;
  };

  const loadIssuers = async (businessAccountId: number): Promise<TaxIssuer[]> => {
    const response = await facturaElectronicaService.getTaxIssuersByBusinessAccount(businessAccountId);
    const loadedIssuers = unwrapArray(response.data);
    setIssuers(loadedIssuers);
    const defaultIssuer = loadedIssuers.find((issuer) => issuer.isDefault) ?? loadedIssuers[0];
    const defaultIssuerId = getIssuerId(defaultIssuer);
    setSelectedIssuerId(defaultIssuerId);
    if (defaultIssuer) {
      setSetup((current) => ({
        ...current,
        taxIssuerId: defaultIssuerId ?? current.taxIssuerId,
        issuerRfc: defaultIssuer.rfc ?? current.issuerRfc,
        issuerName: getIssuerName(defaultIssuer) || current.issuerName,
        fiscalRegime: defaultIssuer.fiscalRegime ?? current.fiscalRegime,
        taxZipCode: defaultIssuer.taxZipCode ?? current.taxZipCode,
      }));
      setInvoiceDraft((current) => ({ ...current, expeditionPlace: current.expeditionPlace || defaultIssuer.taxZipCode || "" }));
    }
    return loadedIssuers;
  };

  const refreshFacturationStatus = async (businessAccountId: number) => {
    const response = await facturaElectronicaService.getFacturationStatus(businessAccountId);
    setSetup((current) => mapStatusToSetup(response.data, current));
    setActiveSection(response.data.readyToInvoice ? "invoice" : "setup");
    setInvoiceDraft((current) => ({
      ...current,
      expeditionPlace: current.expeditionPlace || response.data.expeditionPlace || response.data.taxZipCode || "",
      serie: current.serie || response.data.serie || DEFAULT_SERIE,
    }));
    setExpeditionDraft((current) => ({ ...current, zipCode: current.zipCode || response.data.expeditionPlace || response.data.taxZipCode || "" }));
    setSeriesDraft((current) => ({ ...current, serie: current.serie || response.data.serie || DEFAULT_SERIE }));
    return response.data;
  };

  useEffect(() => {
    if (!sessionSnapshot.token || !sessionSnapshot.businessId) return;

    let cancelled = false;
    const fetchBusinessFromPos = async () => {
      try {
        const posApiBaseUrl = getPosApiBaseUrl();
        const response = await fetch(new URL(`business/${sessionSnapshot.businessId}`, posApiBaseUrl).toString(), {
          headers: { "Content-Type": "application/json", token: sessionSnapshot.token, Authorization: `Bearer ${sessionSnapshot.token}` },
        });
        const payload = response.ok ? await response.json() : null;
        if (cancelled || !payload) return;
        const businessName = String(payload.Name ?? payload.name ?? "").trim();
        const email = String(payload.Email ?? payload.email ?? "").trim();
        const phone = String(payload.Phone ?? payload.phone ?? "").trim();
        setBusinessDraft((current) => ({ ...current, businessName: current.businessName || businessName, tradeName: current.tradeName || businessName, contactEmail: current.contactEmail || email, contactPhone: current.contactPhone || phone }));
        setIssuerDraft((current) => ({ ...current, tradeName: current.tradeName || businessName, email: current.email || email, phone: current.phone || phone }));
      } catch {
        // POS API configuration is independent from the billing API; keep manual fields available.
      }
    };

    fetchBusinessFromPos();
    return () => {
      cancelled = true;
    };
  }, [sessionSnapshot.businessId, sessionSnapshot.token]);

  useEffect(() => {
    if (!apiBaseUrl || !businessPayload.externalBusinessId) return;

    let cancelled = false;
    const bootstrapBillingStatus = async () => {
      setLoadingAction("bootstrap");
      try {
        const businessResponse = await facturaElectronicaService.getBusinessAccountBySource(businessPayload.sourceSystem, businessPayload.externalBusinessId);
        if (cancelled) return;
        const businessAccountId = applyBusinessAccount(businessResponse.data);
        if (!businessAccountId) return;
        await loadIssuers(businessAccountId);
        const status = await refreshFacturationStatus(businessAccountId);
        if (!cancelled) setActionMessage("bootstrap", status.readyToInvoice ? "Este negocio ya está listo para facturar." : "Completa la configuración fiscal antes de emitir facturas.");
      } catch (cause) {
        if (!cancelled) setErrors((current) => ({ ...current, bootstrap: getErrorMessage(cause) }));
      } finally {
        if (!cancelled) setLoadingAction(null);
      }
    };

    bootstrapBillingStatus();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, businessPayload.externalBusinessId, businessPayload.sourceSystem]);

  const syncBusiness = () =>
    runAction("business", async () => {
      validateBusinessDraft();
      const response = await facturaElectronicaService.syncBusinessAccount(businessPayload);
      const id = applyBusinessAccount(response.data) ?? getEntityId(response, ["businessAccountId", "id", "accountId"]);
      if (!id) throw new Error("El backend no devolvió businessAccountId.");
      setSetup((current) => ({ ...current, businessAccountId: id }));
      await loadIssuers(id);
      await refreshFacturationStatus(id);
      setActionMessage("business", `Negocio sincronizado${response.wasExisting ? " (ya existía)" : ""}. ID: ${id}.`);
    });

  const createIssuer = () =>
    runAction("issuer", async () => {
      if (!setup.businessAccountId) throw new Error("Primero sincroniza el negocio para obtener businessAccountId.");
      validateIssuerDraft();
      const payload = buildIssuerPayload(setup.businessAccountId, issuerDraft);
      const response = await facturaElectronicaService.createTaxIssuer(payload);
      const id = getEntityId(response, ["taxIssuerId", "id", "issuerId"]);
      const issuer: TaxIssuer = { ...response.data, taxIssuerId: response.data?.taxIssuerId ?? id, id: response.data?.id ?? id, rfc: response.data?.rfc ?? payload.rfc, legalName: response.data?.legalName ?? payload.legalName, fiscalRegime: response.data?.fiscalRegime ?? payload.fiscalRegime, taxZipCode: response.data?.taxZipCode ?? payload.taxZipCode, isDefault: true };
      setIssuers((current) => [issuer, ...current.filter((item) => getIssuerId(item) !== getIssuerId(issuer))]);
      setSelectedIssuerId(getIssuerId(issuer));
      setSetup((current) => ({ ...current, taxIssuerId: getIssuerId(issuer), issuerRfc: issuer.rfc, issuerName: getIssuerName(issuer), fiscalRegime: issuer.fiscalRegime, taxZipCode: issuer.taxZipCode }));
      setInvoiceDraft((current) => ({ ...current, expeditionPlace: current.expeditionPlace || issuer.taxZipCode || "" }));
      setExpeditionDraft((current) => ({ ...current, zipCode: current.zipCode || issuer.taxZipCode || "" }));
      setActionMessage("issuer", response.wasExisting ? "El emisor fiscal ya existía. Se usará el registro existente." : `Emisor fiscal configurado. ID: ${getIssuerId(issuer) ?? "revisa la respuesta del backend"}.`);
    });

  const uploadCsd = () =>
    runAction("csd", async () => {
      const taxIssuerId = selectedIssuerId ?? setup.taxIssuerId;
      if (!taxIssuerId) throw new Error("Primero crea o selecciona un emisor fiscal.");
      const certificateFile = certificate;
      const privateKeyFile = privateKey;
      if (!isExpectedFile(certificateFile, ".cer")) throw new Error("Selecciona un archivo de certificado válido con extensión .cer.");
      if (!isExpectedFile(privateKeyFile, ".key")) throw new Error("Selecciona un archivo de llave privada válido con extensión .key.");
      if (!privateKeyPassword.trim()) throw new Error("Captura la contraseña de la llave privada.");
      await facturaElectronicaService.uploadTaxIssuerCsd(taxIssuerId, { certificate: certificateFile, privateKey: privateKeyFile, privateKeyPassword });
      setActionMessage("csd", "CSD enviado como multipart/form-data. El frontend no convirtió archivos a base64.");
    });

  const createExpeditionPlace = () =>
    runAction("expeditionPlace", async () => {
      const taxIssuerId = selectedIssuerId ?? setup.taxIssuerId;
      if (!taxIssuerId) throw new Error("Primero crea o selecciona un emisor fiscal.");
      requireValue(expeditionDraft.zipCode, "Captura el código postal del lugar de expedición.");
      const response = await facturaElectronicaService.createExpeditionPlace(taxIssuerId, { zipCode: normalizeText(expeditionDraft.zipCode), description: normalizeText(expeditionDraft.description) || "Sucursal principal", isDefault: true, status: "active" });
      setSetup((current) => ({ ...current, expeditionPlace: normalizeText(expeditionDraft.zipCode) }));
      setInvoiceDraft((current) => ({ ...current, expeditionPlace: normalizeText(expeditionDraft.zipCode) }));
      setActionMessage("expeditionPlace", response.wasExisting ? "El lugar de expedición ya existía. Se usará el registro existente." : `Lugar de expedición ${normalizeText(expeditionDraft.zipCode)} configurado.`);
    });

  const createSeries = () =>
    runAction("series", async () => {
      const taxIssuerId = selectedIssuerId ?? setup.taxIssuerId;
      if (!taxIssuerId) throw new Error("Primero crea o selecciona un emisor fiscal.");
      requireValue(seriesDraft.serie, "Captura la serie.");
      const response = await facturaElectronicaService.createInvoiceSeries(taxIssuerId, { serie: normalizeText(seriesDraft.serie).toUpperCase(), nextFolio: Number(seriesDraft.nextFolio) || 1, status: "active" });
      setSetup((current) => ({ ...current, serie: normalizeText(seriesDraft.serie).toUpperCase() }));
      setInvoiceDraft((current) => ({ ...current, serie: normalizeText(seriesDraft.serie).toUpperCase() }));
      setActionMessage("series", response.wasExisting ? "La serie ya existía. Se usará el registro existente." : `Serie ${normalizeText(seriesDraft.serie).toUpperCase()} configurada.`);
    });

  const verifyConfiguration = () =>
    runAction("status", async () => {
      if (!setup.businessAccountId) throw new Error("Primero sincroniza el negocio para obtener businessAccountId.");
      await loadIssuers(setup.businessAccountId);
      const status = await refreshFacturationStatus(setup.businessAccountId);
      setActionMessage("status", status.readyToInvoice ? "Este negocio ya está listo para facturar." : `Completa la configuración fiscal antes de emitir facturas.${status.missingSteps?.length ? ` Faltan: ${status.missingSteps.join(", ")}.` : ""}`);
    });

  const createInvoiceRequest = () =>
    runAction("invoiceRequest", async () => {
      if (!setup.readyToInvoice) throw new Error("Completa la configuración fiscal antes de emitir facturas.");
      if (!setup.businessAccountId) throw new Error("No se puede crear invoice_request sin businessAccountId.");
      if (!selectedIssuer) throw new Error("Selecciona un emisor fiscal configurado.");
      if (!normalizeRfc(selectedIssuer.rfc)) throw new Error("El emisor seleccionado no tiene RFC.");
      requireValue(invoiceDraft.externalDocumentId, "Captura el externalDocumentId de la venta.");
      requireValue(invoiceDraft.expeditionPlace, "Captura el lugar de expedición para el CFDI.");
      requireValue(invoiceDraft.serie, "Captura la serie para el CFDI.");
      validateBusinessDraft();
      validateReceiverDraft();

      const payload = buildInvoiceRequestPayload(businessPayload, selectedIssuer, receiverDraft, invoiceDraft, conceptDraft);
      console.log("Payload para createInvoiceRequest:", payload);
      const response = await facturaElectronicaService.createInvoiceRequest(payload);
      const id = getEntityId(response, ["invoiceRequestId", "id", "requestId"]);
      setInvoiceFlow((current) => ({ ...current, invoiceRequestId: id ?? current.invoiceRequestId, serie: payload.cfdi ? invoiceDraft.serie : current.serie, status: "invoice_request_created" }));
      setActionMessage("invoiceRequest", `Solicitud de factura creada con RFC emisor ${payload.issuer.rfc}. ID: ${id ?? "revisa la respuesta del backend"}. Total: $${payload.totals.total}.`);
    });

  const issueInvoice = () =>
    runAction("issue", async () => {
      if (!invoiceFlow.invoiceRequestId) throw new Error("No se puede timbrar porque falta invoiceRequestId.");
      const response = await facturaElectronicaService.issueInvoice(invoiceFlow.invoiceRequestId, { serie: normalizeText(invoiceDraft.serie), downloadFiles: false });
      const issued = response.data;
      setInvoiceFlow((current) => ({
        ...current,
        invoiceRequestId: issued.invoiceRequestId ?? current.invoiceRequestId,
        issuedInvoiceId: issued.issuedInvoiceId,
        facturamaId: issued.facturamaId,
        uuid: issued.uuid,
        serie: issued.serie ?? invoiceDraft.serie,
        folio: issued.folio,
        status: issued.status,
      }));
      setActionMessage("issue", `Factura timbrada correctamente. UUID: ${issued.uuid || "pendiente en respuesta"}. Serie/Folio: ${issued.serie ?? invoiceDraft.serie} ${issued.folio ?? ""}.`);
    });

  const viewInvoice = () =>
    runAction("viewInvoice", async () => {
      if (!invoiceFlow.issuedInvoiceId) throw new Error("Primero timbra la factura para obtener issuedInvoiceId.");
      const response = await facturaElectronicaService.getInvoiceById(invoiceFlow.issuedInvoiceId);
      setActionMessage("viewInvoice", JSON.stringify(response, null, 2));
    });

  const downloadFile = (format: InvoiceFileFormat) =>
    runAction("files", async () => {
      if (!invoiceFlow.issuedInvoiceId) throw new Error("No se pueden descargar archivos porque falta issuedInvoiceId.");
      const file = await facturaElectronicaService.downloadInvoiceFile(invoiceFlow.issuedInvoiceId, format);
      const filename = `factura-${invoiceFlow.serie || invoiceDraft.serie || "sin-serie"}-${invoiceFlow.folio || invoiceFlow.issuedInvoiceId}.${format}`;
      triggerBrowserDownload(file.blob, filename);
      setActionMessage("files", `${format.toUpperCase()} descargado desde el backend de facturación (${file.contentType}).`);
    });

  const setupNotice = setup.readyToInvoice ? "Este negocio ya está listo para facturar." : "Completa la configuración fiscal antes de emitir facturas.";

  return (
    <PosV2Shell title="Facturación electrónica" subtitle="Configura una vez y emite facturas recurrentemente">
      <section className="factura-electronica">
        <header className="factura-electronica__hero">
          <h2>Facturación Electrónica</h2>
          <p>La configuración fiscal se guarda una sola vez. La emisión usa el emisor, CSD, lugar de expedición y serie ya configurados.</p>
          <div className={`factura-electronica__notice ${setup.readyToInvoice ? "factura-electronica__notice--success" : ""}`}>{setupNotice}</div>
          {!apiBaseUrl ? <div className="factura-electronica__notice">{getFacturaElectronicaEnvHelp()}</div> : null}
          {errors.bootstrap ? <div className="factura-electronica__error">{errors.bootstrap}</div> : null}
          {messages.bootstrap ? <div className="factura-electronica__result">{messages.bootstrap}</div> : null}
        </header>

        <nav className="factura-electronica__tabs" aria-label="Secciones de facturación electrónica">
          <button type="button" className={activeSection === "setup" ? "factura-electronica__tab factura-electronica__tab--active" : "factura-electronica__tab"} onClick={() => setActiveSection("setup")}>Configuración fiscal</button>
          <button type="button" className={activeSection === "invoice" ? "factura-electronica__tab factura-electronica__tab--active" : "factura-electronica__tab"} onClick={() => setActiveSection("invoice")}>Emitir factura</button>
        </nav>

        <section className="factura-electronica__summary" aria-label="Estado de facturación">
          <h3>Estado de configuración y emisión</h3>
          <div className="factura-electronica__summary-grid">
            <div><span>Business ID</span><strong>{setup.businessAccountId ?? "Pendiente"}</strong></div>
            <div><span>Tax issuer ID</span><strong>{selectedIssuerId ?? setup.taxIssuerId ?? "Pendiente"}</strong></div>
            <div><span>RFC emisor</span><strong>{selectedIssuer?.rfc ?? setup.issuerRfc ?? "Pendiente"}</strong></div>
            <div><span>Ready</span><strong>{setup.readyToInvoice ? "Sí" : "No"}</strong></div>
            <div><span>Faltantes</span><strong>{setup.missingSteps.length ? setup.missingSteps.join(", ") : "Sin faltantes reportados"}</strong></div>
            <div><span>Invoice request</span><strong>{invoiceFlow.invoiceRequestId ?? "Pendiente"}</strong></div>
            <div><span>UUID</span><strong>{invoiceFlow.uuid ?? "Pendiente"}</strong></div>
            <div><span>Serie / folio</span><strong>{invoiceFlow.serie ?? "-"} {invoiceFlow.folio ?? ""}</strong></div>
          </div>
        </section>

        {activeSection === "setup" ? (
          <section className="factura-electronica__steps" aria-label="Configuración fiscal">
            <article className="factura-electronica__step">
              <StepHeader number="A" title="Negocio" description="Sincroniza el negocio del POS o captura sus datos manualmente. Este paso no envía RFC." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">ID externo del negocio<input type="text" value={businessDraft.externalBusinessId} onChange={(event) => updateBusinessDraft("externalBusinessId", event.target.value)} /></label>
                <label className="factura-electronica__field">Nombre del negocio<input type="text" value={businessDraft.businessName} onChange={(event) => updateBusinessDraft("businessName", event.target.value)} /></label>
                <label className="factura-electronica__field">Nombre comercial<input type="text" value={businessDraft.tradeName} onChange={(event) => updateBusinessDraft("tradeName", event.target.value)} /></label>
                <label className="factura-electronica__field">Email<input type="email" value={businessDraft.contactEmail} onChange={(event) => updateBusinessDraft("contactEmail", event.target.value)} /></label>
                <label className="factura-electronica__field">Teléfono<input type="tel" value={businessDraft.contactPhone} onChange={(event) => updateBusinessDraft("contactPhone", event.target.value)} /></label>
                <label className="factura-electronica__field">Moneda<input type="text" value={businessDraft.defaultCurrency} onChange={(event) => updateBusinessDraft("defaultCurrency", event.target.value.toUpperCase())} /></label>
              </div>
              <ActionFooter action="business" label="Sincronizar negocio" loadingAction={loadingAction} onAction={syncBusiness} messages={messages} errors={errors} />
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="B" title="Emisor fiscal" description="Crea o reutiliza un emisor fiscal ligado al businessAccount sincronizado." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">RFC<input type="text" value={issuerDraft.rfc} onChange={(event) => updateIssuerDraft("rfc", event.target.value)} /></label>
                <label className="factura-electronica__field">Razón social<input type="text" value={issuerDraft.legalName} onChange={(event) => updateIssuerDraft("legalName", event.target.value)} /></label>
                <label className="factura-electronica__field">Nombre comercial<input type="text" value={issuerDraft.tradeName} onChange={(event) => updateIssuerDraft("tradeName", event.target.value)} /></label>
                <label className="factura-electronica__field">Régimen fiscal<input type="text" value={issuerDraft.fiscalRegime} onChange={(event) => updateIssuerDraft("fiscalRegime", event.target.value)} /></label>
                <label className="factura-electronica__field">Código postal fiscal<input type="text" value={issuerDraft.taxZipCode} onChange={(event) => updateIssuerDraft("taxZipCode", event.target.value)} /></label>
                <label className="factura-electronica__field">Email<input type="email" value={issuerDraft.email} onChange={(event) => updateIssuerDraft("email", event.target.value)} /></label>
                <label className="factura-electronica__field">Teléfono<input type="tel" value={issuerDraft.phone} onChange={(event) => updateIssuerDraft("phone", event.target.value)} /></label>
              </div>
              <ActionFooter action="issuer" label="Crear o usar emisor fiscal" loadingAction={loadingAction} onAction={createIssuer} messages={messages} errors={errors} />
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="C" title="CSD" description="Sube o actualiza el certificado del emisor seleccionado. No se usa en cada emisión." />
              <div className="factura-electronica__files">
                <label className="factura-electronica__field">Archivo .cer<input type="file" accept=".cer" onChange={(event) => setCertificate(event.target.files?.[0] ?? null)} /></label>
                <label className="factura-electronica__field">Archivo .key<input type="file" accept=".key" onChange={(event) => setPrivateKey(event.target.files?.[0] ?? null)} /></label>
                <label className="factura-electronica__field">Contraseña de llave privada<input type="password" value={privateKeyPassword} onChange={(event) => setPrivateKeyPassword(event.target.value)} /></label>
              </div>
              <ActionFooter action="csd" label="Subir o actualizar CSD" loadingAction={loadingAction} onAction={uploadCsd} messages={messages} errors={errors} />
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="D" title="Lugar de expedición" description="Crea o reutiliza el código postal desde donde se emitirán los CFDI." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">Código postal<input type="text" value={expeditionDraft.zipCode} onChange={(event) => setExpeditionDraft((current) => ({ ...current, zipCode: event.target.value }))} /></label>
                <label className="factura-electronica__field">Descripción<input type="text" value={expeditionDraft.description} onChange={(event) => setExpeditionDraft((current) => ({ ...current, description: event.target.value }))} /></label>
              </div>
              <ActionFooter action="expeditionPlace" label="Crear o usar lugar de expedición" loadingAction={loadingAction} onAction={createExpeditionPlace} messages={messages} errors={errors} />
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="E" title="Serie y folio" description="Crea o reutiliza la serie que se usará al timbrar facturas." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">Serie<input type="text" value={seriesDraft.serie} onChange={(event) => setSeriesDraft((current) => ({ ...current, serie: event.target.value.toUpperCase() }))} /></label>
                <label className="factura-electronica__field">Folio inicial<input type="number" min="1" value={seriesDraft.nextFolio} onChange={(event) => setSeriesDraft((current) => ({ ...current, nextFolio: Number(event.target.value) }))} /></label>
              </div>
              <ActionFooter action="series" label="Crear o usar serie" loadingAction={loadingAction} onAction={createSeries} messages={messages} errors={errors} />
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="F" title="Verificar configuración" description="Consulta facturation-status y habilita emisión si el backend reporta readyToInvoice." />
              <ActionFooter action="status" label="Verificar configuración fiscal" loadingAction={loadingAction} onAction={verifyConfiguration} messages={messages} errors={errors} />
            </article>
          </section>
        ) : (
          <section className="factura-electronica__steps" aria-label="Emitir factura">
            {!setup.readyToInvoice ? <div className="factura-electronica__error">Completa la configuración fiscal antes de emitir facturas.</div> : null}

            <article className="factura-electronica__step">
              <StepHeader number="A" title="Venta" description="Identifica la venta/documento del POS. Cada factura debe usar un externalDocumentId nuevo." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">externalDocumentId<input type="text" value={invoiceDraft.externalDocumentId} onChange={(event) => updateInvoiceDraft("externalDocumentId", event.target.value)} /></label>
                <label className="factura-electronica__field">externalUserId opcional<input type="text" value={invoiceDraft.externalUserId ?? ""} onChange={(event) => updateInvoiceDraft("externalUserId", event.target.value)} /></label>
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="B" title="Emisor" description="Selecciona un emisor fiscal ya configurado. Aquí no se editan sus datos base." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">Emisor fiscal<select value={selectedIssuerId ?? ""} onChange={(event) => setSelectedIssuerId(Number(event.target.value) || undefined)}>{issuers.map((issuer) => <option key={getIssuerId(issuer)} value={getIssuerId(issuer)}>{issuer.rfc} · {getIssuerName(issuer)}</option>)}</select></label>
                <ReadOnlyField label="RFC" value={selectedIssuer?.rfc} />
                <ReadOnlyField label="Razón social" value={getIssuerName(selectedIssuer)} />
                <ReadOnlyField label="Régimen fiscal" value={selectedIssuer?.fiscalRegime} />
                <ReadOnlyField label="CP fiscal" value={selectedIssuer?.taxZipCode} />
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="C" title="Receptor" description="Captura los datos fiscales del receptor para esta factura." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">RFC<input type="text" value={receiverDraft.rfc} onChange={(event) => updateReceiverDraft("rfc", event.target.value)} /></label>
                <label className="factura-electronica__field">Nombre<input type="text" value={receiverDraft.name} onChange={(event) => updateReceiverDraft("name", event.target.value)} /></label>
                <label className="factura-electronica__field">Régimen fiscal<input type="text" value={receiverDraft.fiscalRegime} onChange={(event) => updateReceiverDraft("fiscalRegime", event.target.value)} /></label>
                <label className="factura-electronica__field">CP fiscal<input type="text" value={receiverDraft.taxZipCode} onChange={(event) => updateReceiverDraft("taxZipCode", event.target.value)} /></label>
                <label className="factura-electronica__field">Uso CFDI<input type="text" value={receiverDraft.cfdiUse} onChange={(event) => updateReceiverDraft("cfdiUse", event.target.value)} /></label>
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="D" title="CFDI" description="Usa la configuración ya guardada para lugar de expedición y serie; puedes ajustar el valor enviado en esta emisión." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">Forma de pago<input type="text" value={invoiceDraft.paymentForm} onChange={(event) => updateInvoiceDraft("paymentForm", event.target.value)} /></label>
                <label className="factura-electronica__field">Método de pago<input type="text" value={invoiceDraft.paymentMethod} onChange={(event) => updateInvoiceDraft("paymentMethod", event.target.value)} /></label>
                <label className="factura-electronica__field">Moneda<input type="text" value={invoiceDraft.currency} onChange={(event) => updateInvoiceDraft("currency", event.target.value)} /></label>
                <label className="factura-electronica__field">Lugar de expedición<input type="text" value={invoiceDraft.expeditionPlace} onChange={(event) => updateInvoiceDraft("expeditionPlace", event.target.value)} /></label>
                <label className="factura-electronica__field">Exportación<input type="text" value={invoiceDraft.exportation} onChange={(event) => updateInvoiceDraft("exportation", event.target.value)} /></label>
                <label className="factura-electronica__field">Serie<input type="text" value={invoiceDraft.serie} onChange={(event) => updateInvoiceDraft("serie", event.target.value)} /></label>
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="E" title="Concepto de prueba editable" description="Por ahora se emite un solo concepto editable con cálculo automático de subtotal, IVA y total." />
              <div className="factura-electronica__form-grid">
                <label className="factura-electronica__field">Descripción<input type="text" value={conceptDraft.description} onChange={(event) => updateConceptDraft("description", event.target.value)} /></label>
                <label className="factura-electronica__field">Clave producto/servicio<input type="text" value={conceptDraft.productServiceCode} onChange={(event) => updateConceptDraft("productServiceCode", event.target.value)} /></label>
                <label className="factura-electronica__field">Clave unidad<input type="text" value={conceptDraft.unitCode} onChange={(event) => updateConceptDraft("unitCode", event.target.value)} /></label>
                <label className="factura-electronica__field">Unidad<input type="text" value={conceptDraft.unitName} onChange={(event) => updateConceptDraft("unitName", event.target.value)} /></label>
                <label className="factura-electronica__field">Cantidad<input type="number" min="0" step="0.01" value={conceptDraft.quantity} onChange={(event) => updateConceptDraft("quantity", Number(event.target.value))} /></label>
                <label className="factura-electronica__field">Precio unitario<input type="number" min="0" step="0.01" value={conceptDraft.unitPrice} onChange={(event) => updateConceptDraft("unitPrice", Number(event.target.value))} /></label>
                <label className="factura-electronica__field">Objeto impuesto<input type="text" value={conceptDraft.taxObject} onChange={(event) => updateConceptDraft("taxObject", event.target.value)} /></label>
                <label className="factura-electronica__field factura-electronica__checkbox"><input type="checkbox" checked={conceptDraft.iva16} onChange={(event) => updateConceptDraft("iva16", event.target.checked)} /> IVA 16%</label>
              </div>
              <div className="factura-electronica__summary-grid">
                <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
                <div><span>IVA</span><strong>${totals.taxesTotal.toFixed(2)}</strong></div>
                <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="F" title="Acciones" description="Crea la solicitud, timbra y descarga archivos de la factura emitida." />
              <div className="factura-electronica__actions">
                <button type="button" onClick={createInvoiceRequest} disabled={loadingAction === "invoiceRequest" || !setup.readyToInvoice}>{loadingAction === "invoiceRequest" ? "Procesando..." : "Crear solicitud de factura"}</button>
                <button type="button" onClick={issueInvoice} disabled={loadingAction === "issue" || !invoiceFlow.invoiceRequestId}>{loadingAction === "issue" ? "Procesando..." : "Timbrar factura"}</button>
                <button type="button" className="factura-electronica__secondary" onClick={viewInvoice} disabled={loadingAction === "viewInvoice" || !invoiceFlow.issuedInvoiceId}>Consultar factura</button>
                <button type="button" onClick={() => downloadFile("pdf")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar PDF</button>
                <button type="button" onClick={() => downloadFile("xml")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar XML</button>
                <button type="button" className="factura-electronica__secondary" onClick={() => downloadFile("html")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar HTML</button>
              </div>
              {errors.invoiceRequest ? <div className="factura-electronica__error">{errors.invoiceRequest}</div> : null}
              {messages.invoiceRequest ? <div className="factura-electronica__result">{messages.invoiceRequest}</div> : null}
              {errors.issue ? <div className="factura-electronica__error">{errors.issue}</div> : null}
              {messages.issue ? <div className="factura-electronica__result">{messages.issue}</div> : null}
              {errors.viewInvoice ? <div className="factura-electronica__error">{errors.viewInvoice}</div> : null}
              {messages.viewInvoice ? <div className="factura-electronica__result">{messages.viewInvoice}</div> : null}
              {errors.files ? <div className="factura-electronica__error">{errors.files}</div> : null}
              {messages.files ? <div className="factura-electronica__result">{messages.files}</div> : null}
            </article>
          </section>
        )}
      </section>
    </PosV2Shell>
  );
};

const StepHeader = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="factura-electronica__step-header">
    <span className="factura-electronica__step-number">{number}</span>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const ActionFooter = ({ action, label, loadingAction, onAction, messages, errors }: { action: ActionId; label: string; loadingAction: ActionId | null; onAction: () => void; messages: Partial<Record<ActionId, string>>; errors: Partial<Record<ActionId, string>> }) => (
  <>
    <div className="factura-electronica__actions">
      <button type="button" onClick={onAction} disabled={loadingAction === action}>{loadingAction === action ? "Procesando..." : label}</button>
    </div>
    {errors[action] ? <div className="factura-electronica__error">{errors[action]}</div> : null}
    {messages[action] ? <div className="factura-electronica__result">{messages[action]}</div> : null}
  </>
);

const ReadOnlyField = ({ label, value }: { label: string; value?: string }) => (
  <label className="factura-electronica__field">{label}<input type="text" value={value ?? "Pendiente"} readOnly /></label>
);
