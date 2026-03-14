export interface PosLoginErrorResponse {
  message: string;
}

export interface PosSessionCredentials {
  email: string;
  password: string;
}

export const POS_USER_STORAGE_KEY = "user";

export type Store = {
  Id?: number;
  Taxes_Id?: number | null;
  Name: string;
  PhoneNumber: string | null;
  Address: string;
  References: string | null;
  Color: string;
  Logo: string | null;
  Plan?: string;
  Payment?: number;
  PaymentDate?: string;
};

export type User = {
  Id: number;
  Name: string;
  Email: string;
  Password: string;
  Role: string;
  Token: string;
  Business_Id: number;
  Pin: string;
  logo: string;
  MoneyTipe: string;
  Advice: string;
};
