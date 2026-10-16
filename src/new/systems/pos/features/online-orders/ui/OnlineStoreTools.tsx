import { useState } from "react";
import { Link } from "react-router-dom";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { readPosBranchSnapshot } from "../../../shared/config/posBranch";
import { buildPosPublicCatalogUrl } from "../../../shared/config/posExternalLinks";
import "../../settings/ui/PosSettings.css";

export const OnlineStoreTools = () => {
  const session = readPosSessionSnapshot();
  const branch = readPosBranchSnapshot();
  const url = buildPosPublicCatalogUrl(session.businessId, branch.businessId === session.businessId ? branch.slug : null);
  const [message, setMessage] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMessage("Enlace copiado."); }
    catch { setMessage("Selecciona el enlace para copiarlo manualmente."); }
  };
  return <section className="pos-settings" aria-label="Administrar tienda en línea">
    <div className="pos-settings__card"><h2>Administra tu catálogo</h2><p>Comparte tu tienda y gestiona los pedidos recibidos.</p>
      <label className="pos-settings__field">Enlace público de tu catálogo<input value={url} readOnly onFocus={event => event.target.select()} /></label>
      <div className="pos-settings__actions"><button type="button" onClick={() => void copy()}>Copiar enlace</button><a href={url} target="_blank" rel="noreferrer">Abrir catálogo</a></div>
      {message ? <p role="status">{message}</p> : null}
      <Link className="pos-settings__link" to={`${POS_V2_PATHS.more}#catalog-tools`}>Banner y código QR →</Link>
      <Link className="pos-settings__link" to={POS_V2_PATHS.catalog}>Ajustes del catálogo →</Link>
      <Link className="pos-settings__link" to={POS_V2_PATHS.morePreview("business")}>Información del negocio →</Link>
    </div>
  </section>;
};
