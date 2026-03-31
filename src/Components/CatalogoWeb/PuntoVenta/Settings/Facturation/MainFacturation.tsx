import React, { useContext, useMemo, useState } from "react";
import { Header } from "../../Utilities/Header";
import { AppContext } from "../../../Context/AppContext";
import { ThemeLight } from "../../Theme/Theme";
import {
  createInvoice,
  getInvoiceById,
  getInvoicePdf,
  InvoicePayload,
} from "./Petitions";

const initialForm: InvoicePayload = {
  orderId: 0,
  emitterRfc: "",
  expeditionPlace: "",
  paymentForm: "",
  paymentMethod: "PUE",
  receiver: {
    rfc: "",
    name: "",
    email: "",
    fiscalRegime: "",
    cfdiUse: "",
    taxZipCode: "",
  },
};

export const MainFacturation: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const appColor = context.store?.Color || ThemeLight.btnBackground;

  const [invoiceForm, setInvoiceForm] = useState<InvoicePayload>(initialForm);
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [pdfInvoiceId, setPdfInvoiceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [invoiceDetail, setInvoiceDetail] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"error" | "success" | "">("");

  const isFormValid = useMemo(() => {
    const receiver = invoiceForm.receiver;
    return (
      invoiceForm.orderId > 0 &&
      invoiceForm.emitterRfc.trim().length > 0 &&
      invoiceForm.expeditionPlace.trim().length > 0 &&
      invoiceForm.paymentForm.trim().length > 0 &&
      invoiceForm.paymentMethod.trim().length > 0 &&
      receiver.rfc.trim().length > 0 &&
      receiver.name.trim().length > 0 &&
      receiver.email.trim().length > 0 &&
      receiver.fiscalRegime.trim().length > 0 &&
      receiver.cfdiUse.trim().length > 0 &&
      receiver.taxZipCode.trim().length > 0
    );
  }, [invoiceForm]);

  const updateReceiverField = (field: keyof InvoicePayload["receiver"], value: string) => {
    setInvoiceForm((prev) => ({
      ...prev,
      receiver: {
        ...prev.receiver,
        [field]: value,
      },
    }));
  };

  const showError = (message: string) => {
    setStatusType("error");
    setStatusMessage(message);
  };

  const showSuccess = (message: string) => {
    setStatusType("success");
    setStatusMessage(message);
  };

  const handleCreateInvoice = async () => {
    if (!context.user?.Token) {
      showError("Tu sesión expiró. Inicia sesión de nuevo para facturar.");
      return;
    }

    if (!isFormValid) {
      showError("Completa todos los campos requeridos para crear la factura.");
      return;
    }

    setIsSubmitting(true);
    setCreatedInvoice(null);
    setStatusMessage("");

    try {
      const data = await createInvoice(invoiceForm, context.user.Token);
      setCreatedInvoice(data);
      const idFromResponse = String(data?.id || data?.Id || data?.invoiceId || "");
      if (idFromResponse) {
        setInvoiceIdSearch(idFromResponse);
        setPdfInvoiceId(idFromResponse);
      }
      showSuccess("Factura creada correctamente.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No fue posible crear la factura.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindInvoice = async () => {
    if (!context.user?.Token) {
      showError("Tu sesión expiró. Inicia sesión de nuevo para consultar facturas.");
      return;
    }

    if (!invoiceIdSearch.trim()) {
      showError("Indica el ID de la factura que deseas consultar.");
      return;
    }

    setIsSearching(true);
    setInvoiceDetail(null);
    setStatusMessage("");

    try {
      const data = await getInvoiceById(invoiceIdSearch.trim(), context.user.Token);
      setInvoiceDetail(data);
      showSuccess("Factura consultada correctamente.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No fue posible obtener la factura.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!context.user?.Token) {
      showError("Tu sesión expiró. Inicia sesión de nuevo para descargar el PDF.");
      return;
    }

    if (!pdfInvoiceId.trim()) {
      showError("Indica el ID de la factura para descargar su PDF.");
      return;
    }

    setIsDownloading(true);
    setStatusMessage("");

    try {
      const blob = await getInvoicePdf(pdfInvoiceId.trim(), context.user.Token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura-${pdfInvoiceId.trim()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess("PDF descargado correctamente.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No fue posible descargar el PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      <Header screenName="Facturación" navigation={navigation} />

      <div className="px-4 py-4 space-y-4">
        {statusMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              statusType === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear factura</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="number"
              min={0}
              value={invoiceForm.orderId || ""}
              onChange={(e) =>
                setInvoiceForm((prev) => ({ ...prev, orderId: Number(e.target.value) || 0 }))
              }
              placeholder="ID de orden"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.emitterRfc}
              onChange={(e) => setInvoiceForm((prev) => ({ ...prev, emitterRfc: e.target.value }))}
              placeholder="RFC emisor"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.expeditionPlace}
              onChange={(e) =>
                setInvoiceForm((prev) => ({ ...prev, expeditionPlace: e.target.value }))
              }
              placeholder="Lugar de expedición"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.paymentForm}
              onChange={(e) => setInvoiceForm((prev) => ({ ...prev, paymentForm: e.target.value }))}
              placeholder="Forma de pago"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={invoiceForm.paymentMethod}
              onChange={(e) =>
                setInvoiceForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="PUE">PUE</option>
              <option value="PPD">PPD</option>
            </select>
          </div>

          <h3 className="text-base font-semibold text-gray-700 mt-5 mb-3">Datos del receptor</h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={invoiceForm.receiver.rfc}
              onChange={(e) => updateReceiverField("rfc", e.target.value)}
              placeholder="RFC"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.receiver.name}
              onChange={(e) => updateReceiverField("name", e.target.value)}
              placeholder="Razón social"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={invoiceForm.receiver.email}
              onChange={(e) => updateReceiverField("email", e.target.value)}
              placeholder="Correo"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.receiver.fiscalRegime}
              onChange={(e) => updateReceiverField("fiscalRegime", e.target.value)}
              placeholder="Régimen fiscal"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.receiver.cfdiUse}
              onChange={(e) => updateReceiverField("cfdiUse", e.target.value)}
              placeholder="Uso CFDI"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={invoiceForm.receiver.taxZipCode}
              onChange={(e) => updateReceiverField("taxZipCode", e.target.value)}
              placeholder="Código postal fiscal"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleCreateInvoice}
            disabled={isSubmitting}
            className="w-full text-white py-3 mt-5 rounded-lg font-semibold disabled:opacity-60"
            style={{ backgroundColor: appColor }}
          >
            {isSubmitting ? "Creando factura..." : "Crear factura"}
          </button>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Consultar factura</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={invoiceIdSearch}
              onChange={(e) => setInvoiceIdSearch(e.target.value)}
              placeholder="ID de factura"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleFindInvoice}
              disabled={isSearching}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: appColor }}
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {invoiceDetail && (
            <pre className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(invoiceDetail, null, 2)}
            </pre>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Descargar PDF</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={pdfInvoiceId}
              onChange={(e) => setPdfInvoiceId(e.target.value)}
              placeholder="ID de factura"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: appColor }}
            >
              {isDownloading ? "Descargando..." : "Descargar"}
            </button>
          </div>
        </section>

        {createdInvoice && (
          <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Última factura creada</h2>
            <pre className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(createdInvoice, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
};
