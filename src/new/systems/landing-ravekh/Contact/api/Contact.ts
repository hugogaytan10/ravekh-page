import {HttpClient} from "../../../../core/api/HttpClient";
import { Contact, FormData } from "../model/Contact";
import { IContactRepository } from "../interface/IContactRepository";


export class ContactApi implements IContactRepository {
  httpClient: HttpClient;
  constructor() {
    this.httpClient = new HttpClient();
  }

  async senInfo(bodyForm: FormData): Promise<Contact> {
    const response = await this.httpClient.request<Contact>({
      method: "POST",
      path: "contacto/sendinfo",
      body: JSON.stringify({
        nombre: bodyForm.nombre,
        apellido: bodyForm.apellido,
        email: bodyForm.email,
        mensaje: bodyForm.mensaje,
        lada: bodyForm.lada,
        telefono: bodyForm.telefono,
      }),
    });
    
    return response;
  }



}
