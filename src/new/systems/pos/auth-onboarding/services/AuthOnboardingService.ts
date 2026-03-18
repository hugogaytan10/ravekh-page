import { IAuthOnboardingRepository } from "../interface/IAuthOnboardingRepository";
import { AuthSession, LoginCredentials, SignUpPayload } from "../model/AuthSession";

export class AuthOnboardingService {
  constructor(private readonly repository: IAuthOnboardingRepository) {}

  async signIn(credentials: LoginCredentials): Promise<AuthSession> {
    this.ensureCredentials(credentials);

    const session = await this.repository.login(credentials);
    if (!session.isValid()) {
      throw new Error("Invalid login session returned by backend.");
    }

    return session;
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
}
