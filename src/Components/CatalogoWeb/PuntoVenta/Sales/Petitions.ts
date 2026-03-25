import { URL } from "../Const/Const";
import { Category } from "../Model/Category";
import { Item } from "../Model/Item";
import { Variant } from "../Model/Variant";

interface MutationResult {
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

const logSalesEndpointRequest = (label: string, url: string, method: string, body?: unknown) => {
    console.log(`[Sales][${label}] Request`, {
        method,
        url,
        body: body ?? null,
    });
};

const logSalesEndpointResponse = (label: string, response: Response, data: unknown) => {
    console.log(`[Sales][${label}] Response`, {
        status: response.status,
        ok: response.ok,
        data,
    });
};

export const getProduct = (idUser: number, token: string) => {
    try {
        const productNullStock = fetch(`${URL}products/stocknull/${idUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    return data;
                }
                return [];
            })
            .catch((error) => {
                return [];
            });
        const productStock = fetch(`${URL}products/stockgtzero/${idUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    return data;
                }
                return [];
            })
            .catch((error) => {
                return [];
            });
        return Promise.all([productNullStock, productStock]);
    } catch (error) {
        return [];
    }
}

type SalesProductResponse = {
    products: Item[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        categoryIds: number[];
    };
};

const normalizeProductsPayload = (data: any): Item[] => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.products)) {
        return data.products;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};

const normalizePaginationPayload = (data: any, fallbackPage: number): SalesProductResponse["pagination"] => {
    const pagination = data?.pagination ?? {};

    const parsedCategoryIds = Array.isArray(pagination?.categoryIds)
        ? pagination.categoryIds
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isFinite(id))
        : [];

    return {
        page: Number(pagination?.page) || fallbackPage,
        pageSize: Math.max(1, Number(pagination?.pageSize) || 20),
        total: Math.max(0, Number(pagination?.total) || 0),
        totalPages: Math.max(1, Number(pagination?.totalPages) || 1),
        hasNext: Boolean(pagination?.hasNext),
        hasPrev: Boolean(pagination?.hasPrev),
        categoryIds: parsedCategoryIds,
    };
};

export const getProductsAvailableByBusiness = async (
    businessId: number,
    _token: string,
    limit: string,
    page: number
): Promise<SalesProductResponse> => {
    try {
        const requestUrl = `${URL}products/stock/availablegtzero/${businessId}?page=${page}`;
        const requestBody = { Limit: limit };

        logSalesEndpointRequest(
            "getProductsAvailableByBusiness",
            requestUrl,
            "POST",
            requestBody
        );

        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await parseJsonSafely(response);
        logSalesEndpointResponse("getProductsAvailableByBusiness", response, data);
        const products = normalizeProductsPayload(data);

        return {
            products,
            pagination: normalizePaginationPayload(data, page),
        };
    } catch {
        return {
            products: [],
            pagination: {
                page,
                pageSize: 20,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
                categoryIds: [],
            },
        };
    }
};

export const getProductsByCategory = async (
    categoryId: number,
    _token: string,
    limit: string,
    page: number
): Promise<SalesProductResponse> => {
    try {
        const requestUrl = `${URL}products/category/${categoryId}?limit=${encodeURIComponent(limit)}&page=${page}`;

        logSalesEndpointRequest(
            "getProductsByCategory",
            requestUrl,
            "GET"
        );

        const response = await fetch(requestUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await parseJsonSafely(response);
        logSalesEndpointResponse("getProductsByCategory", response, data);
        const products = normalizeProductsPayload(data);

        return {
            products,
            pagination: normalizePaginationPayload(data, page),
        };
    } catch {
        return {
            products: [],
            pagination: {
                page,
                pageSize: 20,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
                categoryIds: [],
            },
        };
    }
};

export const insertProduct = async (
    product: Item,
    token: string,
    variants?: Variant[],
    extras?: Array<{ Description: string; Type: "COLOR" | "TALLA" }>
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
                Variants: variants && variants.length ? variants : null,
                Extras: extras && extras.length ? extras : null,
            })
        });

        const data = await parseJsonSafely(response);

        if (!response.ok) {
            return {
                success: false,
                message: data?.message || "No se pudo guardar el producto.",
                error: data?.error?.message || data?.error || data?.message || "Error desconocido al guardar el producto.",
            };
        }

        return {
            success: true,
            message: data?.message || "Producto guardado correctamente.",
        };
    } catch (e) {
        return {
            success: false,
            message: "No se pudo guardar el producto.",
            error: e instanceof Error ? e.message : "Error inesperado al guardar el producto.",
        };
    }
}

export const updateCategory = async (category: Category, token: string) => {
    try {
        const response = await fetch(`${URL}categories/${category.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify(category)
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

export const getBusinessInformation = async (businessId: string, token: string) => {
    try {
        const response = await fetch(`${URL}business/${businessId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;


    } catch (e) {
        console.log(e);
    }
}
export const updateAdvice = async (idEmployee: string, token: string): Promise<any> => {
    try {
        const response = await fetch(`${URL}advice/${idEmployee}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ advice: 1 }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error al actualizar el consejo:", error);
        throw error;
    }
}


export const getCategory = async (id: number, token: string) => {
    try {
        const response = await fetch(`${URL}categories/${id}`, {
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

export const deleteCategory = async (id: number, token: string) => {
    try {
        const response = await fetch(`${URL}categories/${id}`, {
            method: 'DELETE',
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

export const getTaxes = async(idBusiness: string, token: string) => {
    try {
        const response = await fetch(`${URL}taxes/business/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;


    } catch (e) {
        console.log(e);
    }
}
export const updateNotification = async (idEmployee: string, token: string) => {
    try {
        const response = await fetch(`${URL}employees/${idEmployee}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Advice: 'true',
            }
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

export const submitAnswers = async (answers: any[]): Promise<any> => {
    try {
      const response = await fetch(`${URL}answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers), // Asegúrate de que answers sea un arreglo de objetos válidos
      });
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al guardar las respuestas:', error);
      throw error;
    }
  };
