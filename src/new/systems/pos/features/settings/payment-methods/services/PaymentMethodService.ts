import { IPaymentMethodRepository } from "../interface/IPaymentMethodRepository";
import {
  PaymentMethodSettings,
  PaymentMethodSettingsSnapshot,
  PaymentMethodType,
} from "../model/PaymentMethod";

export class PaymentMethodService {
  constructor(private readonly repository: IPaymentMethodRepository) {}

  async getSettings(businessId: number, token: string): Promise<PaymentMethodSettingsSnapshot> {
    const settings = await this.repository.getByBusiness(businessId, token);
    return settings.toSnapshot();
  }

  async updateGlobalToggle(businessId: number, enabled: boolean, token: string): Promise<PaymentMethodSettingsSnapshot> {
    const settings = await this.repository.getByBusiness(businessId, token);
    settings.enableAll(enabled);
    await this.repository.save(settings, token);

    return settings.toSnapshot();
  }

  async updateMethod(
    businessId: number,
    methodType: PaymentMethodType,
    enabled: boolean,
    token: string,
  ): Promise<PaymentMethodSettingsSnapshot> {
    const settings = await this.repository.getByBusiness(businessId, token);
    settings.updateMethod(methodType, enabled);
    await this.repository.save(settings, token);

    return settings.toSnapshot();
  }

  createDefaultSettings(businessId: number): PaymentMethodSettings {
    return PaymentMethodSettings.createDefault(businessId);
  }
}
