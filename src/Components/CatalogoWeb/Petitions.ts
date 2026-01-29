import { URL } from "./Const/Const";
import { Order } from "../CatalogoWeb/Modelo/Order";
import { OrderDetails } from "../CatalogoWeb/Modelo/OrderDetails";
import { Variant } from "./PuntoVenta/Model/Variant";

type CheckoutLineItem = {
    price_data: {
        currency: string;
        product_data: {
            name: string;
        };
        unit_amount: number;
    };
    quantity: number;
};

type CheckoutSessionPayload = {
    line_items: CheckoutLineItem[];
    return_url: string;
    connectedAccountId: string;
    businessId: number;
    mode?: string;
    ui_mode?: string;
    customer_email?: string;
    metadata?: Record<string, string>;
};

export const getProductsByBusiness = async (idBusiness: string) => {
    try {
        const response = await fetch(`${URL}products/showstore/${idBusiness}/1`)
        const data = await response.json();
        if (data) {
            return data;
        }
        return [];
    } catch (error) {
        return [];
    }
}

export const getProductsByBusinessWithStock = async (idBusiness: string, limit: string, page: number) => {
    try {
        const response = await fetch(`${URL}products/showstore/stockgtzero/${idBusiness}/1?page=${page}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Limit: limit }),
        })
        const data = await response.json();
        console.log(data);
        if (data) {
            return data;
        }
        return [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getProductById = async (idProduct: string) => {
    try {
        const response = await fetch(`${URL}products/${idProduct}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export const getBusinessById = async (idBusiness: string) => {
    try {
        const response = await fetch(`${URL}business/${idBusiness}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export const insertOrder = async (order: Order, orderDetails: OrderDetails[]) => {
    try {
        const response = await fetch(`${URL}ordersCatalog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Order: order, OrderDetails: orderDetails }),
        });
        return response.json();
    } catch (e) {
        return e;
    }
}

export const sendNotification = async (deviceToken: string) => {
    try {
        const response = await fetch(`${URL}send-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceToken: deviceToken }),
        });
        return response.json();
    } catch (error) {
        return error;
    }
}

export const getIdentifier = async (idBusiness: string) => {
    try {
        const response = await fetch(`${URL}business/deviceidentifier/${idBusiness}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export const getStripeConfig = async () => {
    try {
        const response = await fetch(`${URL}configStripe`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export const createCheckoutSession = async (payload: CheckoutSessionPayload) => {
    try {
        const response = await fetch(`${URL}createCheckoutSession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return response.json();
    } catch (error) {
        return null;
    }
}

export const confirmCheckoutPayment = async (sessionId: string) => {
    try {
        const response = await fetch(`${URL}confirmCheckoutPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });
        return response.json();
    } catch (error) {
        return null;
    }
}

export const confirmPaymentIntent = async (paymentIntentId: string) => {
    try {
        const response = await fetch(`${URL}confirmPaymentIntent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentIntentId }),
        });
        return response.json();
    } catch (error) {
        return null;
    }
}
export const getCategoriesByBusinesssId = async (idBusiness: string) => {
    try{
        const response = await fetch(`${URL}categories/business/${idBusiness}`);
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
        return [];
    }
}
export const getProductsByCategoryId = async (idCategory: string) => {
    try{
        const response = await fetch(`${URL}products/category/${idCategory}`);
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const getProductsByCategoryIdAndDisponibilty = async (idCategory: string) => {
    try{
        const response = await fetch(`${URL}products/category/availablegtzero/${idCategory}`);
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
        return null;
    }
}

export const getVariantsByProductIdPublic = async (productId: number | string) => {
    try {
        const response = await fetch(`${URL}variants/product/${productId}`);
        const data = await response.json();
        return Array.isArray(data) ? (data as Variant[]) : [];
    } catch (error) {
        return [];
    }
}
