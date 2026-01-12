import {URL} from '../Const/Const'
import { Employee } from '../Model/Employees';
import { Store } from '../Model/Store';
import { User } from '../Model/User';

export const loginToServer = async (email: string, password: any) => {
    try {
        const response = await fetch(`${URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({Email: email, Password: password})
        })
        return response.json();
    } catch (error) {
        return {message: "Ocurrió un error al iniciar sesión."}
    }

}

export const signUpToServer = async (businesInfo: Store, user: User, deviceToken: string) => {
    try {
        const url = `${URL}business`;
        //insertar tablas por ahora
        const bodyPetition = {
            Business: {
                Name: businesInfo.Name,
                Address: businesInfo.Address,
                PhoneNumber: businesInfo.PhoneNumber,
                Logo: businesInfo.Logo,
                Color: businesInfo.Color,
                References: businesInfo.References,
            },
            Employee: {
                Name: user.Name,
                Password: user.Password,
                Email: user.Email,
            },
            Tables: true,
            deviceToken: deviceToken,
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPetition),
        });
        const data = await response.json();
        //retornamos la data que nos devuelva el servidor
        console.log(data);
        return data;

    } catch (e) {
        return { error: 'Error al insertar el usuario ' + e };
    }
}