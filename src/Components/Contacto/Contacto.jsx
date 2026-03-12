/* eslint-disable react/prop-types */
import { ContactPage } from "../../features/contact";

export const Contacto = ({ catalogo, compact = false }) => {
  return <ContactPage catalogo={catalogo} compact={compact} />;
};
