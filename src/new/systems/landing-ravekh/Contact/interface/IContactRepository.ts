import { Contact, FormData } from "../model/Contact";

export interface IContactRepository {
  senInfo(bodyForm: FormData): Promise<Contact>;
}
