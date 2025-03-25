import React from "react";
import "./Keyboard.css";

interface KeyBoardProps {
  handlePress: (value: string) => void;
}

export const KeyBoard: React.FC<KeyBoardProps> = React.memo(({ handlePress }) => {
  return (
    <div className="keyboard-container">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((item, index) => (
        <button
          key={index}
          className="key"
          onClick={() => handlePress(item)}
        >
          {item}
        </button>
      ))}
      <button
        className="key backspace-key"
        onClick={() => handlePress("BackSpace")}
      >
        ⌫
      </button>
    </div>
  );
});
