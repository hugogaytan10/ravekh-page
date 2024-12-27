import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getCurrentCut, getCutsByEmployee, insertCut } from "./Petitions";
import { ICashClosing } from "../../Model/CashClosing";
import { ModalBoxCutting } from "./ModalBoxCutting";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const CuttingByEmployee: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();

  const [cuts, setCuts] = useState<ICashClosing[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [amountInCash, setAmountInCash] = useState<number>(0);

  useEffect(() => {
    if (!employeeId) return;

    getCurrentCut(context.user.Token, employeeId).then((data) => {
      setAmountInCash(data || 0);
    });

    getCutsByEmployee(context.user.Token, employeeId).then((data) => {
      setCuts(data);
    });
  }, [employeeId, context.user.Token]);

  const handleAddCut = () => {
    if (!employeeId) return;

    const newCut: ICashClosing = {
      Employee_Id: parseInt(employeeId, 10),
      Total: amountInCash,
      Date: new Date(),
    };

    setCuts((prev) => [...prev, newCut]);
    insertCut(context.user.Token, newCut);
    setShowModal(false);
    setAmountInCash(0);
    navigate(-1);
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <header
        className="flex items-center gap-4 p-4 text-white"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button onClick={() => navigate(-1)}>
          <ChevronBack  />
        </button>
        <h1 className="text-lg font-semibold">
          Historial de Cortes
        </h1>
      </header>

      <div className="flex flex-col p-4">
        {cuts.length > 0 ? (
          <ul className="space-y-4">
            {cuts.map((cut) => (
              <li
                key={cut.Id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="text-lg font-medium">Corte: ${cut.Total}</p>
                  <p className="text-sm text-gray-500">Fecha: {cut.Date ? new Date(cut.Date).toLocaleString() : "Fecha no disponible"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No hay cortes disponibles</p>
        )}
      </div>

      <div className="p-4">
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Agregar Corte
        </button>
      </div>

      {showModal && (
        <ModalBoxCutting
          isVisible={showModal}
          onAccept={handleAddCut}
          onClose={() => setShowModal(false)}
          cashAmount={amountInCash.toString()}
        />
      )}
    </div>
  );
};
