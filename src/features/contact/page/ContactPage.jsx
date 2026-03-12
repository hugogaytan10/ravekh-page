/* eslint-disable react/prop-types */
import { ContactForm } from "../interface/ContactForm";
import { useContactForm } from "../hooks/useContactForm";

export const ContactPage = ({ catalogo = false, compact = false }) => {
  const { formik, modalId } = useContactForm();

  return <ContactForm catalogo={catalogo} compact={compact} formik={formik} modalId={modalId} />;
};
