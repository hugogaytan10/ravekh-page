import React from "react";
import ReactDOM from "react-dom/client";
import { IndependentRouterProvider } from "./app/providers/IndependentRouterProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IndependentRouterProvider />
  </React.StrictMode>,
);
