import { Navigate, Route, Routes, useLocation } from "react-router-dom";

const LoyaltyCloneRedirect = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/^\/?v2\/loyalty\/clone\/?/i, "").replace(/^\/+/, "");
  const target = normalizedPath ? `/coupons/${normalizedPath}` : "/coupons";
  return <Navigate to={`${target}${location.search}`} replace />;
};

export const LoyaltyCustomerLegacyCloneRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<LoyaltyCloneRedirect />} />
    </Routes>
  );
};
