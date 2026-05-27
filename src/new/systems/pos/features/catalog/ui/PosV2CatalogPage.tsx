import { FormEvent, useEffect, useMemo, useState } from "react";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2CatalogPage.css";

const API_BASE_URL = getPosApiBaseUrl();

type ShippingOptionsConfig = {
  ContactInformation: boolean;
  ShippingMetod: boolean;
  Street: boolean;
  ZipCode: boolean;
  City: boolean;
  State: boolean;
  References: boolean;
  PaymentMetod: boolean;
};

const DEFAULT_SHIPPING_OPTIONS: ShippingOptionsConfig = {
  ContactInformation: true,
  ShippingMetod: true,
  Street: true,
  ZipCode: true,
  City: true,
  State: true,
  References: true,
  PaymentMetod: true,
};

const SHIPPING_OPTION_FIELDS: Array<{ key: keyof ShippingOptionsConfig; label: string; helper: string }> = [
  { key: "ContactInformation", label: "Información de contacto", helper: "Nombre y teléfono del cliente" },
  { key: "ShippingMetod", label: "Método de envío", helper: "Entrega a domicilio o recoger en tienda" },
  { key: "Street", label: "Calle", helper: "Nombre de la calle" },
  { key: "ZipCode", label: "Código postal", helper: "CP de entrega" },
  { key: "City", label: "Municipio / ciudad", helper: "Ciudad o municipio" },
  { key: "State", label: "Estado", helper: "Estado o provincia" },
  { key: "References", label: "Referencias", helper: "Indicaciones extra para ubicar el domicilio" },
  { key: "PaymentMetod", label: "Método de pago", helper: "Cómo pagará el cliente" },
];

export const PosV2CatalogPage = () => {
  const session = useMemo(() => {
    const snapshot = readPosSessionSnapshot();
    return {
      ...snapshot,
      hasSession: snapshot.token.length > 0 && Number.isFinite(snapshot.businessId) && snapshot.businessId > 0,
    };
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionsConfig>(DEFAULT_SHIPPING_OPTIONS);

  const loadShippingOptions = async () => {
    if (!session.hasSession) {
      setShippingOptions(DEFAULT_SHIPPING_OPTIONS);
      return;
    }

    setShippingLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/shippingoptions/business/${session.businessId}`, {
        headers: {
          "Content-Type": "application/json",
          token: session.token,
          Authorization: `Bearer ${session.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("No fue posible cargar la configuración del checkout público.");
      }

      const payload = await response.json();
      const row = Array.isArray(payload) ? payload[0] : payload;
      if (!row || typeof row !== "object") {
        setShippingOptions(DEFAULT_SHIPPING_OPTIONS);
        return;
      }

      setShippingOptions({
        ContactInformation: Number(row.ContactInformation) === 1,
        ShippingMetod: Number(row.ShippingMetod) === 1,
        Street: Number(row.Street) === 1,
        ZipCode: Number(row.ZipCode) === 1,
        City: Number(row.City) === 1,
        State: Number(row.State) === 1,
        References: Number(row.References) === 1,
        PaymentMetod: Number(row.PaymentMetod) === 1,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar la configuración del checkout público.");
      setShippingOptions(DEFAULT_SHIPPING_OPTIONS);
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    void loadShippingOptions();
  }, [session.businessId, session.hasSession, session.token]);

  const toggleShippingOption = (key: keyof ShippingOptionsConfig) => {
    setShippingOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSaveShippingOptions = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.hasSession) {
      setError("No hay sesión activa para guardar la configuración del checkout.");
      return;
    }

    setShippingSaving(true);
    setError(null);
    setToast("");
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/shippingoptions/${session.businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: session.token,
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          ContactInformation: shippingOptions.ContactInformation ? 1 : 0,
          ShippingMetod: shippingOptions.ShippingMetod ? 1 : 0,
          Street: shippingOptions.Street ? 1 : 0,
          ZipCode: shippingOptions.ZipCode ? 1 : 0,
          City: shippingOptions.City ? 1 : 0,
          State: shippingOptions.State ? 1 : 0,
          References: shippingOptions.References ? 1 : 0,
          PaymentMetod: shippingOptions.PaymentMetod ? 1 : 0,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible guardar la configuración del checkout público.");
      }

      setToast("Configuración del checkout público actualizada.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar la configuración del checkout público.");
    } finally {
      setShippingSaving(false);
    }
  };

  return (
    <PosV2Shell title="Configuración de catálogo" subtitle="Define qué datos debe llenar el cliente al confirmar un pedido en tu catálogo público.">
      <section className="pos-v2-catalog" aria-label="Configuración de catálogo">
        {!session.hasSession ? <p className="pos-v2-catalog__error">No hay sesión activa para gestionar el checkout público.</p> : null}
        {error ? <p className="pos-v2-catalog__error">{error}</p> : null}
        {toast ? <p className="pos-v2-catalog__toast">{toast}</p> : null}

        <article className="pos-v2-catalog__card">
          <header>
            <h2>Checkout público</h2>
            <p>Activa o desactiva los campos que se mostrarán al cliente en el formulario de pedido.</p>
          </header>
          <form className="pos-v2-catalog__shipping-form" onSubmit={handleSaveShippingOptions}>
            {shippingLoading ? <p>Cargando configuración...</p> : null}
            <div className="pos-v2-catalog__shipping-grid">
              {SHIPPING_OPTION_FIELDS.map((field) => (
                <label key={field.key} className="pos-v2-catalog__switch-card">
                  <input
                    type="checkbox"
                    checked={shippingOptions[field.key]}
                    onChange={() => toggleShippingOption(field.key)}
                  />
                  <span className="pos-v2-catalog__switch-ui" aria-hidden="true" />
                  <span className="pos-v2-catalog__switch-copy">
                    <strong>{field.label}</strong>
                    <small>{field.helper}</small>
                  </span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={shippingSaving || shippingLoading}>
              {shippingSaving ? "Guardando..." : "Guardar configuración"}
            </button>
          </form>
        </article>
      </section>
    </PosV2Shell>
  );
};
