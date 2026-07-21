import { IAuthOnboardingRepository } from "../interface/IAuthOnboardingRepository";
import {
  AuthSession,
  CompareSecurityQuestionPayload,
  CompareSecurityQuestionResult,
  LoginCredentials,
  ResetPasswordPayload,
  SecurityQuestion,
  SecurityQuestionStatus,
  SignUpPayload,
} from "../model/AuthSession";
import { LoginSessionLimitPayload } from "../model/LoginSessionLimit";

export class AuthOnboardingService {
  constructor(private readonly repository: IAuthOnboardingRepository) {}
async getSecurityQuestionStatus(employeeId: number): Promise<SecurityQuestionStatus> {
  if (!Number.isFinite(employeeId) || employeeId <= 0) {
    throw new Error("Employee ID inválido para validar preguntas de seguridad.");
  }

  return this.repository.getSecurityQuestionStatus(employeeId);
}
  async signIn(credentials: LoginCredentials): Promise<AuthSession> {
    this.ensureCredentials(credentials);

    const session = await this.repository.login(credentials);
    if (!session.isValid()) {
      throw new Error("Invalid login session returned by backend.");
    }

    return session;
  }

  async closeOtherSessions(payload: LoginSessionLimitPayload): Promise<void> {
    return this.repository.closeOtherSessions(payload);
  }

  async registerAndSignIn(payload: SignUpPayload): Promise<AuthSession> {
    this.ensureSignUpPayload(payload);

    const session = await this.repository.signUp({
      ...payload,
      createTables: payload.createTables ?? true,
    });
    if (!session.isValid()) {
      throw new Error("Invalid sign-up session returned by backend.");
    }

    return session;
  }

  async getPasswordRecoveryQuestions(): Promise<SecurityQuestion[]> {
    return this.repository.getQuestions();
  }

  async comparePasswordRecoveryAnswers(
    payload: CompareSecurityQuestionPayload,
    user: string,
  ): Promise<CompareSecurityQuestionResult> {
    this.ensureUser(user);
    this.ensureComparePayload(payload);

    return this.repository.comparePasswordAnswers(payload, user.trim());
  }

  async resetPassword(payload: ResetPasswordPayload, user: string): Promise<number> {
    this.ensureUser(user);
    this.ensureResetPasswordPayload(payload);

    return this.repository.resetPassword(payload, user.trim());
  }

  private ensureCredentials(credentials: LoginCredentials): void {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      throw new Error("Email and password are required.");
    }
  }

  private ensureSignUpPayload(payload: SignUpPayload): void {
    const { business, employee, deviceToken } = payload;
    const requiredValues = [
      business.name,
      business.address,
      business.phoneNumber,
      business.references,
      employee.name,
      employee.email,
      employee.password,
      deviceToken,
    ];

    if (requiredValues.some((value) => !value.trim())) {
      throw new Error("Business, employee, and device fields are required for sign-up.");
    }
  }

  private ensureUser(user: string): void {
    if (!user.trim()) {
      throw new Error("User is required for password recovery.");
    }
  }

  private ensureComparePayload(payload: CompareSecurityQuestionPayload): void {
    if (payload.questionId === undefined || payload.questionId === null) {
      throw new Error("Security question is required for password recovery.");
    }

    if (!payload.answer.trim() || !payload.password.trim()) {
      throw new Error("Answer and new password are required for password recovery.");
    }
  }

  private ensureResetPasswordPayload(payload: ResetPasswordPayload): void {
    if (!payload.password.trim()) {
      throw new Error("New password is required.");
    }
  }
}
