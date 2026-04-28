import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { FacturationInvoice, TaxIssuerStatus } from "../model/Facturation";
import "./PosV2FacturationPage.css";

const API_BASE_URL = getPosApiBaseUrl();

const STATUS_LABELS: Record<TaxIssuerStatus, string> = {
  draft: "Borrador",
  pending_csd: "Pendiente CSD",
  validating: "Validando",
  active: "Activo",
  inactive: "Inactivo",
  rejected: "Rechazado",
  expired: "Expirado",
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const PosV2FacturationPage = () => {
  const session = useMemo(() => readPosSessionSnapshot(), []);
  const token = session.token;
  const businessId = session.businessId;

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosFacturationPage();
  }, []);

  const [loadingIssuer, setLoadingIssuer] = useState(false);
  const [savingIssuer, setSavingIssuer] = useState(false);
  const [uploadingCsd, setUploadingCsd] = useState(false);
  const [activating, setActivating] = useState(false);
  const [workingInvoice, setWorkingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [issuerId, setIssuerId] = useState("");
  const [issuerStatus, setIssuerStatus] = useState<TaxIssuerStatus>("draft");
  const [issuerRfc, setIssuerRfc] = useState("");
  const [issuerLegalName, setIssuerLegalName] = useState("");
  const [issuerFiscalRegime, setIssuerFiscalRegime] = useState("");
  const [issuerFiscalZipCode, setIssuerFiscalZipCode] = useState("");
  const [issuerEmail, setIssuerEmail] = useState("");
  const [issuerPhone, setIssuerPhone] = useState("");

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [privateKeyPassword, setPrivateKeyPassword] = useState("");

  const [orderId, setOrderId] = useState("");
  const [paymentForm, setPaymentForm] = useState("01");
  const [paymentMethod, setPaymentMethod] = useState("PUE");
  const [currency, setCurrency] = useState("MXN");
  const [exportation, setExportation] = useState("01");
  const [receiverRfc, setReceiverRfc] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverFiscalRegime, setReceiverFiscalRegime] = useState("");
  const [receiverCfdiUse, setReceiverCfdiUse] = useState("G03");
  const [receiverTaxZipCode, setReceiverTaxZipCode] = useState("");

  const [invoiceLookupId, setInvoiceLookupId] = useState("");
  const [activeInvoice, setActiveInvoice] = useState<FacturationInvoice | null>(null);

  const [sendEmailValue, setSendEmailValue] = useState("");
  const [cancelMotive, setCancelMotive] = useState("02");
  const [uuidReplacement, setUuidReplacement] = useState("");

  const loadIssuer = async () => {
    if (!token || !businessId) {
      setError("No hay sesión activa para consultar facturación.");
      return;
    }

    setLoadingIssuer(true);
    setError(null);
    try {
      const issuer = await page.getTaxIssuerByBusiness(businessId, token);
      if (!issuer) {
        setIssuerId("");
        setIssuerStatus("draft");
        setSuccess("Este negocio todavía no tiene emisor fiscal configurado.");
        return;
      }

      setIssuerId(issuer.id);
      setIssuerStatus(issuer.status);
      setIssuerRfc(issuer.rfc);
      setIssuerLegalName(issuer.legalName);
      setIssuerFiscalRegime(issuer.fiscalRegime);
      setIssuerFiscalZipCode(issuer.fiscalZipCode);
      setIssuerEmail(issuer.email);
      setIssuerPhone(issuer.phone);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible consultar el emisor fiscal.");
    } finally {
      setLoadingIssuer(false);
    }
  };

  useEffect(() => {
    loadIssuer();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleIssuerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !businessId) return;

    setSavingIssuer(true);
    clearMessages();
    try {
      const issuer = await page.upsertTaxIssuer({
        businessId,
        rfc: issuerRfc.trim(),
        legalName: issuerLegalName.trim(),
        fiscalRegime: issuerFiscalRegime.trim(),
        fiscalZipCode: issuerFiscalZipCode.trim(),
        email: issuerEmail.trim(),
        phone: issuerPhone.trim(),
        status: issuerStatus,
      }, token);

      setIssuerId(issuer.id);
      setIssuerStatus(issuer.status);
      setSuccess("Emisor fiscal guardado correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el emisor fiscal.");
    } finally {
      setSavingIssuer(false);
    }
  };

  const handleUploadCsd = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !issuerId || !certificateFile || !privateKeyFile || !privateKeyPassword.trim()) {
      setError("Selecciona los archivos .cer/.key y captura la contraseña privada.");
      return;
    }

    setUploadingCsd(true);
    clearMessages();
    try {
      const updatedIssuer = await page.uploadCsd(issuerId, {
        certificateFile,
        privateKeyFile,
        privateKeyPassword: privateKeyPassword.trim(),
      }, token);

      setIssuerStatus(updatedIssuer.status);
      setPrivateKeyPassword("");
      setSuccess("CSD cargado correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar el CSD.");
    } finally {
      setUploadingCsd(false);
    }
  };

  const handleActivateIssuer = async () => {
    if (!token || !issuerId) return;

    setActivating(true);
    clearMessages();
    try {
      const status = await page.activateTaxIssuer(issuerId, token);
      setIssuerStatus(status);
      setSuccess(`Estatus actualizado: ${STATUS_LABELS[status]}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible activar el emisor fiscal.");
    } finally {
      setActivating(false);
    }
  };

  const handleValidateRfc = async () => {
    if (!token || !receiverRfc.trim()) {
      setError("Captura un RFC receptor para validar.");
      return;
    }

    setWorkingInvoice(true);
    clearMessages();
    try {
      const validation = await page.validateReceiverRfc(receiverRfc.trim(), token);
      if (validation.valid) {
        setSuccess(validation.message || "RFC válido para facturar.");
      } else {
        setError(validation.message || "RFC inválido.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible validar el RFC.");
    } finally {
      setWorkingInvoice(false);
    }
  };

  const handleCreateInvoice = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setWorkingInvoice(true);
    clearMessages();
    try {
      const invoice = await page.createInvoice({
        orderId: orderId.trim(),
        paymentForm: paymentForm.trim(),
        paymentMethod: paymentMethod.trim(),
        currency: currency.trim(),
        exportation: exportation.trim(),
        receiver: {
          rfc: receiverRfc.trim(),
          name: receiverName.trim(),
          email: receiverEmail.trim(),
          fiscalRegime: receiverFiscalRegime.trim(),
          cfdiUse: receiverCfdiUse.trim(),
          taxZipCode: receiverTaxZipCode.trim(),
        },
      }, token);

      setActiveInvoice(invoice);
      setInvoiceLookupId(invoice.id);
      setSuccess("Factura creada correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible crear la factura.");
    } finally {
      setWorkingInvoice(false);
    }
  };

  const handleLookupInvoice = async () => {
    if (!token || !invoiceLookupId.trim()) {
      setError("Captura un ID de factura para consultar.");
      return;
    }

    setWorkingInvoice(true);
    clearMessages();
    try {
      const invoice = await page.getInvoiceById(invoiceLookupId.trim(), token);
      setActiveInvoice(invoice);
      setSuccess("Factura consultada correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible consultar la factura.");
    } finally {
      setWorkingInvoice(false);
    }
  };

  const handleDownloadFile = async (fileType: "pdf" | "xml") => {
    if (!token || !activeInvoice?.id) return;

    setWorkingInvoice(true);
    clearMessages();
    try {
      const blob = await page.downloadInvoiceFile(activeInvoice.id, fileType, token);
      downloadBlob(blob, `${activeInvoice.uuid || activeInvoice.id}.${fileType}`);
      setSuccess(`${fileType.toUpperCase()} descargado correctamente.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No fue posible descargar ${fileType.toUpperCase()}.`);
    } finally {
      setWorkingInvoice(false);
    }
  };

  const handleSendEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !activeInvoice?.id || !sendEmailValue.trim()) {
      setError("Captura un correo y selecciona una factura.");
      return;
    }

    setWorkingInvoice(true);
    clearMessages();
    try {
      await page.sendInvoiceEmail(activeInvoice.id, sendEmailValue.trim(), token);
      setSuccess("Factura enviada por correo correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible enviar la factura por correo.");
    } finally {
      setWorkingInvoice(false);
    }
  };

  const handleCancelInvoice = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !activeInvoice?.id || !cancelMotive.trim()) {
      setError("Selecciona una factura y captura el motivo de cancelación.");
      return;
    }

    setWorkingInvoice(true);
    clearMessages();
    try {
      await page.cancelInvoice(activeInvoice.id, { motive: cancelMotive.trim(), uuidReplacement: uuidReplacement.trim() || undefined }, token);
      setSuccess("Factura cancelada correctamente.");
      await handleLookupInvoice();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cancelar la factura.");
    } finally {
      setWorkingInvoice(false);
    }
  };

  const isIssuerActive = issuerStatus === "active";

  return (
    <PosV2Shell title="Facturación" subtitle="Gestión integral de emisor fiscal y CFDI">
      <section className="pos-v2-facturation">
        <header className="pos-v2-facturation__head">
          <h2>Facturación</h2>
          <button type="button" onClick={loadIssuer} disabled={loadingIssuer}>{loadingIssuer ? "Actualizando..." : "Actualizar estado"}</button>
        </header>

        {error ? <p className="pos-v2-facturation__error">{error}</p> : null}
        {success ? <p className="pos-v2-facturation__success">{success}</p> : null}

        <article className="pos-v2-facturation__card">
          <h3>Estado del emisor</h3>
          <div className="pos-v2-facturation__grid">
            <p><strong>RFC:</strong> {issuerRfc || "Sin configurar"}</p>
            <p><strong>Razón social:</strong> {issuerLegalName || "Sin configurar"}</p>
            <p><strong>Estatus:</strong> {STATUS_LABELS[issuerStatus]}</p>
            <p><strong>ID emisor:</strong> {issuerId || "Pendiente"}</p>
          </div>
        </article>

        <form className="pos-v2-facturation__card" onSubmit={handleIssuerSubmit}>
          <h3>Configuración fiscal</h3>
          <div className="pos-v2-facturation__form-grid">
            <input value={issuerRfc} onChange={(event) => setIssuerRfc(event.target.value)} placeholder="RFC" required />
            <input value={issuerLegalName} onChange={(event) => setIssuerLegalName(event.target.value)} placeholder="Razón social" required />
            <input value={issuerFiscalRegime} onChange={(event) => setIssuerFiscalRegime(event.target.value)} placeholder="Régimen fiscal" required />
            <input value={issuerFiscalZipCode} onChange={(event) => setIssuerFiscalZipCode(event.target.value)} placeholder="Código postal fiscal" required />
            <input value={issuerEmail} onChange={(event) => setIssuerEmail(event.target.value)} type="email" placeholder="Correo" required />
            <input value={issuerPhone} onChange={(event) => setIssuerPhone(event.target.value)} placeholder="Teléfono" required />
          </div>
          <button type="submit" className="is-primary" disabled={savingIssuer}>{savingIssuer ? "Guardando..." : "Guardar emisor"}</button>
        </form>

        <form className="pos-v2-facturation__card" onSubmit={handleUploadCsd}>
          <h3>Carga de certificados CSD</h3>
          <div className="pos-v2-facturation__form-grid">
            <label>
              Archivo .cer
              <input type="file" accept=".cer" onChange={(event) => setCertificateFile(event.target.files?.[0] ?? null)} />
            </label>
            <label>
              Archivo .key
              <input type="file" accept=".key" onChange={(event) => setPrivateKeyFile(event.target.files?.[0] ?? null)} />
            </label>
            <input value={privateKeyPassword} onChange={(event) => setPrivateKeyPassword(event.target.value)} type="password" placeholder="Contraseña llave privada" />
          </div>
          <button type="submit" disabled={!issuerId || uploadingCsd}>{uploadingCsd ? "Subiendo..." : "Subir CSD"}</button>
        </form>

        <article className="pos-v2-facturation__card">
          <h3>Activación</h3>
          <button type="button" className="is-primary" disabled={!issuerId || activating} onClick={handleActivateIssuer}>
            {activating ? "Activando..." : "Activar emisor"}
          </button>
        </article>

        <form className="pos-v2-facturation__card" onSubmit={handleCreateInvoice}>
          <h3>Facturación</h3>
          <div className="pos-v2-facturation__actions-row">
            <button type="button" onClick={handleValidateRfc} disabled={!receiverRfc || workingInvoice || !isIssuerActive}>Validar RFC receptor</button>
          </div>

          <div className="pos-v2-facturation__form-grid">
            <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="orderId" required />
            <input value={paymentForm} onChange={(event) => setPaymentForm(event.target.value)} placeholder="paymentForm" required />
            <input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} placeholder="paymentMethod" required />
            <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="currency" required />
            <input value={exportation} onChange={(event) => setExportation(event.target.value)} placeholder="exportation" required />
            <input value={receiverRfc} onChange={(event) => setReceiverRfc(event.target.value)} placeholder="receiver.rfc" required />
            <input value={receiverName} onChange={(event) => setReceiverName(event.target.value)} placeholder="receiver.name" required />
            <input value={receiverEmail} onChange={(event) => setReceiverEmail(event.target.value)} placeholder="receiver.email" type="email" required />
            <input value={receiverFiscalRegime} onChange={(event) => setReceiverFiscalRegime(event.target.value)} placeholder="receiver.fiscalRegime" required />
            <input value={receiverCfdiUse} onChange={(event) => setReceiverCfdiUse(event.target.value)} placeholder="receiver.cfdiUse" required />
            <input value={receiverTaxZipCode} onChange={(event) => setReceiverTaxZipCode(event.target.value)} placeholder="receiver.taxZipCode" required />
          </div>

          <button type="submit" className="is-primary" disabled={workingInvoice || !isIssuerActive}>{workingInvoice ? "Procesando..." : "Crear factura"}</button>
          {!isIssuerActive ? <small className="pos-v2-facturation__warning">Debes tener un emisor activo para facturar.</small> : null}
        </form>

        <article className="pos-v2-facturation__card">
          <h3>Facturas emitidas / detalle</h3>
          <div className="pos-v2-facturation__actions-row">
            <input value={invoiceLookupId} onChange={(event) => setInvoiceLookupId(event.target.value)} placeholder="ID de factura" />
            <button type="button" onClick={handleLookupInvoice} disabled={workingInvoice}>Consultar factura</button>
          </div>

          {activeInvoice ? (
            <div className="pos-v2-facturation__invoice">
              <p><strong>Folio:</strong> {activeInvoice.folio || "—"}</p>
              <p><strong>UUID:</strong> {activeInvoice.uuid || "—"}</p>
              <p><strong>Facturama ID:</strong> {activeInvoice.facturamaId || "—"}</p>
              <p><strong>Status:</strong> {activeInvoice.status || "—"}</p>
              <p><strong>Receptor:</strong> {activeInvoice.receiver?.name || "—"} ({activeInvoice.receiver?.rfc || "—"})</p>
              <p><strong>Emisor:</strong> {activeInvoice.issuer?.legalName || "—"}</p>
              <p><strong>Fecha:</strong> {activeInvoice.createdAt || "—"}</p>
            </div>
          ) : (
            <p className="pos-v2-facturation__empty">Aún no hay una factura consultada.</p>
          )}
        </article>

        <article className="pos-v2-facturation__card">
          <h3>Acciones del CFDI</h3>
          <div className="pos-v2-facturation__actions-row">
            <button type="button" onClick={() => handleDownloadFile("pdf")} disabled={workingInvoice || !activeInvoice?.id}>Descargar PDF</button>
            <button type="button" onClick={() => handleDownloadFile("xml")} disabled={workingInvoice || !activeInvoice?.id}>Descargar XML</button>
          </div>

          <form onSubmit={handleSendEmail} className="pos-v2-facturation__inline-form">
            <input value={sendEmailValue} onChange={(event) => setSendEmailValue(event.target.value)} type="email" placeholder="Correo destino" />
            <button type="submit" disabled={workingInvoice || !activeInvoice?.id}>Enviar por correo</button>
          </form>

          <form onSubmit={handleCancelInvoice} className="pos-v2-facturation__inline-form">
            <input value={cancelMotive} onChange={(event) => setCancelMotive(event.target.value)} placeholder="Motivo cancelación" required />
            <input value={uuidReplacement} onChange={(event) => setUuidReplacement(event.target.value)} placeholder="UUID reemplazo (opcional)" />
            <button type="submit" className="is-danger" disabled={workingInvoice || !activeInvoice?.id}>Cancelar factura</button>
          </form>
        </article>
      </section>
    </PosV2Shell>
  );
};
