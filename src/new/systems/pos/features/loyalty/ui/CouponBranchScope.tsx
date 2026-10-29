import { useEffect, useState } from "react";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosBranchApi } from "../../../shared/api/PosBranchApi";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import type { PosBranch } from "../../../shared/config/posBranch";

export const CouponBranchScope = ({
  value,
  onChange,
  token,
}: {
  value: number[] | null;
  onChange: (ids: number[] | null) => void;
  token: string;
}) => {
  const [branches, setBranches] = useState<PosBranch[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setBranches([]);
    new PosBranchApi(new FetchHttpClient(getPosApiBaseUrl()))
      .list(token)
      .then((rows) => {
        if (active) setBranches(rows);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar las sucursales.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);
  const options = [
    ...branches.map((branch) => ({
      id: branch.id,
      name: branch.name + (branch.isMain ? " (Principal)" : ""),
    })),
    ...(value ?? [])
      .filter((id) => !branches.some((branch) => branch.id === id))
      .map((id) => ({ id, name: `Sucursal #${id} (no disponible)` })),
  ];
  return (
    <fieldset className="pos-v2-loyalty__coupon-scope">
      <legend>Válido en</legend>
      <label>
        <input
          type="radio"
          checked={value === null}
          onChange={() => onChange(null)}
        />
        Todas las sucursales
      </label>
      <label>
        <input
          type="radio"
          checked={value !== null}
          onChange={() => onChange(value ?? [])}
        />
        Elegir sucursales
      </label>
      {value !== null ? (
        <div>
          {error ? <p role="alert">{error}</p> : null}
          {loading ? (
            <p role="status">Cargando sucursales…</p>
          ) : !error && !options.length ? (
            <p>No hay sucursales disponibles.</p>
          ) : null}
          {options.map((branch) => (
            <label key={branch.id}>
              <input
                type="checkbox"
                checked={value.includes(branch.id)}
                onChange={() =>
                  onChange(
                    value.includes(branch.id)
                      ? value.filter((id) => id !== branch.id)
                      : [...value, branch.id]
                  )
                }
              />
              {branch.name}
            </label>
          ))}
          {!value.length ? (
            <small>Selecciona al menos una sucursal.</small>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
};
