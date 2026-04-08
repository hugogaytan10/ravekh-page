export type PaymentMethodType = "cash" | "card" | "online";

export interface PaymentMethodSnapshot {
  type: PaymentMethodType;
  enabled: boolean;
}

export interface PaymentMethodSettingsSnapshot {
  businessId: number;
  globallyEnabled: boolean;
  methods: PaymentMethodSnapshot[];
}

export class PaymentMethod {
  constructor(
    public readonly type: PaymentMethodType,
    private enabled: boolean,
  ) {}

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  toSnapshot(): PaymentMethodSnapshot {
    return {
      type: this.type,
      enabled: this.enabled,
    };
  }
}

export class PaymentMethodSettings {
  constructor(
    public readonly businessId: number,
    private globallyEnabled: boolean,
    private readonly methods: Map<PaymentMethodType, PaymentMethod>,
  ) {}

  static createDefault(businessId: number): PaymentMethodSettings {
    return new PaymentMethodSettings(
      businessId,
      false,
      new Map<PaymentMethodType, PaymentMethod>([
        ["cash", new PaymentMethod("cash", true)],
        ["card", new PaymentMethod("card", false)],
        ["online", new PaymentMethod("online", false)],
      ]),
    );
  }

  isGloballyEnabled(): boolean {
    return this.globallyEnabled;
  }

  enableAll(enable: boolean): void {
    this.globallyEnabled = enable;

    if (!enable) {
      for (const method of this.methods.values()) {
        if (method.type !== "cash") {
          method.setEnabled(false);
        }
      }
    }
  }

  updateMethod(type: PaymentMethodType, enabled: boolean): void {
    if (!this.globallyEnabled && type !== "cash") {
      return;
    }

    const method = this.methods.get(type);
    if (!method) {
      return;
    }

    method.setEnabled(enabled);
  }

  toSnapshot(): PaymentMethodSettingsSnapshot {
    return {
      businessId: this.businessId,
      globallyEnabled: this.globallyEnabled,
      methods: [...this.methods.values()].map((method) => method.toSnapshot()),
    };
  }
}
