import React, { useEffect, useState } from "react";
import { VariantDraft, VariantDraftEditableField, createEmptyVariantDraft } from "./variantTypes";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
//import ChevronGo from "../../../assets/SVG/ChevronGo";
//import ScanIcon from "../../../assets/SVG/ScanCircleIcon";
//import { ScannProduct } from "../../LectorQR/ScannProduct";

type Props = {
  variants: VariantDraft[];
  onChange: (nextVariants: VariantDraft[]) => void;
  accentColor: string;
  showSectionHeader?: boolean;
  containerClassName?: string;
};

/** Helper */
const ensureArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const VariantsEditor: React.FC<Props> = ({
  variants,
  onChange,
  accentColor,
  showSectionHeader = true,
  containerClassName = "",
}) => {
  const [sectionExpanded, setSectionExpanded] = useState(
    showSectionHeader ? false : true
  );
  const [expandedVariants, setExpandedVariants] = useState<
    Record<string, boolean>
  >({});
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<string | null>(null);

  useEffect(() => {
    setExpandedVariants((prev) => {
      const next: Record<string, boolean> = {};
      variants.forEach((variant) => {
        next[variant.key] = prev[variant.key] ?? true;
      });
      return next;
    });
  }, [variants]);

  useEffect(() => {
    if (!showSectionHeader) {
      setSectionExpanded(true);
      return;
    }

    if (variants.length > 0 && showSectionHeader) {
      setSectionExpanded(true);
    }
  }, [variants.length, showSectionHeader]);

  const handleAddVariant = () => {
    const nextVariant = createEmptyVariantDraft(accentColor);
    onChange([...variants, nextVariant]);
    setSectionExpanded(true);
    setExpandedVariants((prev) => ({ ...prev, [nextVariant.key]: true }));
  };

  const handleRemoveVariant = (index: number) => {
    const removedVariant = variants[index];
    onChange(variants.filter((_, variantIndex) => variantIndex !== index));
    if (removedVariant) {
      setExpandedVariants((prev) => {
        const next = { ...prev };
        delete next[removedVariant.key];
        return next;
      });
    }
  };

  const handleFieldChange = (
    index: number,
    field: VariantDraftEditableField,
    value: string
  ) => {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const toggleSectionExpanded = () => {
    if (!showSectionHeader) return;
    setSectionExpanded((prev) => !prev);
  };

  const toggleVariantExpansion = (key: string) => {
    setExpandedVariants((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  };

  const handleScanPress = (variantKey: string) => {
    setScannerTarget(variantKey);
    setScannerVisible(true);
  };

  const handleScannerVisibility = (isVisible: boolean) => {
    setScannerVisible(isVisible);
    if (!isVisible) {
      setScannerTarget(null);
    }
  };

  const handleBarcodeScanned = (code: string) => {
    if (!scannerTarget) return;

    const nextVariants = variants.map((variant) =>
      variant.key === scannerTarget ? { ...variant, barcode: code } : variant
    );

    onChange(nextVariants);
    setScannerTarget(null);
  };

  const hasVariants = variants.length > 0;

  return (
    <div
      className={`${
        showSectionHeader ? "mt-5" : "mt-0"
      } p-4 bg-white rounded-2xl shadow-sm border border-slate-100 ${containerClassName}`}
    >
      {showSectionHeader ? (
        <button
          type="button"
          className="w-full flex items-center justify-between"
          onClick={toggleSectionExpanded}
        >
          <span className="text-lg font-semibold text-slate-800">
            Variantes
          </span>
          <span
            className={`transition-transform ${
              sectionExpanded ? "-rotate-90" : "rotate-90"
            }`}
          >
            <ChevronGo height={20} width={20} />
          </span>
        </button>
      ) : (
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Variantes
        </h3>
      )}

      {sectionExpanded && (
        <>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 mb-3">
            Agrega variaciones como colores, tallas o presentaciones.
          </p>

          {hasVariants ? (
            variants.map((variant, index) => {
              const isVariantExpanded = expandedVariants[variant.key] ?? true;
              const variantLabel = variant.description.trim()
                ? variant.description
                : `Variante ${index + 1}`;

              return (
                <div
                  key={variant.key}
                  className="mb-4 p-3 rounded-xl bg-violet-50 border border-violet-100"
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <button
                      type="button"
                      className="flex items-center flex-1 text-left"
                      onClick={() => toggleVariantExpansion(variant.key)}
                    >
                      <span
                        className={`transition-transform ${
                          isVariantExpanded ? "-rotate-90" : "rotate-90"
                        }`}
                      >
                        <ChevronGo height={18} width={18} />
                      </span>
                      <div className="ml-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {variantLabel}
                        </p>
                        {variant.barcode && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Código: {variant.barcode}
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="px-3 py-1 rounded-full border text-xs font-semibold"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      Eliminar
                    </button>
                  </div>

                  {isVariantExpanded && (
                    <div className="mt-3 space-y-2">
                      {/* Descripción */}
                      <input
                        placeholder="Descripción"
                        value={variant.description}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Código de barras */}
                      <input
                        placeholder="Código de barras"
                        value={variant.barcode}
                        onChange={(e) =>
                          handleFieldChange(index, "barcode", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/*<button
                        type="button"
                        onClick={() => handleScanPress(variant.key)}
                        className="inline-flex items-center px-3 py-2 rounded-xl border bg-white text-sm"
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        <ScanIcon />
                        <span className="ml-2 font-medium">
                          Escanear código
                        </span>
                      </button>*/}

                      {/* Precio */}
                      <input
                        placeholder="Precio"
                        value={variant.price}
                        onChange={(e) =>
                          handleFieldChange(index, "price", e.target.value)
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Promoción */}
                      <input
                        placeholder="Promoción"
                        value={variant.promotionPrice}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "promotionPrice",
                            e.target.value
                          )
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Costo */}
                      <input
                        placeholder="Costo"
                        value={variant.costPerItem}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "costPerItem",
                            e.target.value
                          )
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Stock */}
                      <input
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) =>
                          handleFieldChange(index, "stock", e.target.value)
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Stock mínimo */}
                      <input
                        placeholder="Stock mínimo"
                        value={variant.minStock}
                        onChange={(e) =>
                          handleFieldChange(index, "minStock", e.target.value)
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Stock óptimo */}
                      <input
                        placeholder="Stock óptimo"
                        value={variant.optStock}
                        onChange={(e) =>
                          handleFieldChange(index, "optStock", e.target.value)
                        }
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {/* Fecha de caducidad */}
                      <input
                        placeholder="Fecha de caducidad"
                        value={variant.expDate}
                        onChange={(e) =>
                          handleFieldChange(index, "expDate", e.target.value)
                        }
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              Aún no has agregado variantes.
            </p>
          )}

          <button
            type="button"
            onClick={handleAddVariant}
            className="w-full mt-2 py-3 rounded-2xl text-white text-sm sm:text-base font-semibold"
            style={{ backgroundColor: accentColor }}
          >
            Agregar variante
          </button>
        </>
      )}

      {/* Scanner (tú implementas la versión web de este componente) */}
      '{/*<ScannProduct
        isShow={scannerVisible}
        setIsShow={handleScannerVisibility}
        setBarCode={handleBarcodeScanned}
      />*/}
    </div>
  );
};

export default VariantsEditor;
