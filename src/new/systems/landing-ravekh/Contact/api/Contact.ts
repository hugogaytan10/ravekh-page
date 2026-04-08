/// <reference types="vite/client" />

import { FetchHttpClient } from "../../../../core/api/FetchHttpClient";
import { Contact, FormData } from "../model/Contact";
import { IContactRepository } from "../interface/IContactRepository";

type ContactApiResponse = Partial<FormData> | string | null;

const isFormDataPayload = (value: ContactApiResponse): value is Partial<FormData> =>
  Boolean(value) && typeof value === "object";

export class ContactApi implements IContactRepository {
  private readonly httpClient: FetchHttpClient;

  constructor(baseUrl = ((import.meta.env as Record<string, string | undefined>).VITE_API_URL || "")) {
    this.httpClient = new FetchHttpClient(baseUrl);
  }

  async senInfo(bodyForm: FormData): Promise<Contact> {
    const response = await this.httpClient.request<ContactApiResponse>({
      method: "POST",
      path: "contacto/ravekhPage",
      body: {
        nombre: bodyForm.nombre,
        email: bodyForm.email,
        mensaje: bodyForm.mensaje,
        telefono: bodyForm.telefono,
      },
    });

    if (isFormDataPayload(response)) {
      return new Contact(
        response.email ?? bodyForm.email,
        response.nombre ?? bodyForm.nombre,
        response.mensaje ?? bodyForm.mensaje,
        response.telefono ?? bodyForm.telefono,
      );
    }

    // Algunos endpoints devuelven solo un string (ej: "Mensaje enviado").
    // En ese caso confirmamos éxito con los datos enviados por el formulario.
    return new Contact(bodyForm.email, bodyForm.nombre, bodyForm.mensaje, bodyForm.telefono);
  }
}
