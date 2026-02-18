import { URL } from "../../Const/Const";
import { Store } from "../../Model/Store";

export const deleteAccount = async (token: string, idUser: number) => {
    try {
        const response = await fetch(`${URL}employee/${idUser}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json', 
                token: token
            }
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const message = data?.message || "No se pudo eliminar la cuenta.";
            throw new Error(message);
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

export const updateBusiness = async (token: string, businessId: string, business: any) => {
    try {

        const response = await fetch(`${URL}business/${businessId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify(business)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const updateTables = async (token: string, businessId: string, tables: boolean) => {
    try {
        const response = await fetch(`${URL}table_zones/active/${businessId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({active: tables})
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const getTables = async (token: string, idBusiness: string) => {
    try{
        const response = await fetch(`${URL}table_zones/business/${idBusiness}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(e){
        return [];
    }
}

export const updateBusinessWithTaxId = async (newTaxId: number, businessId: number, token: string) => {
    try {
      const response = await fetch(`${URL}business/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
        body: JSON.stringify({ Taxes_Id: newTaxId }),
      });
      if (!response.ok) {
        throw new Error('No se pudo actualizar el Taxes_Id en el negocio');
      }
    } catch (error) {
      console.error('Error al actualizar el Taxes_Id en el negocio:', error);
    }
  };
