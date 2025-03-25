import React, { useState } from "react";
import { StockList } from "./StockList";
import { ExpandableModalStock } from "./ExpandableModalStock";

export const StockProducts: React.FC = () => {
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
