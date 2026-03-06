import React, { useEffect, useState } from "react";
import { Trash } from "../../../../../assets/POS/Trash";

interface DeleteCategoryModalProps {
  isVisible: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isVisible,
  isDeleting = false,
  onClose,
  onDelete,
}) => {
  const [isMounted, setIsMounted] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsAnimating(true));
      return;
    }
    setIsAnimating(false);
    const timeout = setTimeout(() => setIsMounted(false), 250);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full rounded-t-2xl bg-white p-6 shadow-lg transform transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <Trash width={50} height={50} />
          <h2 className="text-lg font-semibold mb-2">
            ¿Estás seguro que deseas eliminar esta categoría?
          </h2>
          <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>

            <div className="flex flex-col w-full gap-4">
            <button
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-70"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
                Eliminando
              </span>
              ) : (
              "Eliminar"
              )}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};
