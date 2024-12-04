import React from "react";
import "./PickerColor.css";
interface PickerColorProps {
  colorSelected: string;
  setColorSelected: (color: string) => void;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

export const PickerColor: React.FC<PickerColorProps> = ({
  colorSelected,
  setColorSelected,
  isVisible,
  setIsVisible,
}) => {
  // Lista de colores disponibles
  const colors = [
    { color: "#FFE70F", name: "Amarillo" },
    { color: "#F94F4F", name: "Naranja" },
    { color: "#FF0000", name: "Rojo" },
    { color: "#FF00F5", name: "Rosa" },
    { color: "#1F5EFF", name: "Azul" },
    { color: "#6D01D1", name: "Morado" },
    { color: "#737373", name: "Gris" },
    { color: "#000000", name: "Negro" },
    { color: "#1B9419", name: "Verde" },
  ];

  return (
    <div className={`overlay-picker-color ${isVisible ? "visible" : ""}`}>
      <div className="modal-picker-color">
        <div className="header-picker-color">
          <h2>Elige el color</h2>
          <button
            className="close-picker-color"
            onClick={() => setIsVisible(false)}
          >
            &times;
          </button>
        </div>
        <div className="colors-picker-color">
          {colors.map((color) => (
            <button
              key={color.name}
              style={{ backgroundColor: color.color }}
              className="color-item-picker-color"
              onClick={() => {
                setColorSelected(color.color);
                setIsVisible(false);
              }}
            >
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

