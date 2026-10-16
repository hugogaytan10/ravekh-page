import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { validateAccountSettings } from "../model/accountSettings";
import "./PosSettings.css";

export const PosV2AccountPage = () => {
  const [session] = useState(readPosSessionSnapshot);
  const client = useMemo(() => new FetchHttpClient(getPosApiBaseUrl()), []);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    if (!session.employeeId) { setLoading(false); setError("No encontramos el usuario de esta sesión."); return; }
    client.request<{ Name?: string }>({ method: "GET", path: `employee/${session.employeeId}`, token: session.token })
      .then(user => { if (active) { setName(user.Name || ""); setLoaded(true); } })
      .catch(() => { if (active) setError("No se pudo cargar la información de tu cuenta."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, session.employeeId, session.token]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (saving || !loaded) return;
    setMessage(""); const validation = validateAccountSettings(name, password); setError(validation); if (validation) return;
    setSaving(true);
    try {
      await client.request({ method: "PUT", path: `employee/${session.employeeId}`, token: session.token, body: { Name: name.trim(), ...(password ? { Password: password } : {}) } });
      setPassword(""); setMessage("Información básica actualizada correctamente.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar tu cuenta."); }
    finally { setSaving(false); }
  };
  return <PosV2Shell title="Información básica" subtitle="Revisa y edita tu información"><section className="pos-settings">
    <form className="pos-settings__card" onSubmit={save}>
      {loading ? <p role="status">Cargando cuenta…</p> : null}
      <fieldset disabled={loading || saving || !loaded}>
        <label className="pos-settings__field">Nombre de usuario<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} /></label>
        <label className="pos-settings__field">Nueva contraseña<input autoComplete="new-password" type={visible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label className="pos-settings__row">Mostrar contraseña<input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /></label>
        <p>Déjala vacía para conservar la actual. Usa al menos 6 caracteres, un número y un carácter especial.</p>
        <button type="submit">{saving ? "Guardando…" : "Guardar cambios"}</button>
      </fieldset>
    </form><Link className="pos-settings__link" to={POS_V2_PATHS.securityQuestions}>Pregunta de seguridad →</Link>
    <Link className="pos-settings__link" to={POS_V2_PATHS.deleteAccount}>Eliminar cuenta →</Link>
    {error ? <p role="alert">{error}</p> : null}{message ? <p role="status">{message}</p> : null}
  </section></PosV2Shell>;
};
