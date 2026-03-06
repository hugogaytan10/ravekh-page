import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getTaxes } from '../Petitions';
import { Tax } from '../../Model/Tax';
import {Trash} from '../../../../../assets/POS/Trash';
import './CartList.css'; // Archivo CSS para estilos
import { AppContext } from '../../../Context/AppContext';
import { CartPos } from '../../Model/CarPos';

interface CartListProps {
  onTotalChange: (total: number) => void;
}

export const CartList: React.FC<CartListProps> = ({ onTotalChange }) => {
  const context = useContext(AppContext);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [taxes, setTaxes] = useState<Tax | null>(null);
  const [totalWithTaxes, setTotalWithTaxes] = useState(0.0);

  // Obtener impuestos desde la API
  const fetchTaxes = async () => {
    try {
      const data = await getTaxes(context.user.Business_Id +"", context.user.Token);
      if (data) setTaxes(data);
    } catch (error) {
      console.error('Error al obtener los impuestos:', error);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  useEffect(() => {
    let total = 0;
    let totalP = 0.0;
  
    context.cartPos.forEach((item: CartPos) => {
      total += item.Quantity;
      totalP += item.Quantity * item.Price;
    });
  
    setTotalItems(total);
    setTotalPrice(totalP);
  
    if (taxes) {
      let taxAmount = taxes.IsPercent ? totalP * (taxes.Value / 100) : taxes.Value;
      const totalWithTax = totalP + taxAmount;
      setTotalWithTaxes(totalWithTax);
      onTotalChange(totalWithTax); // Actualizamos el total en el componente principal
    } else {
      setTotalWithTaxes(totalP);
      onTotalChange(totalP);
    }
  }, [context.cartPos, taxes]);
  
  

  const handleDeleteItem = (id: string, variantId?: number | null) => {
    const targetVariant = variantId ?? null;
    const updatedCart = context.cartPos.filter(
      (item: CartPos) => !(item.Id === Number(id) && (item.Variant_Id ?? null) === targetVariant),
    );
    context.setCartPos(updatedCart);
  };

  const renderCartItems = () =>
    context.cartPos.map((item: CartPos) => (
      <div key={`${item.Id}-${item.Variant_Id ?? "base"}`} className='flex flex-row '>
        <p className="item-quantity">{item.Quantity}x</p>
        <p className="item-name">{item.Name}</p>
        <p className="item-price">
          ${Number((item.Quantity * item.Price).toFixed(2))}
        </p>
        <button className="delete-button" onClick={() => handleDeleteItem(item.Id!.toString(), item.Variant_Id ?? null)}>
          <Trash height={30} width={30} fill={context.store.Color} />
        </button>
      </div>
    ));

  return (
    <div className="cart-list-container">
      <h2 className="list-header">Productos en el carrito</h2>
      <div >{renderCartItems()}</div>

      <div className="footer-container">
        <p className="total-text">Total sin impuestos: ${totalPrice.toFixed(2)}</p>
        <p className="total-text">Total con impuestos: ${totalWithTaxes.toFixed(2)}</p>
        <p className="total-text">Cliente: {context.customer?.Name}</p>
      </div>
    </div>
  );
};
