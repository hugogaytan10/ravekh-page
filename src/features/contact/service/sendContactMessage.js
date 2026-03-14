import { API_BASE_URL } from "../../../shared/config/api";

export const sendContactMessage = async (payload) => {
  const response = await fetch(`${API_BASE_URL}contacto/ravekhPage`, {
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
