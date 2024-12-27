import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentTypeScreen.css';
import { ChevronBack } from '../../../../../assets/POS/ChevronBack';
import PlusIcon from '../../../../../assets/POS/PlusIcon';
import MoneyIcon from '../../../../../assets/POS/MoneyIcon';
import CardIcon from '../../../../../assets/POS/CardIcon';
import CreditCardIcon from '../../../../../assets/POS/CreditCardIcon';
import Wallet from '../../../../../assets/POS/Wallet';
import LinkIcon from '../../../../../assets/POS/LinkIcon';
import { MoreIcon } from '../../../../../assets/POS/MoreIcon';
import { AppContext } from '../../../Context/AppContext';

export const PaymentTypeScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('efectivo');
  const navigate = useNavigate();

  const handlePaymentSelection = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const isSelected = (method: string) => selectedPaymentMethod === method;

  const handlerNavigate = () => {
    let formattedPaymentMethod = '';
    switch (selectedPaymentMethod) {
      case 'efectivo':
        formattedPaymentMethod = 'EFECTIVO';
        break;
      case 'débito':
        formattedPaymentMethod = 'TARJETA DE DEBITO';
        break;
      case 'crédito':
        formattedPaymentMethod = 'TARJETA DE CREDITO';
        break;
      case 'Monedero':
        formattedPaymentMethod = 'MONEDERO';
        break;
      case 'link':
        formattedPaymentMethod = 'LINK DE PAGO';
        break;
      case 'Otros':
        formattedPaymentMethod = 'OTROS';
        break;
      default:
        formattedPaymentMethod = (selectedPaymentMethod ?? '').toUpperCase();
    }

    if (selectedPaymentMethod) {
      context.setTicketDetail({
        ...context.ticketDetail,
        paymentMethod: formattedPaymentMethod,
      });
      navigate('/payment', { state: { paymentMethod: formattedPaymentMethod } });
    }
  };

  return (
    <div className="payment-type-screen-container">
      <div className="payment-type-screen-header" style={{ backgroundColor: context.store.Color }}>
        <button
          className="payment-type-screen-back-button"
          onClick={() => navigate(-1)}
        >
          <ChevronBack />
          <span className="payment-type-screen-header-title">Carrito</span>
        </button>
      </div>

      <div className="payment-type-screen-amount-container">
        <span className="payment-type-screen-amount">
          {context.ticketDetail.totalWithTaxes?.toFixed(2)}
        </span>
        <button className="payment-type-screen-tip-link">Agregar propina</button>
      </div>

      <div className="payment-type-screen-payment-options-container">
        <div className="payment-type-screen-payment-option-row">
          <button
            className={`payment-type-screen-payment-option ${
              isSelected('efectivo') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('efectivo')}
          >
            <MoneyIcon
              height={30}
              width={30}
              color={isSelected('efectivo') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('efectivo') ? 'selected' : ''
              }`}
            >
              Efectivo
            </span>
          </button>

          <button
            className={`payment-type-screen-payment-option ${
              isSelected('débito') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('débito')}
          >
            <CardIcon
              height={30}
              width={30}
              strokeColor={isSelected('débito') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('débito') ? 'selected' : ''
              }`}
            >
              Tarjeta de débito
            </span>
          </button>

          <button
            className={`payment-type-screen-payment-option ${
              isSelected('crédito') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('crédito')}
          >
            <CreditCardIcon
              height={30}
              width={30}
              fillColor={isSelected('crédito') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('crédito') ? 'selected' : ''
              }`}
            >
              Tarjeta de crédito
            </span>
          </button>
        </div>

        <div className="payment-type-screen-payment-option-row">
          <button
            className={`payment-type-screen-payment-option ${
              isSelected('Monedero') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('Monedero')}
          >
            <Wallet
              height={30}
              width={30}
              strokeColor={isSelected('Monedero') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('Monedero') ? 'selected' : ''
              }`}
            >
              Monedero
            </span>
          </button>

          <button
            className={`payment-type-screen-payment-option ${
              isSelected('link') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('link')}
          >
            <LinkIcon
              height={30}
              width={30}
              strokeColor={isSelected('link') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('link') ? 'selected' : ''
              }`}
            >
              Link de pago
            </span>
          </button>

          <button
            className={`payment-type-screen-payment-option ${
              isSelected('Otros') ? 'selected' : ''
            }`}
            onClick={() => handlePaymentSelection('Otros')}
          >
            <MoreIcon
              height={25}
              width={25}
              strokeColor={isSelected('Otros') ? '#fff' : context.store.Color}
            />
            <span
              className={`payment-type-screen-payment-option-text ${
                isSelected('Otros') ? 'selected' : ''
              }`}
            >
              Otros
            </span>
          </button>
        </div>
      </div>

      <button
        className="payment-type-screen-confirm-button"
        style={{ backgroundColor: context.store.Color }}
        onClick={handlerNavigate}
      >
        Pago con {selectedPaymentMethod ? selectedPaymentMethod : 'Efectivo'}
      </button>
    </div>
  );
};
