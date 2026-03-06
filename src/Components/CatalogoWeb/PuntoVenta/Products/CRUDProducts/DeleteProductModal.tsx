import React from "react";
import { Trash } from "../../../../../assets/POS/Trash";

interface DeleteProductModalProps {
  isVisible: boolean; // Prop para mostrar u ocultar el modal
  onClose: () => void; // Función para cerrar el modal
  onDelete: () => void; // Función para eliminar el producto
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isVisible,
  onClose,
  onDelete,
}) => {
  if (!isVisible) return null; // Si no es visible, no renderizar nada

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // Cerrar el modal si se hace clic fuera del panel
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro del panel
      >
        <div className="flex flex-col items-center text-center">
         <Trash width={50} height={50} />
          <h2 className="text-lg font-semibold mb-2">
            ¿Estás seguro que deseas eliminar este producto?
          </h2>
          <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>

          <div className="flex justify-between w-full">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              onClick={onDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
