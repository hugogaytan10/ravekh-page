import React, { useContext, useEffect } from 'react';
import './ExpandableModalScanner.css'; // Archivo CSS para estilos
import {ChevronGo} from '../../../../../assets/POS/ChevronGo';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
interface ExpandableModalScannerProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export const ExpandableModalScanner: React.FC<ExpandableModalScannerProps> = ({
  isVisible,
  setIsVisible,
}) => {
    const navigate = useNavigate(); // React Router para navegación
  const context = useContext(AppContext);

  const options = [
    { key: '1', title: 'Agregar nota al pedido' },
    {
      key: '2',
      title: 'Agregar descuento a la venta',
      onPress: () => navigate('/DiscountScreen'),
    },
    {
      key: '3',
      title: 'Limpiar carrito',
      onPress: () => context.setCartPos([]),
    },
  ];

  useEffect(() => {
    if (!isVisible) {
      document.body.style.overflow = 'auto'; // Permitir scroll al cerrar el modal
    } else {
      document.body.style.overflow = 'hidden'; // Evitar scroll al abrir el modal
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsVisible(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Opciones adicionales</h2>
          <button className="close-button" onClick={() => setIsVisible(false)}>
            X
          </button>
        </div>
        <ul className="modal-options">
          {options.map((item) => (
            <li
              key={item.key}
              className="option-item"
              onClick={() => {
                if (item.onPress) item.onPress();
                setIsVisible(false);
              }}
            >
              <span className="option-text">{item.title}</span>
              <ChevronGo height={20} width={20} stroke="#A8A9AA" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
