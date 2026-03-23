import React, { useEffect, useMemo, useState } from "react";
import { ProductExtra, ProductExtrasResponse } from "./Modelo/ProductExtra";

type Props = {
  isOpen: boolean;
  productName: string;
  extras: ProductExtrasResponse;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (selection: {
    color: ProductExtra | null;
    size: ProductExtra | null;
  }) => void;
};

export const ProductExtrasModal: React.FC<Props> = ({
  isOpen,
  productName,
  extras,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const colorOptions = useMemo(() => (Array.isArray(extras?.COLOR) ? extras.COLOR : []), [extras]);
  const sizeOptions = useMemo(() => (Array.isArray(extras?.TALLA) ? extras.TALLA : []), [extras]);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedColorId(null);
    setSelectedSizeId(null);
  }, [isOpen, extras]);

  const mustSelectColor = colorOptions.length > 0;
  const mustSelectSize = sizeOptions.length > 0;
  const canConfirm =
    (!mustSelectColor || selectedColorId != null) && (!mustSelectSize || selectedSizeId != null);

  if (!isOpen) return null;

  const selectedColor =
    selectedColorId != null ? colorOptions.find((option) => option.Id === selectedColorId) ?? null : null;
  const selectedSize =
    selectedSizeId != null ? sizeOptions.find((option) => option.Id === selectedSizeId) ?? null : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 md:items-center md:p-6">
      <div className="w-full max-w-lg rounded-t-3xl bg-[var(--bg-surface)] p-6 shadow-xl md:rounded-2xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Selecciona talla y color
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {productName}
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-[var(--text-secondary)]">Cargando opciones...</p>
        ) : (
          <>
            {sizeOptions.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Talla</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const active = selectedSizeId === size.Id;
                    return (
                      <button
                        key={`size-${size.Id}`}
                        type="button"
                        onClick={() => setSelectedSizeId(size.Id)}
                        className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-violet-500 bg-violet-600 text-white"
                            : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-violet-400"
                        }`}
                      >
                        {size.Description}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colorOptions.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const active = selectedColorId === color.Id;
                    return (
                      <button
                        key={`color-${color.Id}`}
                        type="button"
                        onClick={() => setSelectedColorId(color.Id)}
                        className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-violet-500 bg-violet-600 text-white"
                            : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-violet-400"
                        }`}
                      >
                        {color.Description}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm || loading}
            onClick={() => onConfirm({ color: selectedColor, size: selectedSize })}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};
