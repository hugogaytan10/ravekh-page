import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../../../../pos/shared/config/posEnv";
import { LoyaltyCustomerApi } from "../api/LoyaltyCustomerApi";
import { LoyaltyCustomerPage } from "../pages/LoyaltyCustomerPage";
import { LoyaltyCustomerService } from "../services/LoyaltyCustomerService";

export const createLoyaltyCustomerPortal = () => {
  const httpClient = new FetchHttpClient(getPosApiBaseUrl());
  const repository = new LoyaltyCustomerApi(httpClient);
  const service = new LoyaltyCustomerService(repository);
  return new LoyaltyCustomerPage(service);
};
