import { URL } from "./Const/Const";
export const getProductsByBusiness = async (idBusiness: string) => {
    try{
        const response = await fetch(`${URL}products/showstore/${idBusiness}/1`)
        const data = await response.json();
        if(data.length === 0){
            return [];
        }
        return data;
    }catch(error){
        console.log(error);
        return [];
    }
}
export const getProductById = async (idProduct: string) => {
    try{
        const response = await fetch(`${URL}products/${idProduct}`);
        const data = await response.json();
        return data;
    }catch(error){
        console.log(error);
        return null;
    }
}
