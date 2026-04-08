export class Contact {
  constructor(
    public readonly email: string,
    public readonly nombre: string,
    public readonly mensaje: string,
    public readonly telefono: string,
  ) {}

  isValid(): boolean {
    return Boolean(this.email);
  }
}

export interface FormData {
  email: string;
  nombre: string;
  mensaje: string;
  telefono: string;
}

