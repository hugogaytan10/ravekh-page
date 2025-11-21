import React from "react";
import { VariantModalState, VariantOption } from "./variantTypes";

interface VariantModalProps {
  modalState: VariantModalState;
  isLoading: boolean;
}

export const VariantModal: React.FC<VariantModalProps> = ({
  modalState,
  isLoading,
}) => {
  if (!modalState.visible || !modalState.product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Selecciona variantes</h2>
          <button onClick={modalState.closeModal} className="text-xl">✕</button>
        </header>

        <div className="px-5 py-3">
          <p className="text-base font-semibold text-gray-800">{modalState.product.Name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {modalState.variants.map((variant: VariantOption) => {
            const selected = modalState.selectedVariantIds.has(variant.__internalId);
            const qty = modalState.selectedVariantQuantities.get(variant.__internalId) ?? 1;

            const price =
              variant.PromotionPrice && variant.PromotionPrice > 0
                ? variant.PromotionPrice
                : variant.Price ?? modalState.product.Price ?? 0;

            return (
              <div
                key={variant.__internalId}
                className={`border rounded-lg p-4 mb-3 transition ${
                  selected ? "border-purple-600 bg-purple-50" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => modalState.toggleVariantSelection(variant.__internalId)}
                  className="w-full flex justify-between items-center"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {variant.Description}
                    </p>
                    {variant.Stock != null && (
                      <p className="text-sm text-gray-600">Stock: {variant.Stock}</p>
                    )}
                    {variant.Barcode && (
                      <p className="text-sm text-gray-600">Código: {variant.Barcode}</p>
                    )}
                    <p className="text-sm text-gray-900 mt-1">
                      ${price.toFixed(2)}
                    </p>
                  </div>

                  <div
                    className={`h-7 w-7 flex items-center justify-center rounded-lg border-2 ${
                      selected
                        ? "border-purple-600 bg-purple-200"
                        : "border-gray-300"
                    }`}
                  >
                    {selected ? "✓" : ""}
                  </div>
                </button>

                {selected && (
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => modalState.adjustVariantQuantity(variant.__internalId, -1)}
                      className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg disabled:bg-gray-300"
                      disabled={qty <= 1}
                    >
                      −
                    </button>

                      <span className="text-lg font-bold">{qty}</span>

                    <button
                      onClick={() => modalState.adjustVariantQuantity(variant.__internalId, +1)}
                      className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="border-t border-gray-200 p-5">
          <button
            onClick={modalState.confirmSelection}
            disabled={modalState.selectedVariantIds.size === 0 || isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-full disabled:opacity-40"
          >
            {isLoading ? "Cargando variantes..." : "Agregar al carrito"}
          </button>
        </footer>
      </div>
    </div>
  );
};
