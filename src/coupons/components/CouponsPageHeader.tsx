import React from "react";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import type { CouponsTheme } from "../interface/theme";

type CouponsPageHeaderProps = {
  theme: CouponsTheme;
  title: string;
  subtitle?: string;
  userName?: string | null;
  showAvatar?: boolean;
  backLabel?: string;
  onBack?: () => void;
};

const ArrowBackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CouponsPageHeader: React.FC<CouponsPageHeaderProps> = ({
  theme,
  title,
  subtitle,
  userName,
  showAvatar = true,
  backLabel,
  onBack,
}) => {
  const resolvedTitle = userName ? `${title} ${userName}` : title;

  return (
    <header className="flex items-center gap-3 pt-8 px-1" style={{ color: theme.textPrimary }}>
      {onBack ? (
        <button
          type="button"
          className="h-11 w-11 rounded-full border flex items-center justify-center"
          style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated }}
          onClick={onBack}
          aria-label={backLabel ?? "Volver"}
        >
          <ArrowBackIcon className="h-5 w-5" />
        </button>
      ) : null}

      {showAvatar ? (
        <div
          className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
        >
          <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold">{resolvedTitle}</p>
        {subtitle ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
};

export { CouponsPageHeader };
