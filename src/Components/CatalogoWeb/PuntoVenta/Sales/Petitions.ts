import { URL } from "../Const/Const";
import { Category } from "../Model/Category";
import { Item } from "../Model/Item";

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

export const insertProduct = async (product: Item, token: string) => {
    try {
        const response = await fetch(`${URL}products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ Product: product, Variants: null })
        });
        const data = await response.json();
        return true;
    } catch (e) {
        return false;
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
