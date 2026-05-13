import { HttpClient } from "../../../../core/api/HttpClient";
import { IAuthOnboardingRepository } from "../interface/IAuthOnboardingRepository";
import {
  AuthSession,
  CompareSecurityQuestionPayload,
  CompareSecurityQuestionResult,
  LoginCredentials,
  ResetPasswordPayload,
  SecurityQuestion,
  SignUpPayload,
} from "../model/AuthSession";

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
    Token?: string;
  };
  Business?: {
    Id?: number;
  };
  Token?: string;
  message?: string;
};

type SecurityQuestionResponse = {
  Id?: unknown;
  Question_Id?: unknown;
  Question?: string;
  Description?: string;
  Name?: string;
  Text?: string;
};

type QuestionsResponse =
  | SecurityQuestionResponse[]
  | { Questions?: SecurityQuestionResponse[]; questions?: SecurityQuestionResponse[] };


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
      response.Token ?? response.Employee?.Token ?? "",
    );
  }

  async getQuestions(): Promise<SecurityQuestion[]> {
    const response = await this.httpClient.request<QuestionsResponse>({
      method: "GET",
      path: "questions",
    });

    const questions = Array.isArray(response)
      ? response
      : response.Questions ?? response.questions ?? [];
    return questions
      .map((question) => this.toSecurityQuestion(question))
      .filter((question) => question.isUsable());
  }

  async comparePasswordAnswers(
    payload: CompareSecurityQuestionPayload,
    user: string,
  ): Promise<CompareSecurityQuestionResult> {
    return this.httpClient.request<CompareSecurityQuestionResult>({
      method: "POST",
      path: `comparepasswordanswers/${encodeURIComponent(user)}`,
      body: {
        Question_Id: payload.questionId,
        Answer: payload.answer,
        Password: payload.password,
      },
    });
  }

  async resetPassword(payload: ResetPasswordPayload, user: string): Promise<number> {
    const request = {
      method: "POST" as const,
      path: `resetpassword/${encodeURIComponent(user)}`,
      body: {
        Password: payload.password,
      },
    };

    if (this.httpClient.requestStatus) {
      return this.httpClient.requestStatus(request);
    }

    await this.httpClient.request<void>(request);
    return 200;
  }

  private toSecurityQuestion(question: SecurityQuestionResponse): SecurityQuestion {
    return new SecurityQuestion(
      question.Id ?? question.Question_Id,
      question.Question ?? question.Description ?? question.Name ?? question.Text ?? "",
    );
  }
}
