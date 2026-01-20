import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { ThemeLight } from "../../Theme/Theme";
//import { AppContext } from "../../Context/AppContext";
//import { URL } from "../Const/Const";
//import { ThemeLight } from "../Theme/Theme";

const defaultOptions = {
  ContactInformation: true,
  ShippingMetod: true,
  Street: true,
  ZipCode: true,
  City: true,
  State: true,
  References: true,
  PaymentMetod: true,
};

type Options = typeof defaultOptions;
type OptionKey = keyof Options;

const optionLabels: Record<OptionKey, string> = {
  ContactInformation: "Información de contacto",
  ShippingMetod: "Método de envío",
  Street: "Calle",
  ZipCode: "Código postal",
  City: "Ciudad",
  State: "Estado",
  References: "Referencias",
  PaymentMetod: "Método de pago",
};

const ChevronBackIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 18l-6-6 6-6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner = () => (
  <span
    className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white"
    aria-label="Cargando"
  />
);

export const CatalogSettings: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<Options>(defaultOptions);

  const appColor = useMemo(
    () => context.store?.Color || ThemeLight.btnBackground,
    [context.store?.Color]
  );

  const toggleOption = (key: OptionKey) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!context?.user?.Business_Id || !context?.user?.Token) {
      console.error("Faltan datos del usuario (Business_Id/Token).");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...options,
        Business_Id: context.user.Business_Id,
        ContactInformation: options.ContactInformation ? 1 : 0,
        ShippingMetod: options.ShippingMetod ? 1 : 0,
        Street: options.Street ? 1 : 0,
        ZipCode: options.ZipCode ? 1 : 0,
        City: options.City ? 1 : 0,
        State: options.State ? 1 : 0,
        References: options.References ? 1 : 0,
        PaymentMetod: options.PaymentMetod ? 1 : 0,
      };

      await fetch(`${URL}shipping_options`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: context.user.Token,
        },
        body: JSON.stringify(payload),
      });

      navigate(-1); // equivalente a goBack()
    } catch (error) {
      console.error("Error al guardar los ajustes de catálogo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-b-2xl"
        style={{ backgroundColor: context.store?.Color || appColor }}
        onClick={() => navigate("/settings-p")} // ajusta a tu ruta (SettingsP)
      >
        <ChevronBackIcon />
        <span className="text-white text-xl font-bold">Ajustes de catálogo</span>
      </button>

      {/* Content */}
      <div className="px-5 pt-5 pb-[140px]">
        {(Object.keys(optionLabels) as OptionKey[]).map((key) => {
          const enabled = options[key];

          return (
            <div
              key={key}
              className="mb-3 flex items-center justify-between rounded-xl border border-[#E0E0E0] bg-white px-4 py-4"
            >
              <span className="text-[16px] font-semibold" style={{ color: ThemeLight.textColor }}>
                {optionLabels[key]}
              </span>

              {/* Switch */}
              <button
                type="button"
                onClick={() => toggleOption(key)}
                aria-pressed={enabled}
                className={[
                  "relative h-[26px] w-[44px] rounded-full transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                ].join(" ")}
                style={{
                  backgroundColor: enabled ? appColor : "#767577",
                }}
              >
                <span
                  className="absolute left-[3px] top-[3px] h-[20px] w-[20px] rounded-full shadow transition-transform duration-150"
                  style={{
                    backgroundColor: enabled ? "#FFFFFF" : "#f4f3f4",
                    transform: enabled ? "translateX(18px)" : "translateX(0px)",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-[104px] border-t border-black/5 bg-white flex items-center justify-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={[
            "w-[70%] rounded-xl px-4 py-4 text-[18px] font-semibold text-white",
            "flex items-center justify-center",
            "disabled:opacity-70 disabled:cursor-not-allowed",
          ].join(" ")}
          style={{ backgroundColor: appColor }}
        >
          {isSaving ? <Spinner /> : "Guardar"}
        </button>
      </div>
    </div>
  );
};
