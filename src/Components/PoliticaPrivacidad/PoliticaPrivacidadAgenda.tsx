import React from 'react';

export const PoliticaPrivacidadAgenda = () => {
  return (
    <div className="bg-gray-100 py-10 px-5 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Política de Privacidad</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Introducción</h2>
          <p className="text-gray-600 leading-relaxed">
            Esta Política de Privacidad describe cómo nuestra aplicación móvil de agenda en línea recopila, utiliza y protege la información personal que nos proporcionas. Nuestra plataforma permite gestionar citas, pero no recopila información médica.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Información que recopilamos</h2>
          <p className="text-gray-600 leading-relaxed">
            Al utilizar nuestra aplicación, recopilamos la siguiente información:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Datos personales proporcionados por el usuario, como nombre, correo electrónico y número de teléfono.</li>
            <li>Datos de ventas, ingresos y egresos para generar reportes.</li>
            <li>Información sobre horarios, pedidos y clientes.</li>
            <li>Información sobre los negocios favoritos de los usuarios.</li>
            <li>Información de ubicación, si se proporciona, para gestionar citas.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Uso de la información</h2>
          <p className="text-gray-600 leading-relaxed">
            La información recopilada se utiliza para los siguientes fines:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Gestión de citas, ingresos y egresos dentro del negocio.</li>
            <li>Proveer notificaciones relevantes.</li>
            <li>Gestión y visualización de negocios cercanos y con mejores reseñas.</li>
            <li>Proveer soporte al usuario y mejorar la experiencia de uso.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Información Médica</h2>
          <p className="text-gray-600 leading-relaxed">
            Es importante destacar que **nuestra aplicación no recopila ni procesa ninguna información médica sensible**. La plataforma está diseñada únicamente para **gestionar citas** de servicios profesionales, como nutriólogos, psicólogos, entre otros. **No almacenamos ni tratamos información relacionada con la salud de los usuarios**. La única información que gestionamos está relacionada con el agendamiento de citas y detalles logísticos de los servicios.
          </p>
        </section>


        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Compartir información</h2>
          <p className="text-gray-600 leading-relaxed">
            No compartimos tu información personal con terceros, salvo cuando sea necesario para cumplir con obligaciones legales o procesar citas. En tales casos, nos aseguramos de que los terceros cumplan con las mismas políticas de privacidad.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Seguridad de la información</h2>
          <p className="text-gray-600 leading-relaxed">
            Implementamos medidas de seguridad técnicas y organizativas para proteger la información personal que gestionamos. Sin embargo, no podemos garantizar la seguridad absoluta de los datos en todos los casos.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Retención de datos</h2>
          <p className="text-gray-600 leading-relaxed">
            Los datos personales se retendrán únicamente durante el tiempo necesario para cumplir con los fines para los que fueron recopilados, y en cumplimiento de las leyes aplicables. Una vez que los datos ya no sean necesarios, se eliminarán o anonimizan de acuerdo con nuestra política de retención de datos.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Tus derechos</h2>
          <p className="text-gray-600 leading-relaxed">
            Tienes derecho a acceder, corregir, eliminar o restringir el uso de tu información personal en cualquier momento. Si deseas ejercer estos derechos, por favor contáctanos a través de los medios proporcionados en la aplicación. También puedes revocar tu consentimiento en cualquier momento.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. Cambios en esta política</h2>
          <p className="text-gray-600 leading-relaxed">
            Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Las modificaciones serán notificadas a través de la aplicación y estarán disponibles en nuestra plataforma.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">9. Contacto</h2>
          <p className="text-gray-600 leading-relaxed">
            Si tienes preguntas o inquietudes sobre esta Política de Privacidad, no dudes en ponerte en contacto con nosotros a través de la opción de ayuda en la aplicación.
          </p>
        </section>
      </div>
    </div>
  );
};
