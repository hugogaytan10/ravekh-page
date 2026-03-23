import { URL } from "./Const/Const";
import { Order } from "../CatalogoWeb/Modelo/Order";
import { OrderDetails } from "../CatalogoWeb/Modelo/OrderDetails";
import { Variant } from "./PuntoVenta/Model/Variant";
import { ProductExtrasResponse } from "./Modelo/ProductExtra";

const syncAvailableCategoryIds = (response: any, businessId?: string) => {
    if (typeof window === "undefined") return;

    const rawIds = response?.pagination?.categoryIdsWithImages;
    const incomingIds = Array.isArray(rawIds)
        ? rawIds
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isFinite(id))
        : [];

    const activeBusinessId =
        String(businessId ?? window.localStorage.getItem("idBusiness") ?? "").trim() || "global";

    let categoriesByBusiness: Record<string, number[]> = {};
    try {
        const raw = window.localStorage.getItem("catalogAvailableCategoryIdsByBusiness");
        const parsed = raw ? JSON.parse(raw) : {};
        if (parsed && typeof parsed === "object") {
            categoriesByBusiness = parsed as Record<string, number[]>;
        }
    } catch {
        categoriesByBusiness = {};
    }

    const existingIds = Array.isArray(categoriesByBusiness[activeBusinessId])
        ? categoriesByBusiness[activeBusinessId]
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isFinite(id))
        : [];

    const mergedIds = Array.from(new Set([...existingIds, ...incomingIds]));
    categoriesByBusiness[activeBusinessId] = mergedIds;

    window.localStorage.setItem(
        "catalogAvailableCategoryIdsByBusiness",
        JSON.stringify(categoriesByBusiness)
    );
    window.localStorage.setItem(
        "catalogAvailableCategoryIds",
        JSON.stringify(mergedIds)
    );
    window.dispatchEvent(
        new CustomEvent("catalogAvailableCategoryIdsUpdated", {
            detail: mergedIds,
        })
    );
};

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

const getProductStoreVisitTracker = () => {
    if (typeof window === 'undefined') {
        return new Set<string>();
    }

    const trackerKey = '__ravekhProductStoreVisitByBusiness__';
    const tracker = (window as unknown as { [key: string]: Set<string> })[trackerKey];

    if (tracker) {
        return tracker;
    }

    (window as unknown as { [key: string]: Set<string> })[trackerKey] = new Set<string>();
    return (window as unknown as { [key: string]: Set<string> })[trackerKey];
};

export const getProductsByBusinessWithStock = async (idBusiness: string, limit: string, page: number) => {
    try {
        const businessKey = String(idBusiness).trim();
        const productStoreVisitByBusiness = getProductStoreVisitTracker();

        // Backend actualmente fuerza visit >= 1 con Math.max, por eso usamos 2 para llamadas subsecuentes.
        const visit = productStoreVisitByBusiness.has(businessKey) ? 2 : 1;
        productStoreVisitByBusiness.add(businessKey);

        const response = await fetch(`${URL}products/showstore/stockgtzero/${idBusiness}/1?page=${page}&visit=${visit}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Limit: limit }),
        })
        const data = await response.json();
        syncAvailableCategoryIds(data, idBusiness);
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
export const getProductsByCategoryIdAndDisponibilty = async (
    idCategory: string,
    limit?: string,
    page: number = 1
) => {
    try{
        const response = await fetch(`${URL}products/category/availablegtzero/${idCategory}?page=${page}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Limit: limit ?? "" }),
        });
        const data = await response.json();
        syncAvailableCategoryIds(data);
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

export const getExtrasByProductIdPublic = async (productId: number | string) => {
    try {
        const response = await fetch(`${URL}extras/product/${productId}`);
        const data = await response.json();
        if (!data || typeof data !== "object") return null;

        const parsed = data as ProductExtrasResponse;
        const hasColor = Array.isArray(parsed?.COLOR) && parsed.COLOR.length > 0;
        const hasSize = Array.isArray(parsed?.TALLA) && parsed.TALLA.length > 0;

        if (!hasColor && !hasSize) {
            return null;
        }

        return parsed;
    } catch (error) {
        return null;
    }
}
