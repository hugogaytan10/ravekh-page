export type WholesalePriceTierDraft = {
  key: string;
  id?: number;
  price: string;
  minQuantity: string;
};

export type WholesalePriceTierError = {
  price?: string;
  minQuantity?: string;
};

export type WholesalePriceTierErrors = Record<string, WholesalePriceTierError>;

type WholesalePricesEditorProps = {
  value: WholesalePriceTierDraft[];
  onChange: (value: WholesalePriceTierDraft[]) => void;
  errors?: WholesalePriceTierErrors;
  onClearError?: (tierKey: string, field: keyof WholesalePriceTierError) => void;
  locked?: boolean;
  onLockedInteraction?: () => void;
  compact?: boolean;
  title?: string;
  description?: string;
};

export const createWholesalePriceTierDraft = (
  input: Partial<Omit<WholesalePriceTierDraft, "key">> = {},
): WholesalePriceTierDraft => ({
  key: `${input.id ?? "new"}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: input.id,
  price: input.price ?? "",
  minQuantity: input.minQuantity ?? "",
});

export const WholesalePricesEditor = ({
  value,
  onChange,
  errors = {},
  onClearError,
  locked = false,
  onLockedInteraction,
  compact = false,
  title = "Precios por mayoreo",
  description = "Agrega uno o más niveles según la cantidad de piezas.",
}: WholesalePricesEditorProps) => {
  const notifyLocked = () => {
    if (locked) onLockedInteraction?.();
  };

  const addTier = () => {
    if (locked) {
      notifyLocked();
      return;
    }
    onChange([...value, createWholesalePriceTierDraft()]);
  };

  const removeTier = (key: string) => {
    if (locked) {
      notifyLocked();
      return;
    }
    onChange(value.filter((tier) => tier.key !== key));
  };

  const updateTier = (
    key: string,
    field: "price" | "minQuantity",
    nextValue: string,
  ) => {
    if (locked) {
      notifyLocked();
      return;
    }

    onClearError?.(key, field);
    onChange(
      value.map((tier) =>
        tier.key === key ? { ...tier, [field]: nextValue } : tier,
      ),
    );
  };

  return (
    <section
      className={`pos-v2-products__wholesale-editor${compact ? " is-compact" : ""}`}
    >
      <div className="pos-v2-products__wholesale-editor-head">
        <div>
          <strong>{title}</strong>
          <small>{description}</small>
        </div>
        <button
          type="button"
          className="pos-v2-products__secondary pos-v2-products__wholesale-add"
          onClick={addTier}
        >
          + Agregar nivel
        </button>
      </div>

      {value.length === 0 ? (
        <button
          type="button"
          className="pos-v2-products__wholesale-empty"
          onClick={addTier}
        >
          <span>No hay precios de mayoreo configurados.</span>
          <strong>Agregar primer nivel</strong>
        </button>
      ) : (
        <div className="pos-v2-products__wholesale-list">
          {value.map((tier, index) => {
            const tierErrors = errors[tier.key] ?? {};
            return (
              <div className="pos-v2-products__wholesale-tier" key={tier.key}>
                <div className="pos-v2-products__wholesale-tier-number">
                  {index + 1}
                </div>

                <div className="pos-v2-products__wholesale-tier-fields">
                <label
                  className={
                    tierErrors.minQuantity
                      ? "pos-v2-products__wholesale-field is-invalid"
                      : "pos-v2-products__wholesale-field"
                  }
                >
                  <span>Desde (pzas.)</span>
                  <input
                    type="number"
                    min="2"
                    step="1"
                    inputMode="numeric"
                    value={tier.minQuantity}
                    placeholder="Ej. 6"
                    readOnly={locked}
                    onFocus={notifyLocked}
                    onChange={(event) =>
                      updateTier(tier.key, "minQuantity", event.target.value)
                    }
                    aria-invalid={Boolean(tierErrors.minQuantity)}
                  />
                  {tierErrors.minQuantity ? (
                    <small className="pos-v2-products__wholesale-error" role="alert">
                      {tierErrors.minQuantity}
                    </small>
                  ) : null}
                </label>

                <label
                  className={
                    tierErrors.price
                      ? "pos-v2-products__wholesale-field is-invalid"
                      : "pos-v2-products__wholesale-field"
                  }
                >
                  <span>Precio por pieza</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={tier.price}
                    placeholder="Ej. 140"
                    readOnly={locked}
                    onFocus={notifyLocked}
                    onChange={(event) =>
                      updateTier(tier.key, "price", event.target.value)
                    }
                    aria-invalid={Boolean(tierErrors.price)}
                  />
                  {tierErrors.price ? (
                    <small className="pos-v2-products__wholesale-error" role="alert">
                      {tierErrors.price}
                    </small>
                  ) : null}
                </label>
                </div>

                <button
                  type="button"
                  className="pos-v2-products__wholesale-remove"
                  onClick={() => removeTier(tier.key)}
                  aria-label={`Eliminar nivel de mayoreo ${index + 1}`}
                  title="Eliminar nivel"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
