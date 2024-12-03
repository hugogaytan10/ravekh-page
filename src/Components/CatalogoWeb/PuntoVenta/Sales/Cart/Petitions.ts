import {URL} from '../../Const/Const';
import { ICommand, IcommandHasProduct } from '../../Model/Command';
import {Order} from '../../Model/Order';
import { OrderDetails } from '../../Model/OrderDetails';
export const InsertOrder = async (order: Order, orderDetails: OrderDetails[], token: string) => {
  try {

    const response = await fetch(`${URL}orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token
      },
      body: JSON.stringify({Order: order, OrderDetails: orderDetails}),
    });
    return response.json();
  } catch (e) {
    return e;
  }
};

export const insertComand = async (order: ICommand, command: IcommandHasProduct[], token: string) => {
  try {
    const response = await fetch(`${URL}commands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token
      },
      body: JSON.stringify({Commands_has_Products: command, Command: order}),
    });
    return response.json();
  } catch (e) {
    return e;
  }
}

export const getTaxesByBusiness = async (businessId: string, token: string) => {
  try {
    const response = await fetch(`${URL}taxes/business/${businessId}`, {
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los impuestos:', error);
    return null;
  }
}
