import * as Yup from "yup";

export const contactValidationSchema = Yup.object({
  nombre: Yup.string().required("El nombre es obligatorio"),
  apellido: Yup.string().required("El apellido es obligatorio"),
  mensaje: Yup.string().required("El mensaje es obligatorio"),
  email: Yup.string()
    .email("Ingrese un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  lada: Yup.string().required("La lada es obligatoria"),
  telefono: Yup.string().required("El teléfono es obligatorio"),
});
