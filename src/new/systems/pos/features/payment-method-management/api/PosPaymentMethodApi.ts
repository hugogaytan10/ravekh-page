import { HttpClient } from "../../../../../core/api/HttpClient";
import { IPaymentMethodRepository } from "../interface/IPaymentMethodRepository";
import {
  PaymentMethodSettings,
  PaymentMethodSettingsSnapshot,
  PaymentMethodType,
} from "../model/PaymentMethod";

type PaymentMethodResponse = {
  Business_Id: number;
  IsEnabled: boolean;
  Methods: Array<{
    Type: PaymentMethodType;
    Enabled: boolean;
  }>;
};

export class PosPaymentMethodApi implements IPaymentMethodRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusiness(businessId: number, token: string): Promise<PaymentMethodSettings> {
    const response = await this.httpClient.request<PaymentMethodResponse | null>({
      method: "GET",
      path: `business/${businessId}/payment-methods`,
      token,
    });

    if (!response) {
      return PaymentMethodSettings.createDefault(businessId);
    }

    const settings = PaymentMethodSettings.createDefault(response.Business_Id);
    settings.enableAll(response.IsEnabled);

    for (const method of response.Methods) {
      settings.updateMethod(method.Type, method.Enabled);
    }

    return settings;
  }

  async save(settings: PaymentMethodSettings, token: string): Promise<void> {
    const payload = this.toApiPayload(settings.toSnapshot());

    await this.httpClient.request<void>({
      method: "PUT",
      path: `business/${settings.businessId}/payment-methods`,
      token,
      body: payload,
    });
  }

  private toApiPayload(snapshot: PaymentMethodSettingsSnapshot): PaymentMethodResponse {
    return {
      Business_Id: snapshot.businessId,
      IsEnabled: snapshot.globallyEnabled,
      Methods: snapshot.methods.map((method) => ({
        Type: method.type,
        Enabled: method.enabled,
      })),
    };
  }
}
