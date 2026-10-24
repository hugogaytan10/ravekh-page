import { FeatureUnlockModal } from "../../../shared/ui/FeatureUnlockModal";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { normalizePosPlan, POS_PLAN_ACTION_RULES, PlanProtectedAction } from "../../../shared/config/posPlanAccess";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2UpgradePlanPage.css";

export const PosV2UpgradePlanPage = () => {
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const requiredPlan = normalizePosPlan(searchParams.get("requiredPlan"));
  const feature = searchParams.get("feature")?.trim() || "esta función";
  const featureLabel = POS_PLAN_ACTION_RULES[feature as PlanProtectedAction]?.title.replace(/ bloquead[oa]s?$/, "") || feature;
  const from = searchParams.get("from")?.trim() || POS_V2_PATHS.more;

  const safeFrom = useMemo(() => from.startsWith("/") && !from.startsWith("//") ? from : POS_V2_PATHS.more, [from]);

  return (
    <PosV2Shell title="Actualizar plan" subtitle="Desbloquea funciones premium para tu negocio.">
      <section className="pos-v2-upgrade-plan">
        <article className="pos-v2-upgrade-plan__card">
          <span>Plan requerido</span>
          <h2>{requiredPlan}</h2>
          <p><strong>{featureLabel}</strong> requiere un plan superior. Actualiza tu plan para continuar usándola en el POS.</p>
          <div className="pos-v2-upgrade-plan__actions">
            <button type="button" className="pos-v2-upgrade-plan__secondary" onClick={() => navigate(safeFrom)}>Regresar</button>
            <button type="button" className="pos-v2-upgrade-plan__primary" onClick={() => setCheckoutOpen(true)}>Continuar con compra</button>
          </div>

        </article>
      </section>
      <FeatureUnlockModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title={`Activa ${requiredPlan === "GRATUITO" ? "tu plan" : requiredPlan}`} message="Elige tu plan y completa el pago para activar las funciones de tu negocio." onPaymentSuccess={() => { setCheckoutOpen(false); navigate(safeFrom); }} />
    </PosV2Shell>
  );
};
