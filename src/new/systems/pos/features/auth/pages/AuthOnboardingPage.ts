import {
  CompareSecurityQuestionPayload,
  LoginCredentials,
  ResetPasswordPayload,
  SecurityQuestion,
  SecurityQuestionStatus,
  SignUpPayload,
} from "../model/AuthSession";
import { AuthOnboardingService } from "../services/AuthOnboardingService";

type AuthSessionViewModel = {
  employeeId: number;
  businessId: number;
  employeeName: string;
  email: string;
  token: string;
};

type SecurityQuestionViewModel = {
  id: unknown;
  text: string;
};

export class AuthOnboardingPage {
  constructor(private readonly authOnboardingService: AuthOnboardingService) {}

  async signIn(credentials: LoginCredentials): Promise<AuthSessionViewModel> {
    const session = await this.authOnboardingService.signIn(credentials);
    return this.toViewModel(session);
  }
  
  async getSecurityQuestionStatus(employeeId: number): Promise<SecurityQuestionStatus> {
  return this.authOnboardingService.getSecurityQuestionStatus(employeeId);
}

  async signUp(payload: SignUpPayload): Promise<AuthSessionViewModel> {
    const session = await this.authOnboardingService.registerAndSignIn(payload);
    return this.toViewModel(session);
  }

  async getPasswordRecoveryQuestions(): Promise<SecurityQuestionViewModel[]> {
    const questions = await this.authOnboardingService.getPasswordRecoveryQuestions();
    return questions.map((question) => this.toSecurityQuestionViewModel(question));
  }

  async comparePasswordRecoveryAnswers(
    payload: CompareSecurityQuestionPayload,
    user: string,
  ): Promise<Record<string, unknown>> {
    return this.authOnboardingService.comparePasswordRecoveryAnswers(payload, user);
  }

  async resetPassword(payload: ResetPasswordPayload, user: string): Promise<number> {
    return this.authOnboardingService.resetPassword(payload, user);
  }

  private toViewModel(session: {
    employeeId: number;
    businessId: number;
    employeeName: string;
    email: string;
    token: string;
  }): AuthSessionViewModel {
    return {
      employeeId: session.employeeId,
      businessId: session.businessId,
      employeeName: session.employeeName,
      email: session.email,
      token: session.token,
    };
  }

  private toSecurityQuestionViewModel(question: SecurityQuestion): SecurityQuestionViewModel {
    return {
      id: question.id,
      text: question.text,
    };
  }
}
