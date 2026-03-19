import { UpsertSalesTaxDto } from "../model/SalesTax";
import { SalesTaxService } from "../services/SalesTaxService";

type SalesTaxViewModel = {
  enabled: boolean;
  taxId: number | null;
  description: string;
  value: number;
  isPercent: boolean;
  canBeRemovedAtSale: boolean;
};

export class SalesTaxSettingsPage {
  constructor(private readonly service: SalesTaxService) {}

  async getSalesTaxSettings(businessId: number, token: string): Promise<SalesTaxViewModel> {
    const tax = await this.service.getSalesTax(businessId, token);

    if (!tax) {
      return {
        enabled: false,
        taxId: null,
        description: "",
        value: 0,
        isPercent: true,
        canBeRemovedAtSale: false,
      };
    }

    return {
      enabled: true,
      taxId: tax.id,
      description: tax.description,
      value: tax.value,
      isPercent: tax.isPercent,
      canBeRemovedAtSale: tax.canBeRemovedAtSale,
    };
  }

  async saveSalesTax(token: string, payload: UpsertSalesTaxDto): Promise<void> {
    await this.service.saveSalesTax(token, payload);
  }

  async disableSalesTax(businessId: number, token: string): Promise<void> {
    await this.service.disableSalesTax(businessId, token);
  }
}
