import { useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { ModernSystemsFactory } from "../../../../../index";
import { getFacturaElectronicaApiBaseUrl, getFacturaElectronicaEnvHelp } from "../config/facturaElectronicaEnv";
import { facturaElectronicaService } from "../services/facturaElectronica.service";
import {
  BillingSetupState,
  BusinessAccount,
  BusinessAccountDraft,
  BusinessAccountSyncRequest,
  CreateInvoiceRequestPayload,
  FacturationStatusResponse,
  InvoiceConceptLine,
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

type CatalogOption = {
  code: string;
  label: string;
};

type ReceiverFiscalRegimeOption = CatalogOption & {
  cfdiUses: string[];
};

const CFDI_USE_OPTIONS: CatalogOption[] = [
  { code: "G01", label: "G01 · Adquisición de mercancías" },
  { code: "G02", label: "G02 · Devoluciones, descuentos o bonificaciones" },
  { code: "G03", label: "G03 · Gastos en general" },
  { code: "I01", label: "I01 · Construcciones" },
  { code: "I02", label: "I02 · Mobiliario y equipo de oficina por inversiones" },
  { code: "I03", label: "I03 · Equipo de transporte" },
  { code: "I04", label: "I04 · Equipo de cómputo y accesorios" },
  { code: "I05", label: "I05 · Dados, troqueles, moldes, matrices y herramental" },
  { code: "I06", label: "I06 · Comunicaciones telefónicas" },
  { code: "I07", label: "I07 · Comunicaciones satelitales" },
  { code: "I08", label: "I08 · Otra maquinaria y equipo" },
  { code: "D01", label: "D01 · Honorarios médicos, dentales y gastos hospitalarios" },
  { code: "D02", label: "D02 · Gastos médicos por incapacidad o discapacidad" },
  { code: "D03", label: "D03 · Gastos funerales" },
  { code: "D04", label: "D04 · Donativos" },
  { code: "D05", label: "D05 · Intereses reales por créditos hipotecarios" },
  { code: "D06", label: "D06 · Aportaciones voluntarias al SAR" },
  { code: "D07", label: "D07 · Primas por seguros de gastos médicos" },
  { code: "D08", label: "D08 · Gastos de transportación escolar obligatoria" },
  { code: "D09", label: "D09 · Depósitos en cuentas para el ahorro" },
  { code: "D10", label: "D10 · Pagos por servicios educativos" },
  { code: "S01", label: "S01 · Sin efectos fiscales" },
  { code: "CP01", label: "CP01 · Pagos" },
  { code: "CN01", label: "CN01 · Nómina" },
];

const BUSINESS_CFDI_USE_CODES = [
  "G01",
  "G02",
  "G03",
  "I01",
  "I02",
  "I03",
  "I04",
  "I05",
  "I06",
  "I07",
  "I08",
  "S01",
  "CP01",
  "CN01",
];
const INDIVIDUAL_CFDI_USE_CODES = [
  "G01",
  "G02",
  "G03",
  "I01",
  "I02",
  "I03",
  "I04",
  "I05",
  "I06",
  "I07",
  "I08",
  "D01",
  "D02",
  "D03",
  "D04",
  "D05",
  "D06",
  "D07",
  "D08",
  "D09",
  "D10",
  "S01",
  "CP01",
  "CN01",
];

const RECEIVER_FISCAL_REGIME_OPTIONS: ReceiverFiscalRegimeOption[] = [
  { code: "601", label: "601 · General de Ley Personas Morales", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "603", label: "603 · Personas Morales con Fines no Lucrativos", cfdiUses: BUSINESS_CFDI_USE_CODES },
  {
    code: "605",
    label: "605 · Sueldos y Salarios e Ingresos Asimilados a Salarios",
    cfdiUses: ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "S01", "CN01"],
  },
  { code: "606", label: "606 · Arrendamiento", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "607", label: "607 · Régimen de Enajenación o Adquisición de Bienes", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "608", label: "608 · Demás ingresos", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "610", label: "610 · Residentes en el Extranjero sin Establecimiento Permanente en México", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "611", label: "611 · Ingresos por Dividendos", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "612", label: "612 · Personas Físicas con Actividades Empresariales y Profesionales", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "614", label: "614 · Ingresos por intereses", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "615", label: "615 · Obtención de premios", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "616", label: "616 · Sin obligaciones fiscales", cfdiUses: ["S01"] },
  { code: "620", label: "620 · Sociedades Cooperativas de Producción", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "621", label: "621 · Incorporación Fiscal", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "622", label: "622 · Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "623", label: "623 · Opcional para Grupos de Sociedades", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "624", label: "624 · Coordinados", cfdiUses: BUSINESS_CFDI_USE_CODES },
  { code: "625", label: "625 · Plataformas Tecnológicas", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
  { code: "626", label: "626 · Régimen Simplificado de Confianza", cfdiUses: INDIVIDUAL_CFDI_USE_CODES },
];

const getCfdiUseLabel = (code: string): string => CFDI_USE_OPTIONS.find((option) => option.code === code)?.label ?? code;
const getCfdiUseOptionsByFiscalRegime = (fiscalRegime: string): CatalogOption[] => {
  const selectedRegime = RECEIVER_FISCAL_REGIME_OPTIONS.find((option) => option.code === normalizeText(fiscalRegime));
  if (!selectedRegime) return [];

  return selectedRegime.cfdiUses.map((code) => ({ code, label: getCfdiUseLabel(code) }));
};

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
type PosInvoiceProductOption = {
  key: string;
  productId: number;
  variantId?: number | null;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  category: string;
  image?: string;
  sourceLabel: string;
};

const toAbsolutePosImageUrl = (image?: string | null): string | undefined => {
  const candidate = normalizeText(image ?? undefined);
  if (!candidate) return undefined;
  if (/^https?:\/\//i.test(candidate) || candidate.startsWith("data:")) return candidate;

  try {
    return new URL(candidate.startsWith("/") ? candidate.slice(1) : candidate, getPosApiBaseUrl()).toString();
  } catch {
    return undefined;
  }
};

const createManualConceptLine = (): InvoiceConceptLine => ({
  id: `manual-${Date.now()}`,
  externalItemId: "manual-1",
  sku: "VENTA-MOSTRADOR",
  source: "manual",
  sourceLabel: "Captura manual",
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

const readResponseData = <T,>(response: { data?: T } | T): T => {
  if (response && typeof response === "object" && "data" in response && (response as { data?: T }).data !== undefined) {
    return (response as { data: T }).data;
  }

  return response as T;
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

const calculateConceptTotals = (concept: InvoiceConceptLine): { subtotal: number; taxesTotal: number; total: number } => {
  const quantity = Number.isFinite(concept.quantity) ? concept.quantity : 0;
  const unitPrice = Number.isFinite(concept.unitPrice) ? concept.unitPrice : 0;
  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const taxesTotal = concept.iva16 ? Number((subtotal * 0.16).toFixed(2)) : 0;
  return { subtotal, taxesTotal, total: Number((subtotal + taxesTotal).toFixed(2)) };
};

const calculateTotals = (concepts: InvoiceConceptLine[]): { subtotal: number; taxesTotal: number; total: number } => {
  const accumulator = concepts.reduce(
    (current, concept) => {
      const conceptTotals = calculateConceptTotals(concept);
      return {
        subtotal: current.subtotal + conceptTotals.subtotal,
        taxesTotal: current.taxesTotal + conceptTotals.taxesTotal,
        total: current.total + conceptTotals.total,
      };
    },
    { subtotal: 0, taxesTotal: 0, total: 0 },
  );

  return {
    subtotal: Number(accumulator.subtotal.toFixed(2)),
    taxesTotal: Number(accumulator.taxesTotal.toFixed(2)),
    total: Number(accumulator.total.toFixed(2)),
  };
};

const buildInvoiceRequestPayload = (
  businessPayload: BusinessAccountSyncRequest,
  selectedIssuer: TaxIssuer,
  receiverDraft: ReceiverDraft,
  invoiceDraft: InvoiceDraft,
  conceptLines: InvoiceConceptLine[],
): CreateInvoiceRequestPayload => {
  const billableConcepts = conceptLines.filter(isBillableConceptLine);

  if (billableConcepts.length === 0) {
    throw new Error("Agrega al menos un concepto con descripción, cantidad y precio mayor a cero.");
  }

  const totals = calculateTotals(billableConcepts);
  const cfdiPeriod = getCurrentCfdiPeriod();
  const receiverRfc = normalizeRfc(receiverDraft.rfc);
  const receiverName = normalizeText(receiverDraft.name).toUpperCase();
  const issuerRfc = getIssuerRfc(selectedIssuer);

  if (!issuerRfc) {
    throw new Error("El emisor seleccionado no tiene RFC válido.");
  }

  const shouldAddGlobalInformation =
    receiverRfc === GENERIC_PUBLIC_RFC ||
    receiverName === "PUBLICO EN GENERAL" ||
    receiverName === "PÚBLICO EN GENERAL";

  const externalUserId = normalizeText(invoiceDraft.externalUserId) || "frontend";

  const businessName = normalizeText(businessPayload.businessName);
  const businessSnapshot: BusinessAccountSyncRequest = {
    sourceSystem: normalizeText(businessPayload.sourceSystem) || DEFAULT_SOURCE_SYSTEM,
    externalBusinessId: normalizeText(businessPayload.externalBusinessId),
    businessName,
    tradeName: normalizeText(businessPayload.tradeName) || businessName,
    contactEmail:
      normalizeText(businessPayload.contactEmail) ||
      getIssuerEmail(selectedIssuer) ||
      "contacto@ravekh.com",
    contactPhone:
      normalizeText(businessPayload.contactPhone) ||
      getIssuerPhone(selectedIssuer) ||
      "0000000000",
    defaultCurrency: normalizeText(businessPayload.defaultCurrency) || DEFAULT_CURRENCY,
  };

  return {
    sourceSystem: DEFAULT_SOURCE_SYSTEM,
    sourceDocumentType: "order",
    externalDocumentId: normalizeText(invoiceDraft.externalDocumentId),
    externalUserId,

    business: businessSnapshot,

    issuer: {
      rfc: issuerRfc,
    },

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
      currency: normalizeText(invoiceDraft.currency) || DEFAULT_CURRENCY,
      exchangeRate: null,
      expeditionPlace: normalizeText(invoiceDraft.expeditionPlace),
      exportation: normalizeText(invoiceDraft.exportation) || DEFAULT_EXPORTATION,
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

    concepts: billableConcepts.map((concept, index) => {
      const conceptTotals = calculateConceptTotals(concept);
      const taxObject = normalizeText(concept.taxObject) || "02";
      const shouldApplyIva = taxObject === "02" && concept.iva16 && conceptTotals.subtotal > 0;

      return {
        externalItemId: normalizeText(concept.externalItemId) || String(index + 1),
        productServiceCode: normalizeText(concept.productServiceCode) || "01010101",
        sku: normalizeText(concept.sku) || `CONCEPTO-${index + 1}`,
        description: normalizeText(concept.description),
        unitCode: normalizeText(concept.unitCode) || "H87",
        unitName: normalizeText(concept.unitName) || "Pieza",
        quantity: Number(concept.quantity),
        unitPrice: Number(concept.unitPrice),
        discount: 0,
        subtotal: conceptTotals.subtotal,
        taxObject,
        total: conceptTotals.total,
        taxes: shouldApplyIva
          ? [
            {
              taxCode: "002",
              taxName: "IVA",
              factorType: "Tasa",
              rate: 0.16,
              base: conceptTotals.subtotal,
              amount: conceptTotals.taxesTotal,
              isRetention: false,
            },
          ]
          : [],
        metadata: {
          source: "frontend",
          conceptSource: concept.source,
          sourceLabel: concept.sourceLabel,
          sourceExternalItemId: concept.externalItemId,
        },
      };
    }),
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
const getIssuerId = (issuer: TaxIssuer | undefined): number | undefined => {
  if (!issuer) return undefined;

  const raw = issuer as TaxIssuer & {
    Id?: number;
    Tax_Issuer_Id?: number;
  };

  return issuer.taxIssuerId ?? issuer.id ?? raw.Tax_Issuer_Id ?? raw.Id;
};

const getIssuerName = (issuer: TaxIssuer | undefined): string => {
  if (!issuer) return "";

  const raw = issuer as TaxIssuer & {
    Legal_Name?: string;
    Trade_Name?: string;
    Name?: string;
  };

  return (
    normalizeText(issuer.legalName) ||
    normalizeText(issuer.name) ||
    normalizeText(issuer.tradeName) ||
    normalizeText(raw.Legal_Name) ||
    normalizeText(raw.Name) ||
    normalizeText(raw.Trade_Name)
  );
};

const getIssuerRfc = (issuer: TaxIssuer | undefined): string => {
  if (!issuer) return "";

  const raw = issuer as TaxIssuer & {
    Rfc?: string;
  };

  return normalizeRfc(issuer.rfc || raw.Rfc);
};

const getIssuerEmail = (issuer: TaxIssuer | undefined): string => {
  if (!issuer) return "";

  const raw = issuer as TaxIssuer & {
    Email?: string;
    Contact_Email?: string;
  };

  return (
    normalizeText(issuer.email) ||
    normalizeText(raw.Email) ||
    normalizeText(raw.Contact_Email)
  );
};

const getIssuerPhone = (issuer: TaxIssuer | undefined): string => {
  if (!issuer) return "";

  const raw = issuer as TaxIssuer & {
    Phone?: string;
    Contact_Phone?: string;
  };

  return (
    normalizeText(issuer.phone) ||
    normalizeText(raw.Phone) ||
    normalizeText(raw.Contact_Phone)
  );
};

const isBillableConceptLine = (concept: InvoiceConceptLine): boolean => {
  const description = normalizeText(concept.description);
  const quantity = Number(concept.quantity);
  const unitPrice = Number(concept.unitPrice);

  return (
    Boolean(description) &&
    Number.isFinite(quantity) &&
    quantity > 0 &&
    Number.isFinite(unitPrice) &&
    unitPrice > 0
  );
};

export const FacturaElectronicaPage = () => {
  const apiBaseUrl = useMemo(() => getFacturaElectronicaApiBaseUrl(), []);
  const sessionSnapshot = useMemo(() => readPosSessionSnapshot(), []);
  const [activeSection, setActiveSection] = useState<SectionId>("setup");
  const [businessDraft, setBusinessDraft] = useState<BusinessAccountDraft>(() => createInitialBusinessDraft());
  const [issuerDraft, setIssuerDraft] = useState<IssuerFiscalDraft>(() => createEmptyIssuerDraft());
  const [receiverDraft, setReceiverDraft] = useState<ReceiverDraft>(() => createEmptyReceiverDraft());
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>(() => createInitialInvoiceDraft(sessionSnapshot.employeeId));
  const [conceptLines, setConceptLines] = useState<InvoiceConceptLine[]>(() => [createManualConceptLine()]);
  const [posProductOptions, setPosProductOptions] = useState<PosInvoiceProductOption[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productImageErrors, setProductImageErrors] = useState<Record<string, true>>({});
  const [loadingPosProducts, setLoadingPosProducts] = useState(false);
  const [posProductsError, setPosProductsError] = useState<string | null>(null);
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
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  const businessPayload = useMemo(() => buildBusinessPayload(businessDraft), [businessDraft]);
  const selectedIssuer = issuers.find((issuer) => getIssuerId(issuer) === selectedIssuerId) ?? issuers[0];
  const receiverCfdiUseOptions = useMemo(() => getCfdiUseOptionsByFiscalRegime(receiverDraft.fiscalRegime), [receiverDraft.fiscalRegime]);
  const totals = useMemo(() => calculateTotals(conceptLines), [conceptLines]);
  const filteredPosProductOptions = useMemo(() => {
    const normalized = normalizeText(productSearch).toLowerCase();
    if (!normalized) return posProductOptions.slice(0, 80);
    return posProductOptions
      .filter((option) => `${option.name} ${option.description} ${option.category} ${option.sourceLabel}`.toLowerCase().includes(normalized))
      .slice(0, 80);
  }, [posProductOptions, productSearch]);

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
  const updateReceiverFiscalRegime = (value: string) => {
    setReceiverDraft((current) => {
      const fiscalRegime = normalizeText(value);
      const cfdiUseOptions = getCfdiUseOptionsByFiscalRegime(fiscalRegime);
      const shouldKeepSelectedCfdiUse = cfdiUseOptions.some((option) => option.code === current.cfdiUse);

      return {
        ...current,
        fiscalRegime,
        cfdiUse: shouldKeepSelectedCfdiUse ? current.cfdiUse : cfdiUseOptions[0]?.code ?? "",
      };
    });
  };
  const updateInvoiceDraft = (field: keyof InvoiceDraft, value: string) => setInvoiceDraft((current) => ({ ...current, [field]: field === "currency" || field === "serie" ? value.toUpperCase() : value }));
  const updateConceptLine = (id: string, field: keyof InvoiceConceptLine, value: string | number | boolean) => {
    setConceptLines((current) => current.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };
  const removeConceptLine = (id: string) => {
    setConceptLines((current) => (current.length > 1 ? current.filter((line) => line.id !== id) : current));
  };
  const addManualConceptLine = () => {
    setConceptLines((current) => [...current, createManualConceptLine()]);
  };

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
    requireValue(receiverDraft.fiscalRegime, "Selecciona el régimen fiscal del receptor.");
    requireValue(receiverDraft.taxZipCode, "Captura el código postal fiscal del receptor.");
    requireValue(receiverDraft.cfdiUse, "Selecciona el uso CFDI del receptor.");

    const isAllowedCfdiUse = getCfdiUseOptionsByFiscalRegime(receiverDraft.fiscalRegime).some((option) => option.code === receiverDraft.cfdiUse);
    if (!isAllowedCfdiUse) throw new Error("Selecciona un uso CFDI válido para el régimen fiscal del receptor.");
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
    const loadedIssuers = unwrapArray(readResponseData(response));
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
    const status = readResponseData<FacturationStatusResponse>(response);
    setSetup((current) => mapStatusToSetup(status, current));
    setActiveSection(status.readyToInvoice ? "invoice" : "setup");
    setInvoiceDraft((current) => ({
      ...current,
      expeditionPlace: current.expeditionPlace || status.expeditionPlace || status.taxZipCode || "",
      serie: current.serie || status.serie || DEFAULT_SERIE,
    }));
    setExpeditionDraft((current) => ({ ...current, zipCode: current.zipCode || status.expeditionPlace || status.taxZipCode || "" }));
    setSeriesDraft((current) => ({ ...current, serie: current.serie || status.serie || DEFAULT_SERIE }));
    return status;
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
    if (!sessionSnapshot.token || !sessionSnapshot.businessId) {
      setPosProductOptions([]);
      setPosProductsError("No encontramos sesión activa del POS para cargar productos de MainSales.");
      return;
    }

    let cancelled = false;
    const loadPosProducts = async () => {
      setLoadingPosProducts(true);
      setPosProductsError(null);
      try {
        const factory = new ModernSystemsFactory(getPosApiBaseUrl());
        const productService = factory.createPosProductService();
        const products = await productService.getSellableProducts(sessionSnapshot.businessId, sessionSnapshot.token);
        if (cancelled) return;

        const options = products.flatMap<PosInvoiceProductOption>((product) => {
          const baseOption: PosInvoiceProductOption = {
            key: `${product.id}:base`,
            productId: product.id,
            variantId: null,
            name: product.name,
            description: product.name,
            price: product.price,
            stock: product.stock,
            category: product.categoryName || "General",
            image: toAbsolutePosImageUrl(product.getPrimaryImage()),
            sourceLabel: `Producto POS #${product.id}`,
          };
          const variantOptions = product.variants
            .filter((variant) => variant.stock === null || variant.stock > 0)
            .map((variant): PosInvoiceProductOption => {
              const variantPrice = typeof variant.promotionPrice === "number" && variant.promotionPrice > 0 ? variant.promotionPrice : variant.price ?? product.price;
              const variantDescription = [product.name, variant.description, variant.color, variant.size].filter(Boolean).join(" · ");
              return {
                key: `${product.id}:${variant.id ?? "variant"}`,
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                description: variantDescription,
                price: variantPrice,
                stock: variant.stock,
                category: product.categoryName || "General",
                image: toAbsolutePosImageUrl(product.getPrimaryImage()),
                sourceLabel: `Producto POS #${product.id}${variant.id ? ` · Variante #${variant.id}` : ""}`,
              };
            });

          return [baseOption, ...variantOptions];
        });

        setPosProductOptions(options);
      } catch (cause) {
        if (!cancelled) {
          setPosProductOptions([]);
          setPosProductsError(getErrorMessage(cause));
        }
      } finally {
        if (!cancelled) setLoadingPosProducts(false);
      }
    };

    loadPosProducts();
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
        const businessAccountId = applyBusinessAccount(readResponseData(businessResponse));
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
      const id = applyBusinessAccount(readResponseData(response)) ?? getEntityId(response, ["businessAccountId", "id", "accountId"]);
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


  const addPosProductAsConcept = (option: PosInvoiceProductOption) => {
    setConceptLines((current) => [
      ...current,
      {
        id: `pos-${option.key}-${Date.now()}`,
        externalItemId: option.variantId ? `pos-product-${option.productId}-variant-${option.variantId}` : `pos-product-${option.productId}`,
        sku: option.variantId ? `POS-${option.productId}-${option.variantId}` : `POS-${option.productId}`,
        source: "pos",
        sourceLabel: option.sourceLabel,
        description: option.description,
        productServiceCode: "01010101",
        unitCode: "H87",
        unitName: "Pieza",
        quantity: 1,
        unitPrice: option.price,
        taxObject: "02",
        iva16: true,
      },
    ]);
    setPosProductsError(null);
  };

  const createInvoiceRequest = () =>
    runAction("invoiceRequest", async () => {
      if (!setup.businessAccountId) throw new Error("No se puede crear invoice_request sin businessAccountId.");
      let readyToInvoice = setup.readyToInvoice;
      if (!readyToInvoice) {
        const status = await refreshFacturationStatus(setup.businessAccountId);
        readyToInvoice = Boolean(status.readyToInvoice);
      }
      if (!readyToInvoice) throw new Error("Completa la configuración fiscal antes de emitir facturas.");
      if (!selectedIssuer) throw new Error("Selecciona un emisor fiscal configurado.");
      if (!normalizeRfc(selectedIssuer.rfc)) throw new Error("El emisor seleccionado no tiene RFC.");
      requireValue(invoiceDraft.externalDocumentId, "Captura el externalDocumentId de la venta.");
      requireValue(invoiceDraft.expeditionPlace, "Captura el lugar de expedición para el CFDI.");
      requireValue(invoiceDraft.serie, "Captura la serie para el CFDI.");
      conceptLines.forEach((concept, index) => {
        requireValue(concept.description, `Captura la descripción del concepto ${index + 1}.`);
        requireValue(concept.productServiceCode, `Captura la clave producto/servicio del concepto ${index + 1}.`);
        requireValue(concept.unitCode, `Captura la clave unidad del concepto ${index + 1}.`);
        requireValue(concept.unitName, `Captura la unidad del concepto ${index + 1}.`);
        requireValue(concept.taxObject, `Captura el objeto impuesto del concepto ${index + 1}.`);
        if (!Number.isFinite(concept.quantity) || concept.quantity <= 0) throw new Error(`Captura una cantidad mayor a cero para el concepto ${index + 1}.`);
        if (!Number.isFinite(concept.unitPrice) || concept.unitPrice <= 0) {
          throw new Error(`Captura un precio unitario mayor a cero para el concepto ${index + 1}.`);
        }
      });
      validateBusinessDraft();
      validateReceiverDraft();

      const payload = buildInvoiceRequestPayload(businessPayload, selectedIssuer, receiverDraft, invoiceDraft, conceptLines);
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

  const resetInvoiceCapture = (options: { keepReceiver: boolean }) => {
    setInvoiceDraft((current) => ({
      ...createInitialInvoiceDraft(sessionSnapshot.employeeId),
      expeditionPlace: current.expeditionPlace,
      serie: current.serie,
      currency: current.currency,
    }));
    setConceptLines([createManualConceptLine()]);
    setProductSearch("");
    setProductImageErrors({});
    setInvoiceFlow({ serie: invoiceDraft.serie || DEFAULT_SERIE });
    setMessages((current) => ({
      ...current,
      invoiceRequest: "",
      issue: "",
      viewInvoice: "",
      files: "",
    }));
    setErrors((current) => ({
      ...current,
      invoiceRequest: "",
      issue: "",
      viewInvoice: "",
      files: "",
    }));
    if (!options.keepReceiver) setReceiverDraft(createEmptyReceiverDraft());
    setShowNewInvoiceModal(false);
    setActiveSection("invoice");
  };

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
              <div className="factura-electronica__form-grid factura-electronica__form-grid--receiver">
                <label className="factura-electronica__field">RFC<input type="text" value={receiverDraft.rfc} onChange={(event) => updateReceiverDraft("rfc", event.target.value)} /></label>
                <label className="factura-electronica__field">Nombre<input type="text" value={receiverDraft.name} onChange={(event) => updateReceiverDraft("name", event.target.value)} /></label>
                <label className="factura-electronica__field">
                  Régimen fiscal
                  <select value={receiverDraft.fiscalRegime} onChange={(event) => updateReceiverFiscalRegime(event.target.value)}>
                    <option value="">Selecciona un régimen fiscal</option>
                    {RECEIVER_FISCAL_REGIME_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="factura-electronica__field">CP fiscal<input type="text" value={receiverDraft.taxZipCode} onChange={(event) => updateReceiverDraft("taxZipCode", event.target.value)} /></label>
                <label className="factura-electronica__field">
                  Uso CFDI
                  <select value={receiverDraft.cfdiUse} onChange={(event) => updateReceiverDraft("cfdiUse", event.target.value)} disabled={!receiverDraft.fiscalRegime}>
                    <option value="">{receiverDraft.fiscalRegime ? "Selecciona el uso CFDI" : "Selecciona primero un régimen fiscal"}</option>
                    {receiverCfdiUseOptions.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </label>
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
              <StepHeader number="E" title="Conceptos editables" description="Captura conceptos manualmente o agrega productos/servicios de MainSales; los datos del POS se adaptan al contexto CFDI y siguen siendo editables." />
              <div className="factura-electronica__catalog-picker">
                <div className="factura-electronica__catalog-toolbar">
                  <label className="factura-electronica__field">Buscar producto o servicio de MainSales<input type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Nombre, categoría, variante o ID" /></label>
                  <button type="button" className="factura-electronica__secondary" onClick={addManualConceptLine}>Agregar concepto manual</button>
                </div>

                {loadingPosProducts ? <p className="factura-electronica__empty">Cargando productos de MainSales...</p> : null}
                {posProductsError ? <div className="factura-electronica__error">{posProductsError}</div> : null}
                {!loadingPosProducts && !posProductsError && filteredPosProductOptions.length === 0 ? (
                  <p className="factura-electronica__empty">No encontramos productos o servicios para facturar con esa búsqueda.</p>
                ) : null}

                <div className="factura-electronica__product-grid" aria-label="Productos y servicios de MainSales">
                  {filteredPosProductOptions.map((option) => {
                    const shouldShowImage = Boolean(option.image) && !productImageErrors[option.key];

                    return (
                      <article className="factura-electronica__product-card" key={option.key}>
                        {shouldShowImage ? (
                          <img
                            src={option.image}
                            alt={option.description}
                            className="factura-electronica__product-image"
                            loading="lazy"
                            decoding="async"
                            onError={() => setProductImageErrors((current) => ({ ...current, [option.key]: true }))}
                          />
                        ) : (
                          <div className="factura-electronica__product-image-placeholder" aria-hidden="true">
                            {option.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="factura-electronica__product-content">
                          <p>{option.category}</p>
                          <h4>{option.description}</h4>
                          <small>{option.sourceLabel}{option.stock !== null ? ` · Stock ${option.stock}` : ""}</small>
                        </div>
                        <div className="factura-electronica__product-side">
                          <strong>${option.price.toFixed(2)}</strong>
                          <button type="button" onClick={() => addPosProductAsConcept(option)}>Agregar</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="factura-electronica__concept-lines" aria-label="Conceptos de la factura">
                {conceptLines.map((concept, index) => {
                  const conceptTotals = calculateConceptTotals(concept);
                  return (
                    <div className="factura-electronica__concept-line" key={concept.id}>
                      <div className="factura-electronica__concept-line-header">
                        <strong>Concepto {index + 1}</strong>
                        <span>{concept.sourceLabel}</span>
                        <button type="button" className="factura-electronica__secondary" onClick={() => removeConceptLine(concept.id)} disabled={conceptLines.length === 1}>Quitar</button>
                      </div>
                      <div className="factura-electronica__form-grid">
                        <label className="factura-electronica__field">Descripción<input type="text" value={concept.description} onChange={(event) => updateConceptLine(concept.id, "description", event.target.value)} /></label>
                        <label className="factura-electronica__field">Clave producto/servicio<input type="text" value={concept.productServiceCode} onChange={(event) => updateConceptLine(concept.id, "productServiceCode", event.target.value)} /></label>
                        <label className="factura-electronica__field">Clave unidad<input type="text" value={concept.unitCode} onChange={(event) => updateConceptLine(concept.id, "unitCode", event.target.value)} /></label>
                        <label className="factura-electronica__field">Unidad<input type="text" value={concept.unitName} onChange={(event) => updateConceptLine(concept.id, "unitName", event.target.value)} /></label>
                        <label className="factura-electronica__field">Cantidad<input type="number" min="0" step="0.01" value={concept.quantity} onChange={(event) => updateConceptLine(concept.id, "quantity", Number(event.target.value))} /></label>
                        <label className="factura-electronica__field">Precio unitario<input type="number" min="0" step="0.01" value={concept.unitPrice} onChange={(event) => updateConceptLine(concept.id, "unitPrice", Number(event.target.value))} /></label>
                        <label className="factura-electronica__field">Objeto impuesto<input type="text" value={concept.taxObject} onChange={(event) => updateConceptLine(concept.id, "taxObject", event.target.value)} /></label>
                        <label className="factura-electronica__field factura-electronica__checkbox"><input type="checkbox" checked={concept.iva16} onChange={(event) => updateConceptLine(concept.id, "iva16", event.target.checked)} /> IVA 16%</label>
                      </div>
                      <div className="factura-electronica__concept-totals">
                        <span>Subtotal: <strong>${conceptTotals.subtotal.toFixed(2)}</strong></span>
                        <span>IVA: <strong>${conceptTotals.taxesTotal.toFixed(2)}</strong></span>
                        <span>Total: <strong>${conceptTotals.total.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="factura-electronica__summary-grid">
                <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
                <div><span>IVA</span><strong>${totals.taxesTotal.toFixed(2)}</strong></div>
                <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
              </div>
            </article>

            <article className="factura-electronica__step">
              <StepHeader number="F" title="Acciones" description="Crea la solicitud, timbra y descarga archivos de la factura emitida." />
              <div className="factura-electronica__final-actions">
                <div className="factura-electronica__actions">
                  <button type="button" onClick={createInvoiceRequest} disabled={loadingAction === "invoiceRequest"}>{loadingAction === "invoiceRequest" ? "Procesando..." : "Crear solicitud de factura"}</button>
                  <button type="button" onClick={issueInvoice} disabled={loadingAction === "issue" || !invoiceFlow.invoiceRequestId}>{loadingAction === "issue" ? "Procesando..." : "Timbrar factura"}</button>
                  <button type="button" className="factura-electronica__secondary" onClick={viewInvoice} disabled={loadingAction === "viewInvoice" || !invoiceFlow.issuedInvoiceId}>Consultar factura</button>
                  <button type="button" onClick={() => downloadFile("pdf")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar PDF</button>
                  <button type="button" onClick={() => downloadFile("xml")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar XML</button>
                  <button type="button" className="factura-electronica__secondary" onClick={() => downloadFile("html")} disabled={loadingAction === "files" || !invoiceFlow.issuedInvoiceId}>Descargar HTML</button>
                </div>
                <aside className="factura-electronica__new-invoice-panel" aria-label="Generar nueva factura">
                  <div>
                    <strong>Generar nueva factura</strong>
                    <p>Inicia otra emisión conservando la configuración fiscal actual.</p>
                  </div>
                  <button type="button" className="factura-electronica__secondary" onClick={() => setShowNewInvoiceModal(true)}>Generar nueva factura</button>
                </aside>
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

      {showNewInvoiceModal ? (
        <div className="factura-electronica__modal-backdrop" role="presentation" onClick={() => setShowNewInvoiceModal(false)}>
          <section
            className="factura-electronica__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="factura-electronica-new-invoice-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h3 id="factura-electronica-new-invoice-title">Generar nueva factura</h3>
              <p>¿Quieres crear una nueva factura para el mismo receptor o capturar los datos de uno nuevo?</p>
            </div>
            <div className="factura-electronica__modal-actions">
              <button type="button" onClick={() => resetInvoiceCapture({ keepReceiver: true })}>Mismo receptor</button>
              <button type="button" onClick={() => resetInvoiceCapture({ keepReceiver: false })}>Receptor nuevo</button>
              <button type="button" className="factura-electronica__secondary" onClick={() => setShowNewInvoiceModal(false)}>Cancelar</button>
            </div>
          </section>
        </div>
      ) : null}
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
