import { URL } from "../../Const/Const";

export const bestSellingProductsToday = async (Business_Id: string, token: string) => {
    try {
        const response = await fetch(`${URL}products/top/today/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        return [];
    }
}
export const bestSellingProductMonth = async (Business_Id: string, token: string) => {
    try {
        const response = await fetch(`${URL}products/top/month/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        return [];
    }
}
export const bestSellingProductsYear = async (Business_Id: string, token: string) => {
    try {
        const response = await fetch(`${URL}products/top/year/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        return [];
    }
}

export const bestCategorySellingToday = async (Business_Id: string, token: string) => {
    try {
        const response = await fetch(`${URL}category/top/today/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        return [];
    }
}
export const bestCategorySellingMonth = async (Business_Id: string, token: string,) => {
    try {
        const response = await fetch(`${URL}category/top/month/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        console.log(e);
        return [];
    }
}
export const bestCategorySellingYear = async (Business_Id: string, token: string) => {
    try {
        const response = await fetch(`${URL}category/top/year/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    }
    catch (e) {
        return [];
    }
}