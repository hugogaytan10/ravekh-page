export class ComparisonMetric {
  constructor(
    public readonly current: number,
    public readonly previous: number,
  ) {}

  get delta(): number {
    return this.current - this.previous;
  }

  get trend(): "UP" | "DOWN" | "FLAT" {
    if (this.delta > 0) return "UP";
    if (this.delta < 0) return "DOWN";
    return "FLAT";
  }
}

export class TopSellingItem {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly quantity: number,
  ) {}
}

export class DashboardSnapshot {
  constructor(
    public readonly averagePurchase: ComparisonMetric,
    public readonly income: ComparisonMetric,
    public readonly balance: ComparisonMetric,
    public readonly topProducts: TopSellingItem[],
    public readonly topCategories: TopSellingItem[],
    public readonly newCustomersToday: number,
  ) {}
}
