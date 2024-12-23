import React, { useContext, useState } from "react";
import { Trash } from "../../../../../assets/POS/Trash";
import Check from "../../../../../assets/POS/Check";
import { ThemeLight } from "../../Theme/Theme";
import { Header } from "../../Utilities/Header";
import { deleteAccount } from "./Petitions";
import { AppContext } from "../../../Context/AppContext";
import { User } from "../../Model/User";
import { Store } from "../../Model/Store";

export const DeleteAccount: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const context = useContext(AppContext);
  const appColor = context.store?.Color || ThemeLight.btnBackground;

  const handleDeletePress = () => {
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmModalVisible(false);
    setIsLoading(true);

    try {
      const data = await deleteAccount(context.user.Token, context.user.Id);
      if (data) {
        context.setUser({} as User);
        context.setStore({} as Store);
        //await removeItem("user");
        context.setShowNavBar(false);
        setModalMessage("Cuenta eliminada con éxito");
        navigation.navigate("GetStartedDelete");
      } else {
        setModalMessage("No se pudo eliminar la cuenta. Intenta de nuevo.");
      }
    } catch (error) {
      setModalMessage("Ocurrió un error al intentar eliminar la cuenta.");
    } finally {
      setIsLoading(false);
      setResultModalVisible(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header navigation={navigation} screenName="Eliminar cuenta" />

      {/* Contenido */}
      <div className="flex flex-col items-center justify-center px-5 mt-10">
        <div className="flex flex-col items-center bg-white p-5 rounded-lg shadow-md w-full">
          <div className="flex justify-center items-center bg-red-100 w-24 h-24 rounded-full mb-5">
            <Trash width={60} height={60} fill="red" />
          </div>
          <p className="text-center text-gray-700 text-lg mb-4">
            Hola, Usuario confirma que quieres eliminar tu cuenta.
          </p>
          {context.user.Role === "ADMINISTRADOR" && (
            <p className="text-center text-gray-700 text-lg mb-4">
              Como administrador, todo el negocio se perderá junto con sus productos y empleados.
            </p>
          )}

          <div className="flex items-center mt-5">
            <button
              className="flex items-center mr-3 w-6 h-6 border rounded border-gray-400"
              style={{ borderColor: appColor }}
              onClick={() => setIsChecked(!isChecked)}
            >
              {isChecked && (
                <div
                  className="flex items-center justify-center w-full h-full"
                  style={{ backgroundColor: appColor }}
                >
                  <Check width={16} height={16} />
                </div>
              )}
            </button>
            <span className="text-gray-700 text-sm">Quiero eliminar mi cuenta.</span>
          </div>
        </div>
      </div>

      {/* Botón para eliminar */}
      <button
        className={`w-4/5 py-3 mx-auto my-5 text-white text-lg font-semibold rounded-lg ${
          isChecked ? "bg-red-500" : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={handleDeletePress}
        disabled={!isChecked}
      >
        Eliminar cuenta
      </button>

      {/* Modal de Confirmación */}
      {confirmModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-md w-4/5">
            <p className="text-gray-700 text-lg mb-4 text-center">
              ¿Estás seguro de que deseas eliminar tu cuenta?
            </p>
            <div className="flex justify-around mt-5">
              <button
                className="px-5 py-2 border rounded-lg text-red-500"
                onClick={() => setConfirmModalVisible(false)}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2 bg-red-500 text-white rounded-lg"
                onClick={handleConfirmDelete}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado */}
      {resultModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-md w-4/5 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mb-4"></div>
                <p className="text-gray-700">Cargando...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 text-lg mb-4">{modalMessage}</p>
                <button
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => setResultModalVisible(false)}
                >
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
