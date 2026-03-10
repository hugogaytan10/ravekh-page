import React from "react";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  accentColor?: string;
};

export const FeedbackModal: React.FC<Props> = ({
  visible,
  title,
  message,
  onClose,
  accentColor = "#111827",
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative z-[10000] w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-[#565656]">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
