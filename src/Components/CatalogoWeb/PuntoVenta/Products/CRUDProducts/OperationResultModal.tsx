import React from "react";

interface OperationResultModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  error?: string;
  isSuccess: boolean;
  onClose: () => void;
}

export const OperationResultModal: React.FC<OperationResultModalProps> = ({
  isVisible,
  title,
  message,
  error,
  isSuccess,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className={`text-2xl ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {isSuccess ? "✅" : "❌"}
          </span>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        <p className="mb-2 text-sm text-gray-700">{message}</p>
        {error ? <p className="mb-4 text-xs text-red-600">Detalle: {error}</p> : null}

        <div className="flex justify-end">
          <button
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
