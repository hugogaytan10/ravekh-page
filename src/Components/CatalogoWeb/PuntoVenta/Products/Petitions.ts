import { URL } from "../Const/Const";
import { Item } from "../Model/Item";
import { Customer } from "../Model/Customer";

export const getProducts = async (token: string, Business_Id: string) => {
    try {
        const response = await fetch(`${URL}products/business/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.map((product: Item) => ({
                ...product,
                Image: product.Image || (product.Images && product.Images[0]) || "",
            }));
        }
        return [];
    }
    catch (e) {
        return [];
    }
}

export const getProduct = async (id: number, token: string) => {
    try {
        const response = await fetch(`${URL}products/${id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        if (data && Array.isArray(data.Images) && !data.Image) {
            data.Image = data.Images[0];
        }
        return data;
    } catch (e) {
        return [];
    }
}

export const updateStock = async (id: number, Stock: string, token: string) => {
    try {
        const response = await fetch(`${URL}products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ Stock })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
    }
}

export const updateProduct = async (product: Item, token: string) => {
    try {
        const response = await fetch(`${URL}products/${product.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify( product )
        });
        console.log("este es el body", product)
        const data = await response.json();
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const insertProduct = async (product: Item, token: string) => {
    try {
        const response = await fetch(`${URL}products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ Product: product })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
    }
}


export const getCategoriesByBusiness = async (idBussines: string, token: string) => {
    try {
        const response = await fetch(`${URL}categories/business/${idBussines}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    } catch (e) {
        return [];
    }
}

export const insertCategory = async (name: string, color: string, idBussines: string, token: string) => {
    try {
        const response = await fetch(`${URL}categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ Name: name, Color: color, Business_Id: idBussines })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
    }
}

//traer la informacion del estock y ganancias
export const getStockInfo = async (idBusiness: string, token: string) => {
    try {
        const response = await fetch(`${URL}business/estimatedinventory/${idBusiness}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        return data;
    } catch (e) {
        return {};
    }
}

export const deleteProduct = async (id: number, token: string) => {
    try {
        const response = await fetch(`${URL}products/available/${id}`, {
            method: 'PUT',
            headers: {
                token: token
            },
            body: JSON.stringify({ Available: false })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
    }
}