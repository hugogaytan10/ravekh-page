import { URL } from "../Const/Const";
import { Item } from "../Model/Item";
import { Customer } from "../Model/Customer";
import { Variant } from "../Model/Variant";

/**
 * Helpers
 */
const ensureArray = <T,>(value: unknown): T[] => {
    return Array.isArray(value) ? (value as T[]) : [];
};

export interface MutationResult {
    success: boolean;
    message: string;
    error?: string;
}

const parseJsonSafely = async (response: Response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const extractErrorMessage = (payload: any, fallback: string) => {
    if (!payload) {
        return fallback;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
    }

    if (payload.error && typeof payload.error.message === "string" && payload.error.message.trim()) {
        return payload.error.message;
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
    }

    return fallback;
};

export type ProductExtraOption = {
    Id: number;
    Product_Id: number;
    Description: string;
    Type: "COLOR" | "TALLA" | string;
};

export type ProductExtrasByType = {
    COLOR: ProductExtraOption[];
    TALLA: ProductExtraOption[];
} | null;

export type ProductExtraPayload = {
    Product_Id: number;
    Description: string;
    Type: "COLOR" | "TALLA";
};

export const getProducts = async (token: string, Business_Id: string) => {
    try {
        const response = await fetch(`${URL}products/business/${Business_Id}`, {
            headers: {
                token: token
            }
        });
        /*const data = await response.json();
        if (Array.isArray(data)) {
            return data.map((product: Item) => ({
                ...product,
                Image: product.Image || (product.Images && product.Images[0]) || "",
            }));
        }*/
        //return [];
        const data = ensureArray<Item>(await response.json());

        // Normalizamos la Image desde Images[0] si viene vacío
        return data.map((product: Item & { Images?: string[] }) => ({
            ...product,
            Image:
                (product as any).Image ||
                (product.Images && product.Images[0]) ||
                "",
        }));
    }
    catch (e) {
        return [];
    }
}

export const getProduct = async (id: number, token: string) => {
    try {
        /*const response = await fetch(`${URL}products/${id}`, {
            headers: {
                token: token
            }
        });
        const data = await response.json();
        if (data && Array.isArray(data.Images) && !data.Image) {
            data.Image = data.Images[0];
        }
        return data;*/
        const response = await fetch(`${URL}products/${id}`, {
            headers: {
                token: token
            }
        });

        const data: any = await response.json();

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

export const updateProduct = async (product: Item, token: string): Promise<MutationResult> => {
    try {
        const response = await fetch(`${URL}products/${product.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify(product)
        });
        console.log("este es el body", product)
        const data = await parseJsonSafely(response);

        if (!response.ok) {
            return {
                success: false,
                message: data?.message || "No se pudo actualizar el producto.",
                error: extractErrorMessage(data, "Error desconocido al actualizar el producto."),
            };
        }

        return {
            success: true,
            message: data?.message || "Producto actualizado correctamente.",
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "No se pudo actualizar el producto.",
            error: e instanceof Error ? e.message : "Error inesperado al actualizar el producto.",
        };
    }
}

export const insertProduct = async (
    product: Item,
    token: string,
    Variants?: Variant[],
    Extras?: Array<{ Description: string; Type: "COLOR" | "TALLA" }>
): Promise<MutationResult> => {
    try {
        const response = await fetch(`${URL}products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({
                Product: product,
                Variants: Variants && Variants.length ? Variants : null,
                Extras: Extras && Extras.length ? Extras : null,
            })
        });
        const data = await parseJsonSafely(response);

        if (!response.ok) {
            return {
                success: false,
                message: data?.message || "No se pudo insertar el producto.",
                error: extractErrorMessage(data, "Error desconocido al insertar el producto."),
            };
        }

        return {
            success: true,
            message: data?.message || "Producto insertado correctamente.",
        };
    } catch (e) {
        return {
            success: false,
            message: "No se pudo insertar el producto.",
            error: e instanceof Error ? e.message : "Error inesperado al insertar el producto.",
        };
    }
}

export const getVariantsByProductId = async (productId: number, token: string) => {
    try {
        const response = await fetch(`${URL}variants/product/${productId}`, {
            headers: {
                "Content-Type": "application/json",
                token,
            },
        });

        const data = ensureArray<Variant>(await response.json());
        return data;
    } catch (e) {
        return [];
    }
};

export const getExtrasByProductId = async (productId: number, token: string): Promise<ProductExtrasByType> => {
    try {
        const response = await fetch(`${URL}extras/product/${productId}`, {
            headers: {
                "Content-Type": "application/json",
                token,
            },
        });
        const data = await response.json();
        if (!data || typeof data !== "object") return null;

        const color = Array.isArray(data.COLOR) ? data.COLOR : [];
        const size = Array.isArray(data.TALLA) ? data.TALLA : [];
        if (color.length === 0 && size.length === 0) return null;

        return {
            COLOR: color as ProductExtraOption[],
            TALLA: size as ProductExtraOption[],
        };
    } catch (e) {
        return null;
    }
};

export const updateExtra = async (extraId: number, extra: ProductExtraPayload, token: string) => {
    try {
        const response = await fetch(`${URL}extras/${extraId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                token,
            },
            body: JSON.stringify(extra),
        });
        return response.ok;
    } catch (e) {
        return false;
    }
};

export const deleteExtra = async (extraId: number, token: string) => {
    try {
        const response = await fetch(`${URL}extras/${extraId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                token,
            },
        });
        return response.ok;
    } catch (e) {
        return false;
    }
};

export const insertVariant = async (productId: number, variant: Variant, token: string) => {
    const localVariant: Variant = {
        ...variant,
        Product_Id: productId,
    };

    try {
        const { Id, ...variantData } = localVariant as any;

        const response = await fetch(`${URL}variants`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token,
            },
            body: JSON.stringify({ ...variantData, Product_Id: productId }),
        });

        await response.json().catch(() => undefined);
        return true;
    } catch (e) {
        return false;
    }
};

