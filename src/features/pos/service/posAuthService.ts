import { POS_API_BASE_URL } from "../../../shared/config/api";
import type { Store, User } from "../model/posAuthModels";

export const loginToServer = async (email: string, password: string | null) => {
  try {
    const response = await fetch(`${POS_API_BASE_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email: email, Password: password }),
    });

    return response.json();
  } catch (error) {
    console.log(error);
    return { message: "Ocurrió un error al iniciar sesión." };
  }
};

export const signUpToServer = async (
  businessInfo: Store,
  user: User,
  deviceToken: string,
) => {
  try {
    const response = await fetch(`${POS_API_BASE_URL}business`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Business: {
          Name: businessInfo.Name,
          Address: businessInfo.Address,
          PhoneNumber: businessInfo.PhoneNumber,
          Logo: businessInfo.Logo,
          Color: businessInfo.Color,
          References: businessInfo.References,
        },
        Employee: {
          Name: user.Name,
          Password: user.Password,
          Email: user.Email,
        },
        Tables: true,
        deviceToken,
      }),
    });

    return response.json();
  } catch (error) {
    return { error: `Error al insertar el usuario ${error}` };
  }
};
