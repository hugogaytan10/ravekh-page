import { URL } from "../../Const/Const";
import { ICashClosing } from "../../Model/CashClosing";
export const getEmployeesByBusiness = async (token: string, businessId: string) => {
    try{
        const response = await fetch(`${URL}employee/business/${businessId}`, {
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

 export const getCutsByEmployee = async (token: string, employeeId: string) => {
    try{
        const response = await fetch(`${URL}cashclosing/employee/${employeeId}`, {
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

 export const insertCut = async (token: string, cut: ICashClosing) => {
    try{
        const response = await fetch(`${URL}cashclosing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify(cut)
        });
        const data = await response.json();
        return data;
    }catch(e){
        return [];
    }
 }

 export const getCurrentCut = async (token: string, employeeId: string) => {
    try{
        const response = await fetch(`${URL}cashclosing/total/${employeeId}`, {
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