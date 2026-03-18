import { AuthSession, LoginCredentials, SignUpPayload } from "../model/AuthSession";

export interface IAuthOnboardingRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  signUp(payload: SignUpPayload): Promise<AuthSession>;
}
