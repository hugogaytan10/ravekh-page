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

export const insertProduct = async (product: Item, token: string, Variants?: Variant[]) => {
    try {
        const response = await fetch(`${URL}products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ 
                Product: product,
                Variants: Variants && Variants.length ? Variants : null
            })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
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

export const deleteVariant = async ( variantId: number, token: string) => {
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