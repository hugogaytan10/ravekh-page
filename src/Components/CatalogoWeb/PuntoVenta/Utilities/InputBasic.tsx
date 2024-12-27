import React from "react";

interface InputBasicProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  keyboardType?: React.HTMLInputTypeAttribute; // Equivalente en HTML para KeyboardTypeOptions
}
export const InputBasic: React.FC<InputBasicProps> = ({
  value,
  onChange,
  placeholder,
  keyboardType = "text",
}) => {
  return (
    <input
      type={keyboardType}
      placeholder={placeholder}
      value={value} // Ya se asegura de que sea una cadena válida
      onChange={(e) => onChange(e)} // Propagamos directamente el evento
      className="w-11/12 bg-gray-100 p-4 rounded-lg mb-4 text-base text-gray-800 input-basic"
    />
  );
};
