import React from "react";

type CatalogSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const CatalogSearchInput: React.FC<CatalogSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Busca un producto",
  containerClassName,
  inputClassName,
  leftSlot,
  rightSlot,
}) => {
  const leftPadding = leftSlot ? "pl-11" : "pl-4";
  const rightPadding = rightSlot ? "pr-11" : "pr-4";

  return (
    <div className={`w-full ${containerClassName ?? ""}`.trim()}>
      <div className="relative w-full">
        {leftSlot && (
          <div className="absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]">
            {leftSlot}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full ${leftPadding} ${rightPadding} py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--border-default)] ${inputClassName ?? ""}`.trim()}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};
