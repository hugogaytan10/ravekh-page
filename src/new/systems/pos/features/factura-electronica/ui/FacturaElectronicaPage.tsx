import { useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { getFacturaElectronicaApiBaseUrl, getFacturaElectronicaEnvHelp } from "../config/facturaElectronicaEnv";
import { facturaElectronicaService } from "../services/facturaElectronica.service";
import {
  BuildInvoiceRequestPayloadInput,
  BusinessAccountDraft,
  BusinessAccountSyncRequest,
  CreateInvoiceRequestPayload,
  InvoiceFileFormat,
  InvoiceReceiverDraft,
  IssuerFiscalDraft,
  TaxIssuerCreateRequest,
} from "../model/facturaElectronica.types";
import "./FacturaElectronicaPage.css";

type StepId =
  | "business"
  | "issuer"
  | "csd"
  | "expeditionPlace"
  | "series"
  | "invoiceRequest"
  | "issue"
  | "viewInvoice"
  | "files";

type FlowState = {
  businessAccountId?: number;
  taxIssuerId?: number;
  invoiceRequestId?: number;
  issuedInvoiceId?: number;
  facturamaId?: string;
  uuid?: string;
  serie?: string;
  folio?: string;
  status?: string;
  total?: number;
  issuerRfc?: string;
};

const DEFAULT_SOURCE_SYSTEM = "ravekh-pos";
const DEFAULT_CURRENCY = "MXN";
const DEFAULT_SERIE = "A";
const TEST_INVOICE_TOTAL = 116;

const normalizeText = (value: string): string => value.trim();
const normalizeRfc = (value: string): string => normalizeText(value).toUpperCase();

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

const createEmptyIssuerDraft = (): IssuerFiscalDraft => ({
  rfc: "",
  legalName: "",
  tradeName: "",
  fiscalRegime: "",
  taxZipCode: "",
  email: "",
  phone: "",
});

const createEmptyReceiverDraft = (): InvoiceReceiverDraft => ({
  rfc: "",
  name: "",
  fiscalRegime: "",
  taxZipCode: "",
  cfdiUse: "",
});

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
  return {
    months: String(today.getMonth() + 1).padStart(2, "0"),
    year: String(today.getFullYear()),
  };
};

const buildInvoiceRequestPayload = ({
  businessPayload,
  issuerRfc,
  issuerTaxZipCode,
  receiverDraft,
  externalDocumentId,
  externalUserId,
}: BuildInvoiceRequestPayloadInput): CreateInvoiceRequestPayload => {
  const cfdiPeriod = getCurrentCfdiPeriod();

  return {
    sourceSystem: businessPayload.sourceSystem,
    sourceDocumentType: "order",
    externalDocumentId: normalizeText(externalDocumentId),
    externalUserId: normalizeText(externalUserId),
    business: businessPayload,
    issuer: { rfc: normalizeRfc(issuerRfc) },
    receiver: {
      rfc: normalizeRfc(receiverDraft.rfc),
      name: normalizeText(receiverDraft.name),
      fiscalRegime: normalizeText(receiverDraft.fiscalRegime),
      taxZipCode: normalizeText(receiverDraft.taxZipCode),
      cfdiUse: normalizeText(receiverDraft.cfdiUse),
    },
    cfdi: {
      type: "I",
      paymentForm: "01",
      paymentMethod: "PUE",
      currency: businessPayload.defaultCurrency,
      exchangeRate: null,
      expeditionPlace: normalizeText(issuerTaxZipCode),
      exportation: "01",
      globalInformation: {
        periodicity: "04",
        months: cfdiPeriod.months,
        year: cfdiPeriod.year,
      },
    },
    totals: {
      subtotal: 100,
      discount: 0,
      taxesTotal: 16,
      total: TEST_INVOICE_TOTAL,
    },
    concepts: [
      {
        externalItemId: "1",
        productServiceCode: "01010101",
        sku: "VENTA-MOSTRADOR",
        description: "Venta de mostrador",
        unitCode: "H87",
        unitName: "Pieza",
        quantity: 1,
        unitPrice: 100,
        discount: 0,
        subtotal: 100,
        taxObject: "02",
        total: TEST_INVOICE_TOTAL,
        taxes: [
          {
            taxCode: "002",
            taxName: "IVA",
            factorType: "Tasa",
            rate: 0.16,
            base: 100,
            amount: 16,
            isRetention: false,
          },
        ],
        metadata: { source: "frontend" },
      },
    ],
  };
};

