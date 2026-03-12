import { useFormik } from "formik";
import { useCallback } from "react";
import { contactFormInitialValues, contactSuccessModalId } from "../model/contactFormModel";
import { contactValidationSchema } from "../model/contactValidationSchema";
import { sendContactMessage } from "../service/sendContactMessage";

const openSuccessModal = () => {
  const modal = document.getElementById(contactSuccessModalId);

  if (modal?.showModal) {
    modal.showModal();
  }
};

export const useContactForm = () => {
  const handleSubmit = useCallback(async (values, helpers) => {
    await sendContactMessage(values);
    openSuccessModal();
    helpers.resetForm();
  }, []);

  const formik = useFormik({
    initialValues: contactFormInitialValues,
    validationSchema: contactValidationSchema,
    onSubmit: handleSubmit,
  });

  return {
    formik,
    modalId: contactSuccessModalId,
  };
};
