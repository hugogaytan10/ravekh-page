export class HealthStatus {
  constructor(
    public readonly status: string,
    public readonly checkedAt: string,
  ) {}

  isHealthy(): boolean {
    return this.status.toLowerCase() === "ok";
  }
}
