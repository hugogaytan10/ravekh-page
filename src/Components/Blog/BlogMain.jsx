import React from "react";
import { CategoriasBlog } from "./CategoriasBlog";

export const BlogMain = () => {
  return (
    <div className="min-h-screen">
      <h2 className="text-center p-2 mb-20 text-2xl font-bold">Bienvenido al Blog de RAVEKH</h2>
      <CategoriasBlog/>
    </div>
  );
};
