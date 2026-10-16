import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { clearPosSessionSnapshot, readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { canDeleteOwnAccount } from "../model/accountSettings";
import "./PosSettings.css";

export const PosV2DeleteAccountPage = () => {
  const navigate = useNavigate();
  const [session] = useState(readPosSessionSnapshot);
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const admin = resolvePosOperatorRole(session.token) === "admin";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !canDeleteOwnAccount(session.employeeId, confirmation)) return;
    setSaving(true); setError("");
    try {
      const result = await new FetchHttpClient(getPosApiBaseUrl()).request<{ affectedRows?: number }>({ method: "DELETE", path: `employee/${session.employeeId}`, token: session.token });
      if (!result?.affectedRows) throw new Error("No se pudo eliminar la cuenta.");
      clearPosSessionSnapshot(); navigate(POS_V2_PATHS.login, { replace: true });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar la cuenta."); }
    finally { setSaving(false); }
  };
  return <PosV2Shell title="Eliminar cuenta"><section className="pos-settings"><form className="pos-settings__card" onSubmit={submit}>
    <h2>Esta acción no se puede deshacer</h2>
    <p>{admin ? "Se eliminarán tu cuenta, el negocio, sus productos y datos asociados." : "Se eliminará tu cuenta. Si formas parte del historial del negocio, el servidor puede impedir su eliminación."}</p>
    <label className="pos-settings__field">Escribe ELIMINAR para confirmar<input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" disabled={saving} /></label>
    <div className="pos-settings__actions"><button type="submit" disabled={saving || !canDeleteOwnAccount(session.employeeId, confirmation)}>{saving ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}</button><button type="button" disabled={saving} onClick={() => navigate(POS_V2_PATHS.account)}>Cancelar</button></div>
    {error ? <p role="alert">{error}</p> : null}
  </form></section></PosV2Shell>;
};
