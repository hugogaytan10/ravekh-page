import React from "react";

type CatalogSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
};

export const CatalogSearchInput: React.FC<CatalogSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar por nombre o código de barras",
  containerClassName,
  inputClassName,
}) => {
  return (
    <div className={`px-2 ${containerClassName ?? ""}`.trim()}>
      <input
        type="text"
        placeholder={placeholder}
        className={`bg-white w-full max-w-md p-2 border border-gray-300 rounded-md text-sm ${inputClassName ?? ""}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