const extractNumericId = (payload: unknown, keys: string[]): number | undefined => {
  const candidates = [payload, (payload as { data?: unknown } | null)?.data];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    for (const key of keys) {
      const value = (candidate as Record<string, unknown>)[key];
      if (typeof value === "number") return value;
      if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
    }
  }
  return undefined;
};

const getErrorMessage = (cause: unknown): string =>
  cause instanceof Error ? cause.message : "Ocurrió un error inesperado en Facturación Electrónica.";

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

const isExpectedFile = (file: File | null, extension: ".cer" | ".key"): boolean =>
  file instanceof File && file.name.toLowerCase().endsWith(extension);

const requireValue = (value: string, message: string): void => {
  if (!normalizeText(value)) throw new Error(message);
};

export const FacturaElectronicaPage = () => {
  const apiBaseUrl = useMemo(() => getFacturaElectronicaApiBaseUrl(), []);
  const sessionSnapshot = useMemo(() => readPosSessionSnapshot(), []);
  const [businessDraft, setBusinessDraft] = useState<BusinessAccountDraft>(() => createInitialBusinessDraft());
  const [issuerDraft, setIssuerDraft] = useState<IssuerFiscalDraft>(() => createEmptyIssuerDraft());
  const [receiverDraft, setReceiverDraft] = useState<InvoiceReceiverDraft>(() => createEmptyReceiverDraft());
  const [externalDocumentId, setExternalDocumentId] = useState("");
  const [flow, setFlow] = useState<FlowState>({
    total: TEST_INVOICE_TOTAL,
    serie: DEFAULT_SERIE,
  });
  const [loadingStep, setLoadingStep] = useState<StepId | null>(null);
  const [results, setResults] = useState<Partial<Record<StepId, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<StepId, string>>>({});
  const [certificate, setCertificate] = useState<File | null>(null);
  const [privateKey, setPrivateKey] = useState<File | null>(null);
  const [privateKeyPassword, setPrivateKeyPassword] = useState("");

  useEffect(() => {
    if (!sessionSnapshot.token || !sessionSnapshot.businessId) return;

    let cancelled = false;

    try {
      const posApiBaseUrl = getPosApiBaseUrl();
      fetch(new URL(`business/${sessionSnapshot.businessId}`, posApiBaseUrl).toString(), {
        headers: {
          "Content-Type": "application/json",
          token: sessionSnapshot.token,
          Authorization: `Bearer ${sessionSnapshot.token}`,
        },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { Name?: string; name?: string; Email?: string; email?: string; Phone?: string; phone?: string } | null) => {
          if (cancelled || !payload) return;
          const businessName = String(payload.Name ?? payload.name ?? "").trim();
          const email = String(payload.Email ?? payload.email ?? "").trim();
          const phone = String(payload.Phone ?? payload.phone ?? "").trim();

          setBusinessDraft((current) => ({
            ...current,
            businessName: current.businessName || businessName,
            tradeName: current.tradeName || businessName,
            contactEmail: current.contactEmail || email,
            contactPhone: current.contactPhone || phone,
          }));
          setIssuerDraft((current) => ({
            ...current,
            tradeName: current.tradeName || businessName,
            email: current.email || email,
            phone: current.phone || phone,
          }));
        })
        .catch(() => undefined);
    } catch {
      // POS API configuration is independent from the billing API; keep manual fields available.
    }

    return () => {
      cancelled = true;
    };
  }, [sessionSnapshot.businessId, sessionSnapshot.token]);

  const normalizedIssuerRfc = normalizeRfc(issuerDraft.rfc);
  const normalizedIssuerZipCode = normalizeText(issuerDraft.taxZipCode);
  const businessPayload = buildBusinessPayload(businessDraft);

  const updateBusinessDraft = (field: keyof BusinessAccountDraft, value: string) => {
    setBusinessDraft((current) => ({ ...current, [field]: value }));
  };

  const updateIssuerDraft = (field: keyof IssuerFiscalDraft, value: string) => {
    setIssuerDraft((current) => ({ ...current, [field]: field === "rfc" ? value.toUpperCase() : value }));
  };

  const updateReceiverDraft = (field: keyof InvoiceReceiverDraft, value: string) => {
    setReceiverDraft((current) => ({ ...current, [field]: field === "rfc" ? value.toUpperCase() : value }));
  };

  const validateBusinessDraft = () => {
    requireValue(businessPayload.sourceSystem, "Captura el sistema origen del negocio.");
    requireValue(businessPayload.externalBusinessId, "Captura el ID externo del negocio.");
    requireValue(businessPayload.businessName, "Captura el nombre del negocio.");
  };

  const validateIssuerDraft = () => {
    requireValue(normalizedIssuerRfc, "Captura el RFC del emisor fiscal.");
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

  const setStepResult = (step: StepId, message: string) => {
    setResults((current) => ({ ...current, [step]: message }));
    setErrors((current) => ({ ...current, [step]: "" }));
  };

  const runStep = async (step: StepId, action: () => Promise<void>) => {
    if (!apiBaseUrl) {
      setErrors((current) => ({ ...current, [step]: getFacturaElectronicaEnvHelp() }));
      return;
    }

    setLoadingStep(step);
    setErrors((current) => ({ ...current, [step]: "" }));
    try {
      await action();
    } catch (cause) {
      setErrors((current) => ({ ...current, [step]: getErrorMessage(cause) }));
    } finally {
      setLoadingStep(null);
    }
  };

  const syncBusiness = () =>
    runStep("business", async () => {
      validateBusinessDraft();
      console.log("Syncing business with payload:", businessPayload);
      const response = await facturaElectronicaService.syncBusinessAccount(businessPayload);
      const id = extractNumericId(response, ["businessAccountId", "id", "accountId"]);
      setFlow((current) => ({ ...current, businessAccountId: id ?? current.businessAccountId }));
      setStepResult("business", `Negocio sincronizado. ID: ${id ?? "revisa la respuesta del backend"}.`);
    });

  const createIssuer = () =>
    runStep("issuer", async () => {
      if (!flow.businessAccountId) throw new Error("Primero sincroniza el negocio para obtener businessAccountId.");
      validateIssuerDraft();
      const payload = buildIssuerPayload(flow.businessAccountId, issuerDraft);
      const response = await facturaElectronicaService.createTaxIssuer(payload);
      const id = extractNumericId(response, ["taxIssuerId", "id", "issuerId"]);
      setFlow((current) => ({ ...current, taxIssuerId: id ?? current.taxIssuerId, issuerRfc: payload.rfc }));
      setStepResult("issuer", `Emisor fiscal configurado para RFC ${payload.rfc}. ID: ${id ?? "revisa la respuesta del backend"}.`);
    });

  const uploadCsd = () =>
    runStep("csd", async () => {
      if (!flow.taxIssuerId) throw new Error("Primero crea el emisor fiscal para obtener taxIssuerId.");
      if (!isExpectedFile(certificate, ".cer")) throw new Error("Selecciona un archivo de certificado válido con extensión .cer.");
      if (!isExpectedFile(privateKey, ".key")) throw new Error("Selecciona un archivo de llave privada válido con extensión .key.");
      if (!privateKeyPassword.trim()) throw new Error("Captura la contraseña de la llave privada.");

      await facturaElectronicaService.uploadTaxIssuerCsd(flow.taxIssuerId, {
        certificate,
        privateKey,
        privateKeyPassword,
      });
      setStepResult("csd", "CSD enviado como multipart/form-data. El frontend no convirtió archivos a base64.");
    });

  const createExpeditionPlace = () =>
    runStep("expeditionPlace", async () => {
      if (!flow.taxIssuerId) throw new Error("Primero crea el emisor fiscal.");
      validateIssuerDraft();
      await facturaElectronicaService.createExpeditionPlace(flow.taxIssuerId, {
        zipCode: normalizedIssuerZipCode,
        description: "Sucursal principal",
        isDefault: true,
        status: "active",
      });
      setStepResult("expeditionPlace", `Lugar de expedición ${normalizedIssuerZipCode} configurado como predeterminado.`);
    });

  const createSeries = () =>
    runStep("series", async () => {
      if (!flow.taxIssuerId) throw new Error("Primero crea el emisor fiscal.");
      await facturaElectronicaService.createInvoiceSeries(flow.taxIssuerId, {
        serie: DEFAULT_SERIE,
        nextFolio: 1,
        status: "active",
      });
      setFlow((current) => ({ ...current, serie: DEFAULT_SERIE }));
      setStepResult("series", `Serie ${DEFAULT_SERIE} creada con siguiente folio 1.`);
    });

  const createInvoiceRequest = () =>
    runStep("invoiceRequest", async () => {
      validateBusinessDraft();
      validateIssuerDraft();
      validateReceiverDraft();
      requireValue(externalDocumentId, "Captura el Documento externo / venta ID.");

      const payload = buildInvoiceRequestPayload({
        businessPayload,
        issuerRfc: normalizedIssuerRfc,
        issuerTaxZipCode: normalizedIssuerZipCode,
        receiverDraft,
        externalDocumentId,
        externalUserId: sessionSnapshot.employeeId > 0 ? String(sessionSnapshot.employeeId) : "frontend",
      });
      const response = await facturaElectronicaService.createInvoiceRequest(payload);
      const id = extractNumericId(response, ["invoiceRequestId", "id", "requestId"]);
      setFlow((current) => ({
        ...current,
        invoiceRequestId: id ?? current.invoiceRequestId,
        issuerRfc: payload.issuer.rfc,
        total: payload.totals.total,
      }));
      setStepResult("invoiceRequest", `Solicitud de factura creada con RFC emisor ${payload.issuer.rfc}. ID: ${id ?? "revisa la respuesta del backend"}. Total: $${payload.totals.total}.`);
    });

  const issueInvoice = () =>
    runStep("issue", async () => {
      if (!flow.invoiceRequestId) throw new Error("No se puede timbrar porque falta invoiceRequestId.");
      const response = await facturaElectronicaService.issueInvoice(flow.invoiceRequestId, { serie: DEFAULT_SERIE, downloadFiles: false });
      const issued = response.data;
      setFlow((current) => ({
        ...current,
        invoiceRequestId: issued.invoiceRequestId,
        issuedInvoiceId: issued.issuedInvoiceId,
        facturamaId: issued.facturamaId,
        uuid: issued.uuid,
        serie: issued.serie,
        folio: issued.folio,
        status: issued.status,
      }));
      setStepResult("issue", `Factura timbrada correctamente. UUID: ${issued.uuid || "pendiente en respuesta"}.`);
    });

  const viewInvoice = () =>
    runStep("viewInvoice", async () => {
      if (!flow.issuedInvoiceId) throw new Error("Primero timbra la factura para obtener issuedInvoiceId.");
      const response = await facturaElectronicaService.getInvoiceById(flow.issuedInvoiceId);
      setStepResult("viewInvoice", JSON.stringify(response, null, 2));
    });

  const downloadFile = (format: InvoiceFileFormat) =>
    runStep("files", async () => {
      if (!flow.issuedInvoiceId) throw new Error("No se pueden descargar archivos porque falta issuedInvoiceId.");
      const file = await facturaElectronicaService.downloadInvoiceFile(flow.issuedInvoiceId, format);
      triggerBrowserDownload(file.blob, file.filename);
      setStepResult("files", `${format.toUpperCase()} descargado desde el backend de facturación (${file.contentType}).`);
    });

  const steps: Array<{ id: StepId; title: string; description: string; actionLabel?: string; onAction?: () => void }> = [
    { id: "business", title: "Configurar negocio", description: "Sincroniza la cuenta de negocio actual o capturada con el backend independiente.", actionLabel: "Sincronizar negocio", onAction: syncBusiness },
    { id: "issuer", title: "Configurar emisor fiscal", description: "Captura los datos fiscales del emisor que se usarán para crear el tax issuer y la solicitud de factura.", actionLabel: "Crear emisor", onAction: createIssuer },
    { id: "csd", title: "Subir CSD (.cer y .key)", description: "Envía certificado y llave como multipart/form-data. El backend hará la conversión necesaria.", actionLabel: "Subir CSD", onAction: uploadCsd },
    { id: "expeditionPlace", title: "Configurar lugar de expedición", description: "Registra como sucursal principal el CP fiscal capturado del emisor.", actionLabel: "Crear lugar", onAction: createExpeditionPlace },
    { id: "series", title: "Configurar serie y folio", description: `Crea la serie ${DEFAULT_SERIE} con siguiente folio 1 para el emisor.`, actionLabel: "Crear serie", onAction: createSeries },
    { id: "invoiceRequest", title: "Crear solicitud de factura", description: "Genera una solicitud controlada de prueba para el documento externo capturado.", actionLabel: "Crear solicitud", onAction: createInvoiceRequest },
    { id: "issue", title: "Timbrar factura", description: "Emite la factura usando la serie configurada. Requiere invoiceRequestId.", actionLabel: "Timbrar factura", onAction: issueInvoice },
    { id: "viewInvoice", title: "Ver factura emitida", description: "Consulta la factura emitida por ID local del backend.", actionLabel: "Consultar factura", onAction: viewInvoice },
    { id: "files", title: "Descargar PDF / XML / HTML", description: "Descarga archivos desde las rutas locales del backend de facturación." },
  ];

  return (
    <PosV2Shell title="Facturación electrónica" subtitle="Flujo controlado de prueba para CFDI">
      <section className="factura-electronica">
        <header className="factura-electronica__hero">
          <h2>Facturación Electrónica</h2>
          <p>Menú paso a paso para validar el backend independiente de facturación sin integrar todavía ventas reales del POS.</p>
          {!apiBaseUrl ? <div className="factura-electronica__notice">{getFacturaElectronicaEnvHelp()}</div> : null}
        </header>

        <section className="factura-electronica__summary" aria-label="Estado temporal del flujo">
          <h3>Estado del flujo</h3>
          <div className="factura-electronica__summary-grid">
            <div><span>Business ID</span><strong>{flow.businessAccountId ?? "Pendiente"}</strong></div>
            <div><span>Tax issuer ID</span><strong>{flow.taxIssuerId ?? "Pendiente"}</strong></div>
            <div><span>RFC emisor</span><strong>{flow.issuerRfc || normalizedIssuerRfc || "Pendiente"}</strong></div>
            <div><span>Invoice request ID</span><strong>{flow.invoiceRequestId ?? "Pendiente"}</strong></div>
            <div><span>Issued invoice ID</span><strong>{flow.issuedInvoiceId ?? "Pendiente"}</strong></div>
            <div><span>UUID</span><strong>{flow.uuid ?? "Pendiente"}</strong></div>
            <div><span>Serie / folio</span><strong>{flow.serie ?? "-"} {flow.folio ?? ""}</strong></div>
            <div><span>Total / status</span><strong>${flow.total ?? TEST_INVOICE_TOTAL} · {flow.status ?? "Pendiente"}</strong></div>
          </div>
        </section>

        <section className="factura-electronica__steps" aria-label="Pasos de facturación electrónica">
          {steps.map((step, index) => (
            <article className="factura-electronica__step" key={step.id}>
              <div className="factura-electronica__step-header">
                <span className="factura-electronica__step-number">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>

              {step.id === "business" ? (
                <div className="factura-electronica__form-grid">
                  <label className="factura-electronica__field">Sistema origen<input type="text" value={businessDraft.sourceSystem} onChange={(event) => updateBusinessDraft("sourceSystem", event.target.value)} /></label>
                  <label className="factura-electronica__field">ID externo del negocio<input type="text" value={businessDraft.externalBusinessId} onChange={(event) => updateBusinessDraft("externalBusinessId", event.target.value)} /></label>
                  <label className="factura-electronica__field">Nombre del negocio<input type="text" value={businessDraft.businessName} onChange={(event) => updateBusinessDraft("businessName", event.target.value)} /></label>
                  <label className="factura-electronica__field">Nombre comercial<input type="text" value={businessDraft.tradeName} onChange={(event) => updateBusinessDraft("tradeName", event.target.value)} /></label>
                  <label className="factura-electronica__field">Email de contacto<input type="email" value={businessDraft.contactEmail} onChange={(event) => updateBusinessDraft("contactEmail", event.target.value)} /></label>
                  <label className="factura-electronica__field">Teléfono de contacto<input type="tel" value={businessDraft.contactPhone} onChange={(event) => updateBusinessDraft("contactPhone", event.target.value)} /></label>
                  <label className="factura-electronica__field">Moneda<input type="text" value={businessDraft.defaultCurrency} onChange={(event) => updateBusinessDraft("defaultCurrency", event.target.value.toUpperCase())} /></label>
                </div>
              ) : null}

              {step.id === "issuer" ? (
                <div className="factura-electronica__form-grid">
                  <label className="factura-electronica__field">RFC<input type="text" value={issuerDraft.rfc} onChange={(event) => updateIssuerDraft("rfc", event.target.value)} /></label>
                  <label className="factura-electronica__field">Razón social<input type="text" value={issuerDraft.legalName} onChange={(event) => updateIssuerDraft("legalName", event.target.value)} /></label>
                  <label className="factura-electronica__field">Nombre comercial<input type="text" value={issuerDraft.tradeName} onChange={(event) => updateIssuerDraft("tradeName", event.target.value)} /></label>
                  <label className="factura-electronica__field">Régimen fiscal<input type="text" value={issuerDraft.fiscalRegime} onChange={(event) => updateIssuerDraft("fiscalRegime", event.target.value)} /></label>
                  <label className="factura-electronica__field">Código postal fiscal<input type="text" value={issuerDraft.taxZipCode} onChange={(event) => updateIssuerDraft("taxZipCode", event.target.value)} /></label>
                  <label className="factura-electronica__field">Email<input type="email" value={issuerDraft.email} onChange={(event) => updateIssuerDraft("email", event.target.value)} /></label>
                  <label className="factura-electronica__field">Teléfono<input type="tel" value={issuerDraft.phone} onChange={(event) => updateIssuerDraft("phone", event.target.value)} /></label>
                </div>
              ) : null}

              {step.id === "csd" ? (
                <div className="factura-electronica__files">
                  <label className="factura-electronica__field">Certificado .cer<input type="file" accept=".cer" onChange={(event) => setCertificate(event.target.files?.[0] ?? null)} /></label>
                  <label className="factura-electronica__field">Llave privada .key<input type="file" accept=".key" onChange={(event) => setPrivateKey(event.target.files?.[0] ?? null)} /></label>
                  <label className="factura-electronica__field">Contraseña<input type="password" value={privateKeyPassword} onChange={(event) => setPrivateKeyPassword(event.target.value)} /></label>
                </div>
              ) : null}

              {step.id === "invoiceRequest" ? (
                <div className="factura-electronica__form-grid">
                  <label className="factura-electronica__field">Documento externo / venta ID<input type="text" value={externalDocumentId} onChange={(event) => setExternalDocumentId(event.target.value)} /></label>
                  <label className="factura-electronica__field">RFC receptor<input type="text" value={receiverDraft.rfc} onChange={(event) => updateReceiverDraft("rfc", event.target.value)} /></label>
                  <label className="factura-electronica__field">Nombre receptor<input type="text" value={receiverDraft.name} onChange={(event) => updateReceiverDraft("name", event.target.value)} /></label>
                  <label className="factura-electronica__field">Régimen fiscal receptor<input type="text" value={receiverDraft.fiscalRegime} onChange={(event) => updateReceiverDraft("fiscalRegime", event.target.value)} /></label>
                  <label className="factura-electronica__field">CP fiscal receptor<input type="text" value={receiverDraft.taxZipCode} onChange={(event) => updateReceiverDraft("taxZipCode", event.target.value)} /></label>
                  <label className="factura-electronica__field">Uso CFDI<input type="text" value={receiverDraft.cfdiUse} onChange={(event) => updateReceiverDraft("cfdiUse", event.target.value)} /></label>
                </div>
              ) : null}

              <div className="factura-electronica__actions">
                {step.onAction && step.actionLabel ? (
                  <button type="button" onClick={step.onAction} disabled={loadingStep === step.id}>
                    {loadingStep === step.id ? "Procesando..." : step.actionLabel}
                  </button>
                ) : null}
                {step.id === "files" ? (
                  <>
                    <button type="button" onClick={() => downloadFile("pdf")} disabled={loadingStep === "files"}>Descargar PDF</button>
                    <button type="button" onClick={() => downloadFile("xml")} disabled={loadingStep === "files"}>Descargar XML</button>
                    <button type="button" className="factura-electronica__secondary" onClick={() => downloadFile("html")} disabled={loadingStep === "files"}>Ver/Descargar HTML</button>
                  </>
                ) : null}
              </div>

              {errors[step.id] ? <div className="factura-electronica__error">{errors[step.id]}</div> : null}
              {results[step.id] ? <div className="factura-electronica__result">{results[step.id]}</div> : null}
            </article>
          ))}
        </section>
      </section>
    </PosV2Shell>
  );
};
