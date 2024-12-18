import React, { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../Context/AppContext';
import Check from '../../../../../assets/POS/Check';

type CategoryModalProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  categories: { id: string; name: string; icon?: React.ReactNode }[];
  categoriesIncome: { id: string; name: string; icon?: React.ReactNode }[];
  category: string | null;
  setCategory: (categoryId: string) => void;
};

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  setIsVisible,
  categories,
  categoriesIncome,
  category,
  setCategory,
}) => {
  const fadeAnim = useRef(1); // For simplicity in React JS
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('Gasto');
  const { store } = useContext(AppContext);

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      // Trigger any animations or preparations when modal becomes visible
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white w-11/12 max-w-md rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar Categoría</h2>
          <button
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
            onClick={handleClose}
          >
            <Check width={30} height={30} stroke={'#000'} />
          </button>
        </div>

        {/* Category Type Selector */}
        <div className="flex justify-center gap-4 my-4">
          <button
            className={`py-2 px-6 rounded-md font-semibold transition-colors ${
              selectedCategoryType === 'Gasto' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedCategoryType('Gasto')}
          >
            Gasto
          </button>
          <button
            className={`py-2 px-6 rounded-md font-semibold transition-colors ${
              selectedCategoryType === 'Ingreso' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedCategoryType('Ingreso')}
          >
            Ingreso
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {(selectedCategoryType === 'Gasto' ? categories : categoriesIncome).map(
              (cat) => (
                <div key={cat.id} className="text-center">
                  <button
                    className={`w-16 h-16 flex items-center justify-center rounded-full transition-all border-2 shadow-md ${
                      selectedCategory === cat.name
                        ? `border-${store.Color || 'blue-500'} bg-gray-100`
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCategory(cat.id);
                    }}
                  >
                    {cat.icon}
                  </button>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      selectedCategory === cat.name ? `text-${store.Color || 'blue-500'}` : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
