import { Navigate, Route } from "react-router-dom";
import { POS_V2_PATHS } from "./PosV2Paths";

const LEGACY_ALIASES: Array<{ from: string; to: string }> = [
  { from: POS_V2_PATHS.posRoot, to: POS_V2_PATHS.login },
  { from: POS_V2_PATHS.posLoginAlias, to: POS_V2_PATHS.login },
  { from: POS_V2_PATHS.posSalesAlias, to: POS_V2_PATHS.sales },
  { from: POS_V2_PATHS.posProductsAlias, to: POS_V2_PATHS.products },
  { from: POS_V2_PATHS.posFinancesAlias, to: POS_V2_PATHS.finances },
  { from: POS_V2_PATHS.posReportsAlias, to: POS_V2_PATHS.reports },
  { from: POS_V2_PATHS.posMoreAlias, to: POS_V2_PATHS.more },
  { from: POS_V2_PATHS.posTablesAlias, to: POS_V2_PATHS.tableZones },
  { from: POS_V2_PATHS.posHealthAlias, to: POS_V2_PATHS.health },
  { from: POS_V2_PATHS.posInventoryAlias, to: POS_V2_PATHS.inventory },
  { from: POS_V2_PATHS.posCashClosingAlias, to: POS_V2_PATHS.cashClosing },
];

export const POS_V2_ALIAS_ROUTES = (
  <>
    {LEGACY_ALIASES.map((alias) => (
      <Route key={alias.from} path={alias.from} element={<Navigate to={alias.to} replace />} />
    ))}
  </>
);
