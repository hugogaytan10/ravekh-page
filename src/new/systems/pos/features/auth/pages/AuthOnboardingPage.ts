import { LoginCredentials, SignUpPayload } from "../model/AuthSession";
import { AuthOnboardingService } from "../services/AuthOnboardingService";

type AuthSessionViewModel = {
  employeeId: number;
  businessId: number;
  employeeName: string;
  email: string;
  token: string;
};

export class AuthOnboardingPage {
  constructor(private readonly authOnboardingService: AuthOnboardingService) {}

  async signIn(credentials: LoginCredentials): Promise<AuthSessionViewModel> {
    const session = await this.authOnboardingService.signIn(credentials);
    return this.toViewModel(session);
  }

  async signUp(payload: SignUpPayload): Promise<AuthSessionViewModel> {
    const session = await this.authOnboardingService.registerAndSignIn(payload);
    return this.toViewModel(session);
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
}
