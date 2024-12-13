import React, { useRef, useState, useEffect, useContext } from "react";
import { AppContext } from "../../../Context/AppContext";
import { getStockInfo } from "../Petitions";

type StockInfo = {
  totalValue: number;
  totalProfit: number;
  totalItems: number;
  noStock: number;
  withoutStock: number;
  optimalStock: number;
  expiredProducts: number;
  minStockProducts: number;
  negativeStock: number;
};

export const ExpandableModalStock: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const context = useContext(AppContext);

  useEffect(() => {
    getStockInfo(context.user.Business_Id + "", context.user.Token).then(
      (data) => {
        setStockInfo(data);
      }
    );
  }, [context.user.Business_Id, context.user.Token]);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white transition-all shadow-md border border-gray-200 ${
        currentIndex === 0 ? "h-16" : "h-48"
      }`}
    >
      <div
        className="flex justify-between items-center px-4 py-2 cursor-pointer"
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? 1 : 0))}
      >
        <div>
          <p className="text-sm font-semibold text-gray-700">
            Total: $
            {stockInfo && stockInfo.totalProfit > 0
              ? stockInfo.totalProfit
              : "No hay datos"}
          </p>
          <p className="text-xs text-gray-500">
            Costo de stock: $
            {stockInfo && stockInfo.totalValue > 0
              ? stockInfo.totalValue
              : "No hay datos"}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {stockInfo && stockInfo.totalItems > 0
            ? `${stockInfo.totalItems} en stock`
            : "Sin datos"}
        </p>
      </div>

      {currentIndex === 1 && stockInfo && (
        <div className="px-4 py-2">
          <p className="text-center text-sm text-gray-700 mb-2">
            {stockInfo.totalItems} Items en stock
          </p>
          <p className="text-center text-lg font-bold text-gray-800 mb-4">
            ${stockInfo.totalProfit}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <p className="text-sm text-gray-600">
              En stock: $
              {stockInfo.totalValue > 0 ? stockInfo.totalValue : "No hay datos"}
            </p>
            <p className="text-sm text-gray-600">
              Expirado: {stockInfo.expiredProducts > 0 ? stockInfo.expiredProducts : 0}
            </p>
            <p className="text-sm text-red-500">
              Sin stock: {stockInfo.noStock > 0 ? stockInfo.noStock : 0}
            </p>
            <p className="text-sm text-orange-500">
              Bajo de stock: {stockInfo.minStockProducts > 0 ? stockInfo.minStockProducts : 0}
            </p>
            <p className="text-sm text-red-500">
              Stock negativo: {stockInfo.negativeStock > 0 ? stockInfo.negativeStock : 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
