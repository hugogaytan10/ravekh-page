import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { NewAppRoutes } from "./new/routing/NewAppRoutes";
import { MetaPixelRouteTracker } from "./new/systems/main-catalog/pages/MetaPixelRouteTracker";

function App() {
  return (
    <BrowserRouter>
        <MetaPixelRouteTracker />
      <NewAppRoutes />
    </BrowserRouter>
  );
}

export default App;
