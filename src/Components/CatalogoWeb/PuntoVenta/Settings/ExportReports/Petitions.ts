import { URL } from "../../Const/Const";
export const getInfoProductsTodayReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/products/today/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getInfoProductsMonthReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/products/month/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getInfoProductsYearReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/products/year/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getEmployeesTodayReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/employee/today/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getEmployeesMonthReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/employee/month/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getEmployeesYearReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/employee/year/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getCustomersTodayReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/customer/today/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getCustomersMonthReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/customer/month/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}
export const getCustomersYearReport = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}report/customer/year/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
    }
}