export const updateVariant = async (variantId: number, productId: number, variant: Variant, token: string) => {

    const localVariant: Variant = {
        ...variant,
        Id: variantId,
        Product_Id: productId,
    };

    try {
        const { Id, ...variantData } = localVariant as any;

        const response = await fetch(`${URL}variants/${variantId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                token,
            },
            body: JSON.stringify({ ...variantData, Product_Id: productId }),
        });

        await response.json().catch(() => undefined);
        return true;
    } catch (e) {
        return false;
    }
};

export const deleteVariant = async (variantId: number, token: string) => {
    try {
        const response = await fetch(`${URL}variants/${variantId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                token,
            },
        });

        await response.json().catch(() => ({ success: true }));
        return true;
    } catch (e) {
        return false;
    }
};


export const getCategoriesByBusiness = async (idBussines: string, token: string) => {
    try {
        const response = await fetch(`${URL}categories/business/${idBussines}`, {
            headers: {
                token: token
            }
        });
        const data = ensureArray(await response.json());
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

export const deleteProduct = async (id: number, token: string): Promise<MutationResult> => {
    try {
        const response = await fetch(`${URL}products/available/${id}`, {
            method: 'PUT',
            headers: {
                token: token
            },
            body: JSON.stringify({ Available: false })
        });
        const data = await parseJsonSafely(response);

        if (!response.ok) {
            return {
                success: false,
                message: data?.message || "No se pudo eliminar el producto.",
                error: extractErrorMessage(data, "Error desconocido al eliminar el producto."),
            };
        }

        return {
            success: true,
            message: data?.message || "Producto eliminado correctamente.",
        };
    } catch (e) {
        return {
            success: false,
            message: "No se pudo eliminar el producto.",
            error: e instanceof Error ? e.message : "Error inesperado al eliminar el producto.",
        };
    }
}
