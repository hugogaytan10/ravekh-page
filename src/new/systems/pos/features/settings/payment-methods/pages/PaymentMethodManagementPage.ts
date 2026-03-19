import { PaymentMethodService } from "../services/PaymentMethodService";
import { PaymentMethodSettingsSnapshot, PaymentMethodType } from "../model/PaymentMethod";

export interface PaymentMethodOptionVm {
  type: PaymentMethodType;
  enabled: boolean;
  locked: boolean;
  label: string;
}

export interface PaymentMethodManagementVm {
  businessId: number;
  globallyEnabled: boolean;
  options: PaymentMethodOptionVm[];
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: "Cash",
  card: "Card payment",
  online: "Online payment",
};

export class PaymentMethodManagementPage {
  constructor(private readonly service: PaymentMethodService) {}

  async getViewModel(businessId: number, token: string): Promise<PaymentMethodManagementVm> {
    const snapshot = await this.service.getSettings(businessId, token);
    return this.toViewModel(snapshot);
  }

  async toggleGlobal(businessId: number, enabled: boolean, token: string): Promise<PaymentMethodManagementVm> {
    const snapshot = await this.service.updateGlobalToggle(businessId, enabled, token);
    return this.toViewModel(snapshot);
  }

  async toggleMethod(
    businessId: number,
    type: PaymentMethodType,
    enabled: boolean,
    token: string,
  ): Promise<PaymentMethodManagementVm> {
    const snapshot = await this.service.updateMethod(businessId, type, enabled, token);
    return this.toViewModel(snapshot);
  }

  private toViewModel(snapshot: PaymentMethodSettingsSnapshot): PaymentMethodManagementVm {
    return {
      businessId: snapshot.businessId,
      globallyEnabled: snapshot.globallyEnabled,
      options: snapshot.methods.map((method) => ({
        type: method.type,
        enabled: method.enabled,
        locked: !snapshot.globallyEnabled && method.type !== "cash",
        label: PAYMENT_METHOD_LABELS[method.type],
      })),
    };
  }
}
