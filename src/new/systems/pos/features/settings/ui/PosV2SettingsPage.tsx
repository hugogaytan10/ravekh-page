import { Link } from "react-router-dom";
import { FiChevronRight, FiSettings, FiShoppingBag, FiPrinter, FiCreditCard, FiDollarSign, FiPercent, FiGrid, FiUser, FiHelpCircle, FiBox } from "react-icons/fi";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import { POS_SUPPORT_WHATSAPP_URL } from "../../../shared/config/posExternalLinks";
import "./PosSettings.css";

export const PosV2SettingsPage = () => {
  const admin = resolvePosOperatorRole(readPosSessionSnapshot().token) === "admin";
  const items = [
    ...(admin ? [
      ["Ajustes de catálogo", POS_V2_PATHS.catalog],
      ["Ticket e impresora", POS_V2_PATHS.ticketSettings],
      ["Métodos de pago", POS_V2_PATHS.morePreview("payment-methods")],
    ] : []),
    ["Tipo de moneda", POS_V2_PATHS.currency],
    ...(admin ? [
      ["Impuesto de venta", POS_V2_PATHS.morePreview("sales-tax")],
      ["Mesas", POS_V2_PATHS.tableZones],
      ["Información del negocio", POS_V2_PATHS.morePreview("business")],
    ] : []),
    ["Información de la cuenta", POS_V2_PATHS.account],
    ["Pregunta de seguridad", POS_V2_PATHS.securityQuestions],
  ];
  const icons = [FiShoppingBag, FiPrinter, FiCreditCard, FiDollarSign, FiPercent, FiGrid, FiBox, FiUser, FiHelpCircle];
  const iconByPath: Record<string, typeof FiSettings> = { [POS_V2_PATHS.catalog]: icons[0], [POS_V2_PATHS.ticketSettings]: icons[1], [POS_V2_PATHS.morePreview("payment-methods")]: icons[2], [POS_V2_PATHS.currency]: icons[3], [POS_V2_PATHS.morePreview("sales-tax")]: icons[4], [POS_V2_PATHS.tableZones]: icons[5], [POS_V2_PATHS.morePreview("business")]: icons[6], [POS_V2_PATHS.account]: icons[7], [POS_V2_PATHS.securityQuestions]: icons[8] };
  return <PosV2Shell title="Ajustes" subtitle="Administra y configura tu cuenta">
    <section className="pos-settings"><div className="pos-settings__card">
      {items.map(([label, path]) => { const Icon = iconByPath[path] || FiSettings; return <Link className="pos-settings__link" key={path} to={path}><span className="pos-settings__icon"><Icon size={20} aria-hidden="true" /></span><span>{label}</span><FiChevronRight aria-hidden="true" /></Link>; })}
      <a className="pos-settings__link" href={POS_SUPPORT_WHATSAPP_URL || "https://wa.me/525653989702?text=Hola,%20necesito%20ayuda%20con%20Ravekh%20POS"} target="_blank" rel="noreferrer">Ayuda <FiChevronRight aria-hidden="true" /></a>
    </div></section>
  </PosV2Shell>;
};
