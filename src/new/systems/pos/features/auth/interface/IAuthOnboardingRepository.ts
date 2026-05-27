import {
  AuthSession,
  CompareSecurityQuestionPayload,
  CompareSecurityQuestionResult,
  LoginCredentials,
  ResetPasswordPayload,
  SecurityQuestion,
  SignUpPayload,
} from "../model/AuthSession";

export interface IAuthOnboardingRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  signUp(payload: SignUpPayload): Promise<AuthSession>;
  getQuestions(): Promise<SecurityQuestion[]>;
  comparePasswordAnswers(
    payload: CompareSecurityQuestionPayload,
    user: string,
  ): Promise<CompareSecurityQuestionResult>;
  resetPassword(payload: ResetPasswordPayload, user: string): Promise<number>;
}
