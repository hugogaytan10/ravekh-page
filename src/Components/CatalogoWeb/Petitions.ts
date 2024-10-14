import { URL } from "./Const/Const";
import { Order } from "../CatalogoWeb/Modelo/Order";
import {OrderDetails} from "../CatalogoWeb/Modelo/OrderDetails";
export const getProductsByBusiness = async (idBusiness: string) => {
    try{
        const response = await fetch(`${URL}products/showstore/${idBusiness}/1`)
        const data = await response.json();
        if(data){
            return data;
        }
        return [];
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

export const insertOrder = async (order: Order, orderDetails: OrderDetails[]) => {
    try {
        const response = await fetch(`${URL}ordersCatalog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({Order: order, OrderDetails: orderDetails}),
        });
        return response.json();
      } catch (e) {
        return e;
      }
}