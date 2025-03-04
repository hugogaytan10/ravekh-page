import React from 'react';

export const PoliticaPrivacidadAgenda = () => {
  return (
    <div className="bg-gray-100 py-10 px-5 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Política de Privacidad</h1>
        
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Introducción</h2>
          <p className="text-gray-600 leading-relaxed">
            Esta Política de Privacidad describe cómo nuestra aplicación móvil de punto de agenda en linea recopila, utiliza y protege la información personal que nos proporcionas. Nuestra plataforma permite generar reportes de ventas, gestionar ingresos y egresos, personalizar la apariencia de la aplicación, y gestionar catálogos en línea, así como recibir pedidos de manera eficiente.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Información que recopilamos</h2>
          <p className="text-gray-600 leading-relaxed">
            Al utilizar nuestra aplicación, recopilamos la siguiente información:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Datos de ventas, ingresos y egresos para generar reportes y estadísticas.</li>
            <li>Información sobre horarios, pedidos y clientes.</li>
            <li>Preferencias de personalización de la aplicación (como la selección de colores).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Uso de la información</h2>
          <p className="text-gray-600 leading-relaxed">
            La información recopilada se utiliza para los siguientes fines:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Generación de reportes financieros y operativos.</li>
            <li>Gestión de ventas, ingresos y egresos dentro del negocio.</li>
            <li>Personalización de la aplicación según las preferencias del usuario (por ejemplo, colores).</li>
            <li>Gestión y visualización del catálogo en línea y procesamiento de pedidos de los clientes.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Compartir información</h2>
          <p className="text-gray-600 leading-relaxed">
            No compartimos tu información personal con terceros, salvo cuando sea necesario para cumplir con obligaciones legales o procesar pedidos realizados a través del catálogo en línea.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Seguridad de la información</h2>
          <p className="text-gray-600 leading-relaxed">
            Implementamos medidas de seguridad técnicas y organizativas para proteger la información personal que gestionamos. Sin embargo, no podemos garantizar la seguridad absoluta de los datos en todos los casos.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Tus derechos</h2>
          <p className="text-gray-600 leading-relaxed">
            Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Si deseas ejercer estos derechos, por favor contáctanos a través de los medios proporcionados en la aplicación.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Cambios en esta política</h2>
          <p className="text-gray-600 leading-relaxed">
            Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Las modificaciones serán notificadas a través de la aplicación y estarán disponibles en nuestra plataforma.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. Contacto</h2>
          <p className="text-gray-600 leading-relaxed">
            Si tienes preguntas o inquietudes sobre esta Política de Privacidad, no dudes en ponerte en contacto con nosotros a través de la opción de ayuda en la aplicación.
          </p>
        </section>
      </div>
    </div>
  );
};
