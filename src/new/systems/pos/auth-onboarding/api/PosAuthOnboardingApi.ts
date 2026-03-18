import { HttpClient } from "../../../../core/api/HttpClient";
import { IAuthOnboardingRepository } from "../interface/IAuthOnboardingRepository";
import { AuthSession, LoginCredentials, SignUpPayload } from "../model/AuthSession";

type LoginResponse = {
  Id?: number;
  Business_Id?: number;
  Name?: string;
  Email?: string;
  Token?: string;
  message?: string;
};

type SignUpResponse = {
  Employee?: {
    Id?: number;
    Name?: string;
    Email?: string;
  };
  Business?: {
    Id?: number;
  };
  Token?: string;
  message?: string;
};

export class PosAuthOnboardingApi implements IAuthOnboardingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await this.httpClient.request<LoginResponse>({
      method: "POST",
      path: "login",
      body: {
        Email: credentials.email,
        Password: credentials.password,
      },
    });

    if (response.message) {
      throw new Error(response.message);
    }

    return new AuthSession(
      response.Id ?? 0,
      response.Business_Id ?? 0,
      response.Name ?? "",
      response.Email ?? credentials.email,
      response.Token ?? "",
    );
  }

  async signUp(payload: SignUpPayload): Promise<AuthSession> {
    const response = await this.httpClient.request<SignUpResponse>({
      method: "POST",
      path: "business",
      body: {
        Business: {
          Name: payload.business.name,
          Address: payload.business.address,
          PhoneNumber: payload.business.phoneNumber,
          Logo: payload.business.logo,
          Color: payload.business.color,
          References: payload.business.references,
        },
        Employee: {
          Name: payload.employee.name,
          Password: payload.employee.password,
          Email: payload.employee.email,
        },
        Tables: payload.createTables ?? true,
        deviceToken: payload.deviceToken,
      },
    });

    if (response.message) {
      throw new Error(response.message);
    }

    return new AuthSession(
      response.Employee?.Id ?? 0,
      response.Business?.Id ?? 0,
      response.Employee?.Name ?? payload.employee.name,
      response.Employee?.Email ?? payload.employee.email,
      response.Token ?? "",
    );
  }
}
