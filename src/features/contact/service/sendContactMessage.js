import { URL } from "../../../Components/CatalogoWeb/Const/Const";

export const sendContactMessage = async (payload) => {
  const response = await fetch(`${URL}contacto/sendinfo`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(response.statusText || "No se pudo enviar el formulario de contacto.");
  }

  return response.json();
};
