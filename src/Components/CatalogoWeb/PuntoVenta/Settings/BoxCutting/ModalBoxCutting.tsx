import React, { useEffect } from 'react';

interface ModalBoxCuttingProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
  cashAmount: string;
}

export const ModalBoxCutting: React.FC<ModalBoxCuttingProps> = ({
  isVisible,
  onClose,
  onAccept,
  cashAmount,
}) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Corte de Caja</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-700 mb-4">
            ¿Quieres realizar el corte de caja actual? Toma en cuenta que se
            reiniciará el dinero en caja.
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Tu caja debe de contener: ${cashAmount}
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="w-5/12 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="w-5/12 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
