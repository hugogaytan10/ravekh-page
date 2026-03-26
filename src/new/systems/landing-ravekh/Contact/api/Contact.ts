/// <reference types="vite/client" />

import { FetchHttpClient } from "../../../../core/api/FetchHttpClient";
import { Contact, FormData } from "../model/Contact";
import { IContactRepository } from "../interface/IContactRepository";

export class ContactApi implements IContactRepository {
  private readonly httpClient: FetchHttpClient;

  constructor(baseUrl = ((import.meta.env as Record<string, string | undefined>).VITE_API_URL || "")) {
    this.httpClient = new FetchHttpClient(baseUrl);
  }

  async senInfo(bodyForm: FormData): Promise<Contact> {
    const response = await this.httpClient.request<FormData>({
      method: "POST",
      path: "contacto/ravekhPage",
      body: {
        nombre: bodyForm.nombre,
        email: bodyForm.email,
        mensaje: bodyForm.mensaje,
        telefono: bodyForm.telefono,
      },
    });

    return new Contact(
      response.email,
      response.nombre,
      response.mensaje,
      response.telefono,
    );
  }
}
