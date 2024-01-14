import React from 'react';
import { Link } from 'react-scroll';
import './ArticuloWhisper.css';
import whisper from '../../../../assets/whisper.jpg';
import whisperBanner from '../../../../assets/whisperBanner.jpg';

export const ArticuloWhisper = () => {
  // Contenido de cada sección
  const secciones = [
    {
      id: 'seccion-ia',
      titulo: '¿Qué es la Inteligencia Artificial (IA)?',
      contenido: [
        'La Inteligencia Artificial es un fascinante campo de la informática que busca replicar la inteligencia humana en máquinas.',
        'Está compuesta por diversas disciplinas, como el aprendizaje automático, el procesamiento del lenguaje natural y la visión por computadora.',
        'En la práctica, la IA se despliega en una variedad de aplicaciones, desde sistemas de recomendación en plataformas de streaming hasta la automatización de procesos en la industria.',
        'Uno de los objetivos clave de la IA es permitir a las máquinas aprender y adaptarse a partir de datos, mejorando su rendimiento con el tiempo.',
        'Este emocionante campo está en constante evolución, abriendo nuevas posibilidades para la resolución de problemas complejos y la creación de tecnologías innovadoras.'
      ]
    },
    {
      id: 'seccion-whisper',
      titulo: '¿Qué es Whisper?',
      contenido: [
        'Whisper, desarrollado por OpenAI, es una poderosa librería que se encuentra en la vanguardia del procesamiento del lenguaje natural.',
        'A diferencia de otras soluciones, Whisper no solo procesa texto, sino que comprende y genera contenido de manera contextualmente coherente.',
        'Esto significa que puede entender el contexto de una conversación y responder de manera más natural y significativa.',
        'Utilizando modelos de lenguaje avanzados, Whisper ha demostrado ser invaluable en la creación de asistentes virtuales más inteligentes, enriqueciendo la interacción humano-máquina y elevando la calidad de las aplicaciones basadas en texto a nuevas alturas.'
      ]
    },
    {
      id: 'seccion-django',
      titulo: '¿Qué es Django?',
      contenido: [
        'Django es un marco de desarrollo web de alto nivel, diseñado para facilitar la creación rápida y sencilla de aplicaciones web robustas.',
        'Desarrollado en Python, Django sigue el principio de "baterías incluidas", proporcionando un conjunto de herramientas y características esenciales para el desarrollo web sin tener que reinventar la rueda.',
        'Con su sistema de administración integrado, un potente ORM para interactuar con bases de datos y una estructura de enrutamiento clara, Django simplifica el desarrollo, permitiéndote enfocarte en la lógica de la aplicación en lugar de tareas repetitivas.',
        'Es ideal para proyectos de todos los tamaños, desde pequeñas aplicaciones hasta sitios web empresariales a gran escala.',
        <div key="codigo-django" className="rounded-lg p-4 bg-gray-800 text-white my-4">
          <p className="text-gray-300 mb-2"># Instala Django utilizando pip</p>
          <code className="text-green-300">$ pip install Django</code>
        </div>
      ]
    },
    {
      id: 'seccion-drf',
      titulo: 'Cómo usar Django Rest Framework',
      contenido: [
        'Django Rest Framework (DRF) amplía las capacidades de Django para construir potentes API REST.',
        'Después de instalar DRF, puedes comenzar a definir modelos de datos, serializadores y vistas para crear tu API.',
        'DRF simplifica tareas comunes, como la autenticación de usuarios, autorización y validación de datos, lo que acelera el desarrollo y garantiza la seguridad de tu API.',
        'Además, DRF ofrece navegación interactiva, facilitando la exploración y prueba de tu API.',
        'Ya sea que estés construyendo una API para tu aplicación web o creando un backend independiente, Django Rest Framework se destaca como una herramienta esencial para facilitar el desarrollo de servicios web potentes y escalables.'
      ]
    }
  ];

  return (
    <div>
      <div className="hero min-h-screen blanco" style={{ backgroundImage: `url(${whisperBanner})` }}>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img src={whisper} className="max-w-sm rounded-lg shadow-2xl" alt="Whisper Library" />
          <div>
            <h1 className="text-5xl font-bold py-6">Descubriendo Whisper: La Revolucionaria Librería de OpenAI</h1>
            <p className="py-6 justo">
              En este artículo, nos sumergiremos en el fascinante mundo de Whisper de OpenAI. Descubrirás de cerca cómo esta innovadora biblioteca funciona y, lo que es aún más emocionante, aprenderás a integrarla fácilmente en tus proyectos de programación, sin importar su naturaleza o complejidad.
            </p>
            <p className='py-6 justo'>
              Whisper va más allá de ser simplemente una librería; es una herramienta que puede potenciar de manera significativa tus desarrollos. Únete a nosotros en este fascinante recorrido mientras desvelamos los secretos de Whisper y exploramos cómo puede elevar la calidad y eficiencia de tus proyectos hacia nuevos horizontes. Prepárate para descubrir y aprovechar todo el potencial de esta notable incorporación a la familia de OpenAI. ¡El futuro de tus proyectos está a punto de dar un salto cuántico!
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-6 max-w-3xl mx-auto">
        <ul className="space-y-4">
          {secciones.map((seccion) => (
            <li key={seccion.id}>
              <Link to={seccion.id} smooth={true} duration={500} className="text-blue-500 hover:underline cursor-pointer">{seccion.titulo}</Link>
            </li>
          ))}
        </ul>

        {secciones.map((seccion) => (
          <section key={seccion.id} id={seccion.id} className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">{seccion.titulo}</h2>
            {seccion.contenido.map((parrafo, index) => (
              <p key={index} className="text-gray-700">{parrafo}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};
