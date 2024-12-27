import React, { useContext, useState } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { insertCategory } from "../Petitions";
import { ThemeLight } from "../../Theme/Theme";
import { AppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";

export const AddCategoriesSales: React.FC = () => {
  const context = useContext(AppContext);
  const navigation = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [colorSelected, setColorSelected] = useState(ThemeLight.btnBackground);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const getDynamicText = () => {
    return categoryName.length > 0 ? categoryName : "Nombre";
  };

  const saveCategory = async () => {
    if (!categoryName) return;
    insertCategory(
      categoryName,
      colorSelected,
      context.user.Business_Id.toString(),
      context.user.Token
    );
    context.setStockFlag(!context.stockFlag);
    navigation(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button onClick={() => navigation(-1)} className="mr-2">
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold">Crear Categoría</h1>
      </header>

      {/* Color Picker Section */}
      <div className="flex items-center justify-center space-x-6 py-5">
        <button
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: colorSelected }}
          onClick={() => setIsPickerVisible(true)}
        ></button>
        <div
          className="w-20 h-20 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colorSelected }}
        >
          <span className="text-white font-bold">{getDynamicText()}</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex flex-col items-center py-6">
        <input
          type="text"
          placeholder="Nombre de la categoría"
          maxLength={20}
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-4/5 p-3 border-b border-gray-300 rounded-md text-gray-700 bg-white"
        />
        <span className="text-gray-500 text-sm mt-2">Máx. 20 caracteres</span>
      </div>

      {/* Save Button */}
      <button
        onClick={saveCategory}
        className="w-4/5 py-3 bg-purple-600 text-white font-bold text-center rounded-md shadow-lg mx-auto mt-auto mb-5"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        Guardar
      </button>

      {/* Color Picker Modal */}
      <PickerColor
        colorSelected={colorSelected}
        setColorSelected={setColorSelected}
        isVisible={isPickerVisible}
        setIsVisible={setIsPickerVisible}
      />
    </div>
  );
};

