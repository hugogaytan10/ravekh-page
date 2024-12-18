import {URL} from '../Const/Const';
import {Customer} from '../Model/Customer';

export const insertCustomer = async (customer: Customer, token: string) => {
  try {
    const response = await fetch(`${URL}customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Si tu API requiere autenticación
      },
      body: JSON.stringify(customer),
    });

    const data = await response.json();

    if (!response.ok) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
export const updateCustomer = async (customer: Customer, token: string) => {
  try {
    const response = await fetch(`${URL}customers/${customer.Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: JSON.stringify(customer),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
export const getCustomerById = async (customerId: string, token: string) => {
  try {
    const response = await fetch(`${URL}customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json(); // Leer directamente como JSON
    return data;
  } catch (error) {
    return null;
  }
}
export const getCustomers = async (token: string, businessId: string) => {
  try {
    const response = await fetch(`${URL}customers/business/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener los clientes: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json(); // Leer directamente como JSON
    return data;
  } catch (error) {
    return [];
  }
};

export const deleteCustomer = async (customerId: string, token: string) => {
  try {
    const response = await fetch(`${URL}customers/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Error en la respuesta:', response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getSales = async (customerId: string, period: string, token: string) => {
  try {
    //vamos hacer un switch para tener el periodo en el formato correcto
    let periodFormat = "";
    switch (period) {
      case "Día":
        periodFormat = "DAY";
        break;
      case "Mes":
        periodFormat = "MONTH";
        break;
      case "Año":
        periodFormat = "YEAR";
        break;
      default:
        periodFormat = "DAY";
        break;
    }
    const response = await fetch(`${URL}customers/order/${customerId}/${periodFormat}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: `${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json(); // Leer directamente como JSON
    return data;
  } catch (error) {
    return [];
  }
};

export const getOrderDetails = async (orderId: string, token: string) => {
  try {
    const response = await fetch(`${URL}products/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: `${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json(); // Leer directamente como JSON
    return data;
  } catch (error) {
    return [];
  }
}
