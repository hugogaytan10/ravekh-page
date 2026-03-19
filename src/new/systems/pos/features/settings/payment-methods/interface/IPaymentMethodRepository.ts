import { PaymentMethodSettings } from "../model/PaymentMethod";

export interface IPaymentMethodRepository {
  getByBusiness(businessId: number, token: string): Promise<PaymentMethodSettings>;
  save(settings: PaymentMethodSettings, token: string): Promise<void>;
}
