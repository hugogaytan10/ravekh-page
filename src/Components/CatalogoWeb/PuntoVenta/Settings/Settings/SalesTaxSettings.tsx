import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../Context/AppContext";
import { ThemeLight } from "../../Theme/Theme";
import { Header } from "../../Utilities/Header";
import Check from "../../../../../assets/POS/Check"; // Ruta según tus especificaciones
import { URL } from "../../Const/Const";
import { updateBusinessWithTaxId } from "./Petitions";
import { Tax } from "../../Model/Tax";

export const SalesTaxSettings: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const context = useContext(AppContext);
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [isFixedRate, setIsFixedRate] = useState(false);
  const [isRemovable, setIsRemovable] = useState(false);
  const [description, setDescription] = useState("");
  const [taxValue, setTaxValue] = useState("");
  const [taxesId, setTaxesId] = useState<number | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const appColor = context.store?.Color || ThemeLight.btnBackground;

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URL}business/${context.user.Business_Id}`, {
        headers: {
          token: context.user.Token,
        },
      });
      const data = await response.json();
      setBusinessData(data);
      setTaxesId(data.Taxes_Id);
      if (data.Taxes_Id !== null) {
        await fetchTaxData(data.Taxes_Id);
      }
    } catch (error) {
      console.error("Error al cargar los datos del negocio:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxData = async (taxId: number) => {
    try {
      const response = await fetch(`${URL}taxes/${taxId}`, {
        headers: {
          token: context.user.Token,
        },
      });
      const taxData = await response.json();
      setIsTaxEnabled(true);
      setIsFixedRate(taxData.IsPercent === 1);
      setDescription(taxData.Description);
      setTaxValue(taxData.Value.toString());
      setIsRemovable(taxData.QuitInSale === 1);
    } catch (error) {
      console.error("Error al cargar los datos del impuesto:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setUpdated(false);
    const taxData = {
      IsPercent: isFixedRate,
      Description: description,
      Value: parseFloat(taxValue),
      QuitInSale: isRemovable,
    };

    try {
      let taxesIdToUpdate = taxesId;

      if (taxesId === null) {
        const response = await fetch(`${URL}taxes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: context.user.Token,
          },
          body: JSON.stringify(taxData),
        });

        const responseData = await response.json();
        taxesIdToUpdate = responseData;
        setTaxesId(taxesIdToUpdate);

        await updateBusinessWithTaxId(
          taxesIdToUpdate || 0,
          context.user.Business_Id,
          context.user.Token
        );

        context.setTax(taxData);
      } else {
        await fetch(`${URL}taxes/${taxesId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: context.user.Token,
          },
          body: JSON.stringify(taxData),
        });

        context.setTax(taxData);
      }

      setUpdated(true);
    } catch (error) {
      console.error("Error al guardar los datos del impuesto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTaxEnabled) {
      try {
        fetch(`${URL}taxes/${businessData?.Taxes_Id}`, {
          method: "DELETE",
          headers: {
            token: context.user.Token,
          },
        });
        context.setTax({} as Tax);
      } catch (e) {
        console.error("Error al eliminar los impuestos:", e);
      }
    }
  }, [isTaxEnabled]);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header screenName="Impuestos" navigation={navigation} />

      <div className="p-6">
        {/* Toggle Impuestos */}
        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-semibold text-gray-700">
            Usar impuesto de venta
          </label>
          <input
            type="checkbox"
            checked={isTaxEnabled}
            onChange={() => setIsTaxEnabled(!isTaxEnabled)}
            className="toggle-switch"
            style={{ accentColor: appColor }}
          />
        </div>

        {/* Opciones de impuestos */}
        {isTaxEnabled && (
          <>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-700">
                Porcentaje
              </label>
              <button
                className={`checkbox ${isFixedRate ? "checked" : ""}`}
                onClick={() => setIsFixedRate(!isFixedRate)}
                style={{
                  borderColor: appColor,
                  backgroundColor: isFixedRate ? appColor : "transparent",
                }}
              >
                {isFixedRate && <Check width={16} height={16} />}
              </button>
            </div>

            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Impuesto de venta"
                value={taxValue}
                onChange={(e) => setTaxValue(e.target.value)}
                className="input"
              />
            </div>
          </>
        )}

        {/* Botón Guardar */}
        <button
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold ${
            isTaxEnabled ? "bg-primary" : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleSave}
          disabled={!isTaxEnabled || loading}
        >
          {loading ? "Guardando..." : updated ? "¡Actualizado!" : "Guardar"}
        </button>
      </div>
    </div>
  );
};
