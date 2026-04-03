export interface PolicySection {
  title: string;
  content: string;
}

export interface PolicyDocument {
  slug: string;
  title: string;
  subtitle: string;
  sections: PolicySection[];
}

export const PRIVACY_POLICIES: PolicyDocument[] = [
  {
    slug: "ravekh-pos",
    title: "Política de Privacidad — Ravekh POS",
    subtitle: "Gestión de ventas, operación, finanzas y configuración del negocio.",
    sections: [
      {
        title: "1. Datos que tratamos",
        content:
          "Tratamos datos operativos del negocio como ventas, productos, inventario, egresos e información básica de usuarios de la cuenta para habilitar el servicio.",
      },
      {
        title: "2. Finalidad",
        content:
          "Usamos la información para administrar el punto de venta, generar reportes, mejorar estabilidad, prevenir fraude y ofrecer soporte técnico.",
      },
      {
        title: "3. Conservación",
        content:
          "Conservamos los datos durante el tiempo necesario para prestar el servicio y cumplir obligaciones legales o fiscales aplicables.",
      },
      {
        title: "4. Derechos",
        content:
          "Puedes solicitar acceso, corrección o eliminación de datos, así como limitar ciertos tratamientos mediante los canales oficiales de soporte.",
      },
    ],
  },
  {
    slug: "ravekh",
    title: "Política de Privacidad — Ravekh",
    subtitle: "Sitio web y canales de contacto de la marca.",
    sections: [
      {
        title: "1. Datos que tratamos",
        content:
          "Podemos tratar nombre, correo, teléfono y mensajes cuando nos contactas por formularios, redes sociales o mensajería.",
      },
      {
        title: "2. Finalidad",
        content:
          "Usamos la información para responder solicitudes comerciales, compartir propuestas y mejorar la experiencia digital del sitio.",
      },
      {
        title: "3. Compartición",
        content:
          "No vendemos datos personales. Solo compartimos con proveedores que nos ayudan a operar el servicio bajo medidas de confidencialidad.",
      },
      {
        title: "4. Derechos",
        content:
          "Puedes solicitar la actualización o baja de tus datos enviando tu solicitud por los medios de contacto oficiales.",
      },
    ],
  },
  {
    slug: "lealtad",
    title: "Política de Privacidad — Lealtad",
    subtitle: "Programa de recompensas, cupones y visitas de clientes.",
    sections: [
      {
        title: "1. Datos que tratamos",
        content:
          "Podemos tratar nombre, teléfono, historial de visitas, cupones, canjes y actividad del usuario para operar beneficios.",
      },
      {
        title: "2. Finalidad",
        content:
          "La información permite acumular visitas, habilitar cupones, evitar usos indebidos y personalizar la experiencia de recompensas.",
      },
      {
        title: "3. Seguridad",
        content:
          "Aplicamos medidas técnicas y administrativas razonables para proteger la información frente a accesos no autorizados.",
      },
      {
        title: "4. Derechos",
        content:
          "El usuario puede solicitar revisión, corrección o eliminación de datos conforme a la normativa aplicable.",
      },
    ],
  },
  {
    slug: "catalogo",
    title: "Política de Privacidad — Catálogo",
    subtitle: "Vitrina de productos, carrito y flujo de pedidos en línea.",
    sections: [
      {
        title: "1. Datos que tratamos",
        content:
          "Tratamos datos de pedido, productos seleccionados, contacto y dirección de entrega cuando aplica, para procesar solicitudes.",
      },
      {
        title: "2. Finalidad",
        content:
          "Utilizamos la información para confirmar pedidos, coordinar entrega o recolección, y mejorar la experiencia de compra.",
      },
      {
        title: "3. Compartición",
        content:
          "Podemos compartir datos mínimos necesarios con pasarelas de pago o servicios logísticos, únicamente para completar el pedido.",
      },
      {
        title: "4. Derechos",
        content:
          "Las personas usuarias pueden ejercer sus derechos de acceso, rectificación, cancelación u oposición por canales oficiales.",
      },
    ],
  },
];
