import React from "react";
import { useOutlet } from "react-router-dom";

export const VisitsNavigator: React.FC = () => {
  const outlet = useOutlet();

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      {outlet ?? <p className="text-sm text-gray-700">Visitas - Home</p>}
    </section>
  );
};
