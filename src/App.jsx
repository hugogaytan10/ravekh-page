import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { NewAppRoutes } from "./new/routing/NewAppRoutes";

function App() {
  return (
    <BrowserRouter>
      <NewAppRoutes />
    </BrowserRouter>
  );
}

export default App;
