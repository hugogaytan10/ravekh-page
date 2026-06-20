import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { normalizePosPlan } from "../../../shared/config/posPlanAccess";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2UpgradePlanPage.css";

export const PosV2UpgradePlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requiredPlan = normalizePosPlan(searchParams.get("requiredPlan"));
  const feature = searchParams.get("feature")?.trim() || "esta función";
  const from = searchParams.get("from")?.trim() || POS_V2_PATHS.more;

  const safeFrom = useMemo(() => from.startsWith("/") ? from : POS_V2_PATHS.more, [from]);

  return (
    <PosV2Shell title="Actualizar plan" subtitle="Desbloquea funciones premium para tu negocio.">
      <section className="pos-v2-upgrade-plan">
        <article className="pos-v2-upgrade-plan__card">
          <span>Plan requerido</span>
          <h2>{requiredPlan}</h2>
          <p>La función <strong>{feature}</strong> requiere un plan superior. Actualiza tu plan para continuar usándola en el POS.</p>
          <div className="pos-v2-upgrade-plan__actions">
            <button type="button" className="pos-v2-upgrade-plan__secondary" onClick={() => navigate(safeFrom)}>Regresar</button>
            <button type="button" className="pos-v2-upgrade-plan__primary" onClick={() => navigate(POS_V2_PATHS.morePreview("stripe-connect"))}>Continuar con compra</button>
          </div>
          <p className="pos-v2-upgrade-plan__todo">TODO: conectar esta pantalla con el checkout final de Stripe/planes cuando esté disponible.</p>
        </article>
      </section>
    </PosV2Shell>
  );
};
