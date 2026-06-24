import { PosPlan } from "../config/posPlanAccess";
import "./PlanUpgradeModal.css";

type PlanUpgradeModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  requiredPlan?: PosPlan;
  ctaLabel?: string;
  onClose: () => void;
  onUpgrade: () => void;
};

export const PlanUpgradeModal = ({
  open,
  title = "Actualiza tu plan",
  message = "Actualiza tu plan para acceder a esta función.",
  requiredPlan,
  ctaLabel = "Actualizar plan",
  onClose,
  onUpgrade,
}: PlanUpgradeModalProps) => {
  if (!open) return null;

  return (
    <section className="pos-plan-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="pos-plan-upgrade-title" onClick={onClose}>
      <article className="pos-plan-upgrade-modal__card" onClick={(event) => event.stopPropagation()}>
        <span className="pos-plan-upgrade-modal__eyebrow">Función premium</span>
        <h2 id="pos-plan-upgrade-title">{title}</h2>
        <p>{message}</p>
        {requiredPlan ? <p className="pos-plan-upgrade-modal__plan">Plan requerido: <strong>{requiredPlan}</strong></p> : null}
        <div className="pos-plan-upgrade-modal__actions">
          <button type="button" className="pos-plan-upgrade-modal__secondary" onClick={onClose}>Ahora no</button>
          <button type="button" className="pos-plan-upgrade-modal__primary" onClick={onUpgrade}>{ctaLabel}</button>
        </div>
      </article>
    </section>
  );
};
