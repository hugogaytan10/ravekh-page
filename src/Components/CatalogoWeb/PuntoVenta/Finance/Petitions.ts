import { URL } from "../Const/Const";
import { IExpenses } from "../Model/Expense";
import { IIncome } from "../Model/Income";


export const getIncome = async (idBusiness: string, token: string) => {
    try{
        const response = await fetch(`${URL}income/month/${idBusiness}`, {
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });

        const data = await response.json();
        return data;
    }catch(e){
        return false;
    }
}

export const getExpenses = async (idBusiness: string, token: string) => {
    try{
       
        const response = await fetch(`${URL}expenses/month/${idBusiness}`, {
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(e){
        return false;
    }
}
export const getIncomeToday = async (idBusiness: string, token: string) => {
    try{
        const response = await fetch(`${URL}income/today/${idBusiness}`, {
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();

        return data;
    }catch(e){
        return false;
    }
}
export const getIncomeByMonth = async (idBusiness: string, token: string, month: number) => {
    try{
        month = month + 1;
        const response = await fetch(`${URL}income/bymonth/${idBusiness}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ month: month })
        });
        const data = await response.json();
        return data;
    }catch(e){
        return false;
    }
}

export const getExpensesByMonth = async (idBusiness: string, token: string, month: number) => {
    try{
        month = month + 1;
        const response = await fetch(`${URL}expenses/bymonth/${idBusiness}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({ month: month })
        });
        const data = await response.json();
        return data;
    }catch(e){
        return false;
    }
}
export const getExpensesToday = async (idBusiness: string, token: string) => {
    try{
        const response = await fetch(`${URL}expenses/today/${idBusiness}`, {
            headers: {
                'Content-Type': 'application/json',
                token: token
            }
        });
        const data = await response.json();
        return data;
    }catch(e){
        return false;
    }
}

export const insertIncome = async (income: IIncome, token: string) => {
    try{
        const response = await fetch(`${URL}income`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({
                Business_Id: income.Business_Id,
                Name: income.Name.toLocaleUpperCase(),
                Amount: income.Amount,
            })
        });
        const data = await response.json();
        console.log("Ingreso");
        console.log(data);
        return data;
    }catch(e){
        return false;
    }
}

export const insertExpenses = async (expenses: IExpenses, token: string) => {
    try{
        const response = await fetch(`${URL}expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            body: JSON.stringify({
                Business_Id: expenses.Business_Id,
                Name: expenses.Name.toLocaleUpperCase(),
                Amount: expenses.Amount,
            })
        });
        const data = await response.json();
        console.log("Egreso");
        console.log(data);
        return data;
    }catch(e){
        return false;
    }

}
