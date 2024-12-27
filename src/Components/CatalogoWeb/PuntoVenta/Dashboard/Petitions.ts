import { URL } from "../Const/Const";
const API_BASE_URL = URL; // Reemplaza con tu URL base

const fetchData = async (url: string, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            token: `${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
};



export const getAveragePurchaseComparison = (businessId: string, token: string) => {
  return fetchData(`report2/average-purchase-comparison/${businessId}`, token);
};

export const getIncomeComparisonByMonth = (businessId: string, token: string) => {
  return fetchData(`report2/income-comparison-by-month/${businessId}`, token);
};

export const getBalanceComparisonByMonth = (businessId: string, token: string) => {
  return fetchData(`report2/balance-comparison-by-month/${businessId}`, token);
};

export const getMostSoldProductsByMonth = (businessId: string, month: string, token: string) => {
  return fetchData(`report2/most-sold-products-by-month/${businessId}/${month}`, token);
};

export const getMostSoldCategoriesByMonth = (businessId: string, month: string, token: string) => {
  return fetchData(`report2/most-sold-categories-by-month/${businessId}/${month}`, token);
};

export const getMostSoldProductsByCategory = (businessId: string, categoryId: string, token: string) => {
  return fetchData(`report2/most-sold-products-by-category/${businessId}/${categoryId}`, token);
};
export const getDetailsToday = (businessId: string, token: string) => {
  return fetchData(`report2/details-today/${businessId}`, token);
};

export const getDetailsThisMonth = (businessId: string, token: string) => {
  return fetchData(`report2/details-month/${businessId}`, token);
};
export const getNewCustomers = (businessId: string, token: string) => {
  return fetchData(`report2/customers-added-today/${businessId}`, token);
};