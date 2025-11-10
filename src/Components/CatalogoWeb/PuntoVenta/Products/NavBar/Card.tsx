import React, { useContext, useRef } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Item } from '../../Model/Item';

interface CardProps {
  Name: string;
  Image?: string;
  Price: number;
  Id: number;
  Barcode: string;
  Color: string;
  ForSale: boolean;
}

interface ProductListProps {
  products: Item[];
}

const Card: React.FC<CardProps> = ({ Name, Image, Price, Id, Barcode, Color, ForSale }) => {
  const scaleValue = useRef(1); // Placeholder for animation
  const navigate = useNavigate();

  const showName = Name.length > 12 ? `${Name.substring(0, 12)}...` : Name;

  const AddItemToCart = () => {
    const product = { Id, Name, Image, Price, Barcode };
    // Navigate to edit product page
    navigate(`/edit-product/${Id}`, { state: { product } });
  };

  if (!ForSale) return null;

  return (
    <div
      className="relative bg-white rounded-lg shadow-md w-1/4 h-40 mb-4 flex flex-col items-center"
      onClick={AddItemToCart}
    >
      {Image ? (
        <img src={Image} alt={Name} className="w-full h-full object-cover rounded-t-lg" />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center rounded-t-lg bg-[${Color || '#ccc'}]`}
        >
          <span className="text-white text-center text-sm font-semibold">{showName}</span>
          {Price > 0 && <span className="text-white mt-1 text-xs">${Price}</span>}
        </div>
      )}
    <div className="absolute bottom-0 w-full bg-[#000000b3] py-2 rounded-b-lg text-center">
      <span className="text-white text-sm">{showName}</span>
      {Price > 0 && <span className="text-white text-xs">${Price}</span>}
    </div>
    </div>
  );
};

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const filteredProducts = products.filter((product) => product.ForSale);

  const groupProducts = (data: Item[]) => {
    const result: Item[][] = [];
    for (let i = 0; i < data.length; i += 3) {
      result.push(data.slice(i, i + 3));
    }
    return result;
  };

  const groupedProducts = groupProducts(filteredProducts);

  return (
    <div className="grid grid-cols-1 gap-4 px-4">
      {groupedProducts.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between">
          {row.map((product) => (
            <Card
              key={product.Id}
              Id={product.Id || 0}
              Name={product.Name}
              Price={product.Price || 0}
              Image={product.Images?.[0] || product.Image}
              Barcode={product.Barcode || ""}
              Color={product.Color || ""}
              ForSale={product.ForSale || false}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
