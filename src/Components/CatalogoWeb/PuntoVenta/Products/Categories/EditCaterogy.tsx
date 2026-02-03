import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../../Theme/Theme";
import { deleteCategory, updateCategory } from "../../Sales/Petitions";
import { Category } from "../../Model/Category";
import { Trash } from "../../../../../assets/POS/Trash";
import { DeleteCategoryModal } from "./DeleteCategoryModal";

export const EditCategory: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [categoryName, setCategoryName] = useState(
    context.categorySelected.Name
  );
  const [colorSelected, setColorSelected] = useState(
    context.categorySelected.Color
  );
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getDynamicText = () => {
    return categoryName.length > 0 ? categoryName : "Nombre";
  };

  const saveCategory = async () => {
    if (!categoryName) return;
    const category : Category = {
        Id: context.categorySelected.Id,
        Business_Id: context.user.Business_Id,
        Name: categoryName,
        Color: colorSelected,
        Parent_Id: context.categorySelected.Parent_Id || null,
    }
    await updateCategory(
        category,
        context.user.Token
    );
    context.setStockFlag(!context.stockFlag);
    navigate(-1); // Regresa a la página anterior
  };

  const handleDeleteCategory = async () => {
    if (!context.categorySelected.Id || isDeleting) return;
    setIsDeleting(true);
    const success = await deleteCategory(
      context.categorySelected.Id,
      context.user.Token
    );
    setIsDeleting(false);
    if (success) {
      context.setStockFlag(!context.stockFlag);
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button
          onClick={() => {
            navigate(-1);
            context.setShowNavBarBottom(false);
          }}
          className="mr-auto"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold text-center">Crear categoría</h1>
        {context.categorySelected.Id ? (
          <button
            className="ml-auto"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Eliminar categoría"
          >
            <Trash width={24} height={24} fill="#fff" />
          </button>
        ) : (
          <span className="ml-auto"></span>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {/* Color Picker Section */}
        <div className="flex items-center justify-center mb-6">
          {/* Small Square for Color Selection */}
          <button
            className="w-10 h-10 rounded mr-4"
            style={{ backgroundColor: colorSelected || "#A020F0" }}
            onClick={() => setIsPickerVisible(true)}
          ></button>

          {/* Large Square with Category Name */}
          <div
            className="w-20 h-20 rounded flex items-center justify-center"
            style={{ backgroundColor: colorSelected || "#A020F0" }}
          >
            <span className="text-white font-bold text-lg">
              {getDynamicText()}
            </span>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Nombre de la categoría"
            maxLength={20}
            className="w-full border-b-2 bg-white border-gray-300 p-2 focus:outline-none focus:border-purple-500 text-base mb-2"
          />
          <p className="text-sm text-gray-500 text-center">
            Máx. 20 caracteres
          </p>
        </div>
      </main>

      {/* Footer with Save Button */}
      <footer className="p-4 bg-white shadow-md">
        <button
          onClick={saveCategory}
          className="w-full py-3 bg-purple-500 text-white rounded-lg text-lg font-bold hover:bg-purple-600"
          style={{
            backgroundColor: context.store.Color || ThemeLight.btnBackground,
          }}
        >
          Guardar
        </button>
      </footer>

      {/* Color Picker Modal */}
      <PickerColor
        colorSelected={colorSelected}
        setColorSelected={setColorSelected}
        isVisible={isPickerVisible}
        setIsVisible={setIsPickerVisible}
      />

      <DeleteCategoryModal
        isVisible={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
};
