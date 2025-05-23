import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellido: Yup.string().required('El apellido es obligatorio'),
    mensaje: Yup.string().required('El mensaje es obligatorio'),
    email: Yup.string().email('Ingrese un correo electrónico válido').required('El correo electrónico es obligatorio'),
    lada: Yup.string().required('La lada es obligatoria'),
    telefono: Yup.string().required('El teléfono es obligatorio'),
});

export default validationSchema;
