export interface PosLoginErrorResponse {
  message: string;
}

export interface PosSessionCredentials {
  email: string;
  password: string;
}

export const POS_USER_STORAGE_KEY = "user";
