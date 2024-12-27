import { URL } from "../../Const/Const";
import { IOrderCatalog } from "../../Model/orderCatalog";
export const getBusinessInformation = async (businessId: string, token: string) => {
    try{
        const response = await fetch(`${URL}business/${businessId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;


    }catch(e){
        console.log(e);
    }
}

export const updateBusinessInformation = async (businessId: string, token: string, data: any) => {
    try{
        const response = await fetch(`${URL}business/${businessId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        return res;
    }catch(e){
        console.log(e);
    }
}

export const getOrderCatalog = async (businessId: string, token: string) => {
    try{
        const response = await fetch(`${URL}ordersCatalog/${businessId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(e){
        console.log(e);
    }
}

export const getOrderDetails = async (orderId: string, token: string) => {
    try{
        const response = await fetch(`${URL}ordersCatalog/details/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(e){
        console.log(e);
    }
}

export const updateOrderStatus = async (orderId: string, status: string, token: string) => {
    try{
        const ordersCatalog = {
            Status: status
        }
        const response = await fetch(`${URL}ordersCatalog/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({Order: ordersCatalog})
        });
        const data = await response.json();
        return data;
    }catch(e){
        console.log(e);
    }
}