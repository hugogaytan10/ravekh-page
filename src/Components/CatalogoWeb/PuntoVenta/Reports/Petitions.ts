import { URL } from '../Const/Const';
// petitions.ts
export const fetchReportData = async (businessId: number, period: string) => {
  try {
    const response = await fetch(`${URL}report/${businessId}`);
    const data = await response.json();
    if (period === 'Día') {
      return {
        balance: data.Day.Balance,
        income: data.Day.Income,
        profit: data.Day.Earnings || 0,
        averagePurchase: data.Day.AverageSale,
        sales: data.Day.SalesTotal,
        cardPercentage: data.Day.CardSales,
        cashPercentage: data.Day.CashSales,
        bestSeller: data.Day.MostSoldProduct,
        bestCategory: data.Day.MostSoldCategory,
      };
    } else if (period === 'Mes') {
      return {
        balance: data.Month.Balance,
        income: data.Month.Income,
        profit: data.Month.Earnings || 0,
        averagePurchase: data.Month.AverageSale,
        sales: data.Month.SalesTotal,
        cardPercentage: data.Month.CardSales,
        cashPercentage: data.Month.CashSales,
        bestSeller: data.Month.MostSoldProduct,
        bestCategory: data.Month.MostSoldCategory,
      };
    } else if (period === 'Año') {
      return {
        balance: data.Year.Balance,
        income: data.Year.Income,
        profit: data.Year.Earnings || 0,
        averagePurchase: data.Year.AverageSale,
        sales: data.Year.SalesTotal,
        cardPercentage: data.Year.CardSales,
        cashPercentage: data.Year.CashSales,
        bestSeller: data.Year.MostSoldProduct,
        bestCategory: data.Year.MostSoldCategory,
      };
    }
  } catch (error) {
    console.error('Error al obtener el reporte:', error);
    return null;
  }
};

export const getIncomesToday = async (businessId: string) => {
  try {
    const response = await fetch(`${URL}income/today/${businessId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los ingresos del dia:', error);
    return [];
  }
};
export const getIncomesMonth = async (businessId: string) => {
  try {
    const response = await fetch(`${URL}income/month/${businessId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los ingresos del mes:', error);
    return [];
  }
};

export const getIncomesYear = async (businessId: string) => {
  try {
    const response = await fetch(`${URL}income/year/${businessId}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error al obtener los ingresos del año:', error);
    return [];
  }
};

export const getSales = async (businessId: string, period: string, payment: string, token: string) => {
  try {
    const bodyPetition = {
      business_Id: businessId,
      date: period.toUpperCase(),
      payment: payment,
    }
    const response = await fetch(`${URL}sales/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token
      },
      body: JSON.stringify(bodyPetition),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener las ventas del dia:', error);
    return [];
  }
};
export const getOrderById = async (orderId: string, token: string) => {
  try {
    const response = await fetch(`${URL}products/order/${orderId}`, {
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    return null;
  }
}
export const getCommandById = async (commandId: string, token: string) => {
  try {
    const response = await fetch(`${URL}products/command/${commandId}`, {
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener el comando:', error);
    return null;
  }
}