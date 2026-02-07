import { URL } from "../../Components/CatalogoWeb/Const/Const";
import type { Visits } from "../models/coupon";

const getVisitsByUserId = async (userId: number): Promise<Visits[]> => {
  const endpoint = `${URL}visits/user/${userId}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las visitas del usuario.");
  }
  return response.json() as Promise<Visits[]>;
}

export {
    getVisitsByUserId,
}
