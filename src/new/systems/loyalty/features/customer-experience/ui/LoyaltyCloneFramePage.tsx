import { useMemo } from "react";
import { useLocation } from "react-router-dom";

type LoyaltyCloneFramePageProps = {
  path: string;
};

export const LoyaltyCloneFramePage = ({ path }: LoyaltyCloneFramePageProps) => {
  const src = useMemo(() => {
    if (typeof window === "undefined") return `https://www.ravekh.com${path}`;
    return `${window.location.origin}${path}`;
  }, [path]);

  return (
    <section className="loyalty-customer-portal__frame-wrap" aria-label={`Pantalla fidelidad ${path}`}>
      <iframe title={`Fidelidad ${path}`} src={src} className="loyalty-customer-portal__frame" loading="lazy" />
    </section>
  );
};

export const LoyaltyCloneCurrentPathFramePage = () => {
  const location = useLocation();
  const mirroredPath = location.pathname.replace(/^\/v2\/loyalty\/clone/, "") || "/cupones";
  return <LoyaltyCloneFramePage path={`${mirroredPath}${location.search}`} />;
};
