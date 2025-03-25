import React, { useContext } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack" // Ajusta estas rutas según tu estructura
import { ThemeLight } from "../../Theme/Theme";
import BackSpace  from "../../../../../assets/POS/BackSpace";
import { AppContext } from "../../../Context/AppContext";

interface ModalKeyboardProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  currentStock: string;
  setStock: (stock: string) => void;
}

export const ModalKeyboard: React.FC<ModalKeyboardProps> = ({
  visible,
  setVisible,
  currentStock,
  setStock,
}) => {
  const context = useContext(AppContext);

  const handlePress = (value: string) => {
    if (value === "BackSpace") {
      setStock((prev) => prev.slice(0, -1));
    } else {
      setStock((prev) => prev + value);
    }
  };

  const handleSave = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center modal-overlay-modal-keyboard">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4 flex flex-col justify-between modal-content-modal-keyboard">
        {/* Header */}
        <div className="flex items-center mb-4 header-modal-keyboard">
          <button
            onClick={() => setVisible(false)}
            className="mr-2 back-button-modal-keyboard"
          >
            <ChevronBack />
          </button>
          <h2 className="text-xl font-bold title-modal-keyboard">
            Agregar Stock
          </h2>
        </div>

        {/* Stock Display */}
        <div className="flex justify-center my-4 stock-display-container-modal-keyboard">
          <span className="text-5xl font-bold text-gray-800 stock-display-modal-keyboard">
            {currentStock || "0"}
          </span>
        </div>

        {/* Numeric Keyboard */}
        <div className="grid grid-cols-3 gap-4 my-4 keyboard-container-modal-keyboard">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
            (item, index) => (
              <button
                key={index}
                onClick={() => handlePress(item)}
                className="w-full h-20 bg-purple-800 text-white rounded-full flex items-center justify-center text-3xl font-semibold key-modal-keyboard"
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => handlePress("BackSpace")}
            className="w-full h-20 flex items-center justify-center back-space-key-modal-keyboard"
          >
            <BackSpace />
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 bg-${
            context.store.Color || ThemeLight.btnBackground
          } text-white text-lg font-bold rounded-lg save-button-modal-keyboard`}
        >
          Guardar cantidad
        </button>
      </div>
    </div>
  );
};
