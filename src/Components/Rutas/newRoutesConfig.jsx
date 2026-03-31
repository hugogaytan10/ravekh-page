import { POS_V2_PRIMARY_ROUTES } from "../../new/systems/pos/routing/primaryRoutes";
import { LEGACY_PRIMARY_ROUTES } from "./legacyRoutesConfig";

export const NEW_PRIMARY_ROUTES = [...POS_V2_PRIMARY_ROUTES, ...LEGACY_PRIMARY_ROUTES];
