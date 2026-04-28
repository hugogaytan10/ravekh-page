import { Navigate, Route } from "react-router-dom";
import { POS_V2_LEGACY_PATHS, POS_V2_PATHS } from "./PosV2Paths";

const POS_ALIASES: Array<{ from: string; to: string }> = [
  { from: POS_V2_PATHS.posRoot, to: POS_V2_PATHS.login },
  { from: POS_V2_PATHS.posLoginAlias, to: POS_V2_PATHS.login },
  { from: POS_V2_PATHS.posSalesAlias, to: POS_V2_PATHS.sales },
  { from: POS_V2_PATHS.posProductsAlias, to: POS_V2_PATHS.products },
  { from: POS_V2_PATHS.posFinancesAlias, to: POS_V2_PATHS.finances },
  { from: POS_V2_PATHS.posReportsAlias, to: POS_V2_PATHS.reports },
  { from: POS_V2_PATHS.posMoreAlias, to: POS_V2_PATHS.more },
  { from: POS_V2_PATHS.posFacturationAlias, to: POS_V2_PATHS.facturation },
  { from: POS_V2_PATHS.posTablesAlias, to: POS_V2_PATHS.tableZones },
  { from: POS_V2_PATHS.posPrintersAlias, to: POS_V2_PATHS.printers },
  { from: POS_V2_PATHS.posHealthAlias, to: POS_V2_PATHS.health },
  { from: POS_V2_PATHS.posInventoryAlias, to: POS_V2_PATHS.inventory },
  { from: POS_V2_PATHS.posCashClosingAlias, to: POS_V2_PATHS.cashClosing },
  { from: POS_V2_PATHS.posLoyaltyAlias, to: POS_V2_PATHS.loyalty },
  { from: POS_V2_PATHS.posCouponsAlias, to: POS_V2_PATHS.coupons },
  { from: POS_V2_PATHS.posVisitsAlias, to: POS_V2_PATHS.visits },
  { from: POS_V2_PATHS.posCatalogAlias, to: POS_V2_PATHS.catalog },
  { from: POS_V2_PATHS.posOnlineStoreAlias, to: POS_V2_PATHS.onlineStore },
  { from: POS_V2_LEGACY_PATHS.login, to: POS_V2_PATHS.login },
  { from: POS_V2_LEGACY_PATHS.sales, to: POS_V2_PATHS.sales },
  { from: POS_V2_LEGACY_PATHS.products, to: POS_V2_PATHS.products },
  { from: POS_V2_LEGACY_PATHS.finances, to: POS_V2_PATHS.finances },
  { from: POS_V2_LEGACY_PATHS.reports, to: POS_V2_PATHS.reports },
  { from: POS_V2_LEGACY_PATHS.more, to: POS_V2_PATHS.more },
  { from: POS_V2_LEGACY_PATHS.facturation, to: POS_V2_PATHS.facturation },
  { from: POS_V2_LEGACY_PATHS.tableZones, to: POS_V2_PATHS.tableZones },
  { from: POS_V2_LEGACY_PATHS.printers, to: POS_V2_PATHS.printers },
  { from: POS_V2_LEGACY_PATHS.health, to: POS_V2_PATHS.health },
  { from: POS_V2_LEGACY_PATHS.inventory, to: POS_V2_PATHS.inventory },
  { from: POS_V2_LEGACY_PATHS.cashClosing, to: POS_V2_PATHS.cashClosing },
  { from: POS_V2_LEGACY_PATHS.loyalty, to: POS_V2_PATHS.loyalty },
  { from: POS_V2_LEGACY_PATHS.coupons, to: POS_V2_PATHS.coupons },
  { from: POS_V2_LEGACY_PATHS.visits, to: POS_V2_PATHS.visits },
  { from: POS_V2_LEGACY_PATHS.catalog, to: POS_V2_PATHS.catalog },
  { from: POS_V2_LEGACY_PATHS.customers, to: POS_V2_PATHS.customers },
  { from: POS_V2_LEGACY_PATHS.employees, to: POS_V2_PATHS.employees },
  { from: POS_V2_LEGACY_PATHS.onlineStore, to: POS_V2_PATHS.onlineStore },
  { from: POS_V2_LEGACY_PATHS.posRoot, to: POS_V2_PATHS.login },
  { from: POS_V2_LEGACY_PATHS.posLoginAlias, to: POS_V2_PATHS.login },
  { from: POS_V2_LEGACY_PATHS.posSalesAlias, to: POS_V2_PATHS.sales },
  { from: POS_V2_LEGACY_PATHS.posProductsAlias, to: POS_V2_PATHS.products },
  { from: POS_V2_LEGACY_PATHS.posFinancesAlias, to: POS_V2_PATHS.finances },
  { from: POS_V2_LEGACY_PATHS.posReportsAlias, to: POS_V2_PATHS.reports },
  { from: POS_V2_LEGACY_PATHS.posMoreAlias, to: POS_V2_PATHS.more },
  { from: POS_V2_LEGACY_PATHS.posFacturationAlias, to: POS_V2_PATHS.facturation },
  { from: POS_V2_LEGACY_PATHS.posTablesAlias, to: POS_V2_PATHS.tableZones },
  { from: POS_V2_LEGACY_PATHS.posPrintersAlias, to: POS_V2_PATHS.printers },
  { from: POS_V2_LEGACY_PATHS.posHealthAlias, to: POS_V2_PATHS.health },
  { from: POS_V2_LEGACY_PATHS.posInventoryAlias, to: POS_V2_PATHS.inventory },
  { from: POS_V2_LEGACY_PATHS.posCashClosingAlias, to: POS_V2_PATHS.cashClosing },
  { from: POS_V2_LEGACY_PATHS.posLoyaltyAlias, to: POS_V2_PATHS.loyalty },
  { from: POS_V2_LEGACY_PATHS.posCouponsAlias, to: POS_V2_PATHS.coupons },
  { from: POS_V2_LEGACY_PATHS.posVisitsAlias, to: POS_V2_PATHS.visits },
  { from: POS_V2_LEGACY_PATHS.posCatalogAlias, to: POS_V2_PATHS.catalog },
  { from: POS_V2_LEGACY_PATHS.posOnlineStoreAlias, to: POS_V2_PATHS.onlineStore },
];

export const POS_V2_ALIAS_ROUTES = (
  <>
    {POS_ALIASES.map((alias) => (
      <Route key={alias.from} path={alias.from} element={<Navigate to={alias.to} replace />} />
    ))}
  </>
);
