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
export interface IAuthOnboardingRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  closeOtherSessions(payload: LoginSessionLimitPayload): Promise<void>;
  signUp(payload: SignUpPayload): Promise<AuthSession>;
  getQuestions(): Promise<SecurityQuestion[]>;
  getSecurityQuestionStatus(employeeId: number): Promise<SecurityQuestionStatus>;
  comparePasswordAnswers(
    payload: CompareSecurityQuestionPayload,
    user: string,
  ): Promise<CompareSecurityQuestionResult>;
  resetPassword(payload: ResetPasswordPayload, user: string): Promise<number>;
}
