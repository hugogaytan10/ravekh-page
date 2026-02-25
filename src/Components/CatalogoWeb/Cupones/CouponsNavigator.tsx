import React from "react";
import { Route, Routes } from "react-router-dom";
import { CouponsHomeScreen } from "./screens/CouponsHomeScreen";
import { CouponCreateScreen } from "./screens/CouponCreateScreen";
import { CouponListScreen } from "./screens/CouponListScreen";
import { CouponScanScreen } from "./screens/CouponScanScreen";

export const CouponsNavigator: React.FC = () => {
  return (
    <Routes>
      <Route index element={<CouponsHomeScreen />} />
      <Route path="crear" element={<CouponCreateScreen />} />
      <Route path="lista" element={<CouponListScreen />} />
      <Route path="escanear" element={<CouponScanScreen />} />
    </Routes>
  );
};
