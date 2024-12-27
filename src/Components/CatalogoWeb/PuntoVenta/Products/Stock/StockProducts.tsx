import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../../../../../assets/POS/Search";
import ScanIcon from "../../../../../assets/POS/ScanCircleIcon";
import {Settings} from "../../../../../assets/POS/Settings";
import { ThemeLight } from "../../Theme/Theme";
import { StockList } from "./StockList";
import { ExpandableModalStock } from "./ExpandableModalStock";
import { AppContext } from "../../../Context/AppContext";

export const StockProducts: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [isShow, setIsShow] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
     
      {/* Stock List */}
      <div className="flex-grow">
        <StockList barcode={barcode} />
      </div>


      {/* Expandable Modal */}
      <ExpandableModalStock />
    </div>
  );
};
