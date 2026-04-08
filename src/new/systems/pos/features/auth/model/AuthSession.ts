export class AuthSession {
  constructor(
    public readonly employeeId: number,
    public readonly businessId: number,
    public readonly employeeName: string,
    public readonly email: string,
    public readonly token: string,
  ) {}

  isValid(): boolean {
    return Boolean(this.token && this.email);
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface BusinessRegistration {
  name: string;
  address: string;
  phoneNumber: string;
  logo: string;
  color: string;
  references: string;
}

export interface EmployeeRegistration {
  name: string;
  email: string;
  password: string;
}

export interface SignUpPayload {
  business: BusinessRegistration;
  employee: EmployeeRegistration;
  deviceToken: string;
  createTables?: boolean;
}
