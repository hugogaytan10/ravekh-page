import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getBusinessInformation } from "./Petitions";
import Store from "../../../../../assets/POS/Store";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const StartedStore: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [storeExists, setStoreExists] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBusinessInformation(
        context.user.Business_Id + "",
        context.user.Token
      );
      if (data) {
        setStoreExists(true);
        context.setStore(data); // Guarda la información de la tienda en el contexto si es necesario
        navigate("/main-store-online");
      } else {
        setStoreExists(false);
        navigate("/name-store");
      }
    };
    fetchData();
  }, [context, navigate]);

  const handleAction = () => {
    if (storeExists) {
      navigate("/main-store-online");
    } else {
      navigate("/name-store");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      <header
        className="flex items-center w-full py-4 px-6 bg-primary"
        style={{
          backgroundColor: context.store.Color || "#6200EE",
        }}
      >
        <button
          className="p-2 rounded-full bg-primary-light"
          onClick={() => navigate(-1)}
        >
          <ChevronBack /*strokeColor="#fff"*/ />
        </button>
        <h1 className="ml-4 text-lg font-bold text-white">Tienda</h1>
      </header>

      <div className="flex items-center justify-center mt-20">
        <Store /*width={150} height={150} fillColor="#6200EE"*/ />
      </div>

      <div className="flex flex-col items-center w-4/5 text-center mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center mt-6">
            <div className="loader"></div> {/* Implementa un loader según tu preferencia */}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-primary">
              {storeExists ? "Tienda encontrada" : "Configura tu tienda"}
            </h2>
            <p className="text-base text-gray-600 mt-2">
              {storeExists
                ? "Puedes modificar los datos de tu tienda."
                : "No tienes una tienda configurada, comienza ahora."}
            </p>
            <button
              className="w-3/4 py-3 mt-6 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark"
              onClick={handleAction}
            >
              {storeExists ? "Modificar tienda" : "Configurar tienda"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StartedStore;
