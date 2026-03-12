/* eslint-disable react/prop-types */
import { ContactForm } from "../interface/ContactForm";
import { useContactForm } from "../hooks/useContactForm";

export const ContactPage = ({ catalogo = false }) => {
  const { formik, modalId } = useContactForm();

  return <ContactForm catalogo={catalogo} formik={formik} modalId={modalId} />;
};
