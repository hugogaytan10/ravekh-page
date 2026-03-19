import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { NEW_PRIMARY_ROUTES } from "./newRoutesConfig";

const renderRoute = (route) => {
  if (route.children?.length) {
    return (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children.map((child) => (
          <Route key={`${route.path}-${child.path}`} path={child.path} element={child.element} />
        ))}
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={route.element} />;
};

export const RutasNew = () => {
  return (
    <Routes>
      {NEW_PRIMARY_ROUTES.map(renderRoute)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
