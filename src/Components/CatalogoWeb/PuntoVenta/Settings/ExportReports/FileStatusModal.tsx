import React, { useEffect } from "react";

interface FileModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const FileStatusModal: React.FC<FileModalProps> = ({
  isVisible,
  onClose,
  title,
  message,
}) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"; // Evitar scroll al mostrar el modal
    } else {
      document.body.style.overflow = "auto"; // Restaurar scroll
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar modal al hacer clic dentro
      >
        {/* Header */}
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
        </div>

        {/* Content */}
        <div className="text-center">
          <p className="text-base text-gray-600">{message || "No hay información disponible."}</p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary-dark"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileStatusModal;
