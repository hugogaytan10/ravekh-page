import React, { useMemo, useState } from "react";

export type ProductExtraDraft = {
  Id?: number;
  Description: string;
  Type: "COLOR" | "TALLA";
};

type Props = {
  extras: ProductExtraDraft[];
  onChange: (extras: ProductExtraDraft[]) => void;
};

export const ExtrasSection: React.FC<Props> = ({ extras, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [modalType, setModalType] = useState<"COLOR" | "TALLA" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [descriptionInput, setDescriptionInput] = useState("");

  const sizes = useMemo(() => extras.filter((item) => item.Type === "TALLA"), [extras]);
  const colors = useMemo(() => extras.filter((item) => item.Type === "COLOR"), [extras]);

  const openCreateModal = (type: "COLOR" | "TALLA") => {
    setModalType(type);
    setEditingIndex(null);
    setDescriptionInput("");
  };

  const openEditModal = (index: number) => {
    const current = extras[index];
    if (!current) return;
    setModalType(current.Type);
    setEditingIndex(index);
    setDescriptionInput(current.Description);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingIndex(null);
    setDescriptionInput("");
  };

  const saveExtra = () => {
    const value = descriptionInput.trim();
    if (!modalType || !value) return;

    if (editingIndex != null) {
      const updated = extras.map((item, idx) =>
        idx === editingIndex ? { ...item, Description: value, Type: modalType } : item
      );
      onChange(updated);
    } else {
      onChange([...extras, { Description: value, Type: modalType }]);
    }

    closeModal();
  };

  const deleteByIndex = (indexToDelete: number) => {
    onChange(extras.filter((_, idx) => idx !== indexToDelete));
  };

  const renderColumn = (title: string, type: "COLOR" | "TALLA", items: ProductExtraDraft[]) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-gray-800">{title}</p>
        <button
          type="button"
          onClick={() => openCreateModal(type)}
          className="rounded-full border border-black px-3 py-1 text-sm font-semibold"
        >
          + Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{type === "TALLA" ? "Sin tallas." : "Sin colores."}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const index = extras.findIndex(
              (extra) =>
                extra.Type === item.Type &&
                extra.Description === item.Description &&
                extra.Id === item.Id
            );
            return (
              <div key={`${item.Type}-${item.Id ?? "new"}-${item.Description}-${index}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(index)}
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-left text-gray-700"
                >
                  {item.Description}
                </button>
                <button
                  type="button"
                  onClick={() => deleteByIndex(index)}
                  className="h-10 w-10 rounded-full border border-black text-xl leading-none"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-4 form-section-add-product mt-4">
      <button className="flex justify-between w-full" onClick={() => setIsOpen((prev) => !prev)}>
        <span>Extras</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-4">
          <p className="mb-4 text-sm text-gray-600">
            Agrega extras por talla o color para este producto.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderColumn("Tallas", "TALLA", sizes)}
            {renderColumn("Colores", "COLOR", colors)}
          </div>
        </div>
      )}

      {modalType && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-3xl font-semibold text-gray-700">
              {editingIndex != null
                ? modalType === "TALLA"
                  ? "Editar talla"
                  : "Editar color"
                : modalType === "TALLA"
                ? "Agregar talla"
                : "Agregar color"}
            </h3>
            <input
              value={descriptionInput}
              onChange={(event) => setDescriptionInput(event.target.value)}
              placeholder="Descripción"
              className="mb-6 w-full rounded-2xl border border-gray-300 px-5 py-4 text-xl"
            />
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeModal} className="px-6 py-3 text-2xl text-gray-600">
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveExtra}
                className="rounded-2xl bg-black px-6 py-3 text-2xl font-semibold text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
