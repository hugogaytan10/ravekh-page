import React, { useState, useEffect } from "react";

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Datos de los testimonios
  const testimonials = [
    {
      name: "Iván Pérez",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "RAVEKH Agenda ha sido clave para mejorar la eficiencia de mi negocio. Su facilidad de uso y soporte siempre disponible son excepcionales.",
    },
    {
      name: "Fernando López",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "Con RAVEKH Agenda controlo mi agenda en tiempo real. Ha optimizado todos mis procesos y me ayuda a hacer crecer mi negocio.",
    },
    {
      name: "José Vásquez",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "RAVEKH Agenda es indispensable para organizar mi negocio. Ha mejorado tanto las ventas como el control de mis horarios.",
    },
    {
      name: "María González",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "La rapidez y precisión de RAVEKH Agenda me permiten gestionar mis ventas de manera efectiva, mejorando la experiencia del cliente.",
    },
    {
      name: "Luis Martínez",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "Gracias a RAVEKH Agenda, mis decisiones en la tienda son más rápidas y la agenda del tiempo me permite proporcionar un mejor servicio.",
    },
    {
      name: "Ana Ríos",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "RAVEKH Agenda es la solución perfecta para mi negocio. Me permite ser más eficiente y atender mejor a mis clientes.",
    },
    {
      name: "Carlos Sánchez",
      image: "https://via.placeholder.com/50",
      rating: 4,
      text: "RAVEKH Agenda es ideal para pequeños negocios. Ofrece todas las herramientas necesarias para mantenerme organizado y productivo.",
    },
    {
      name: "Lucía Pérez",
      image: "https://via.placeholder.com/50",
      rating: 5,
      text: "La integración con mi tienda en línea es perfecta gracias a RAVEKH Agenda. El control de horario automático me da total tranquilidad.",
    },
  ];
  

  // Autoplay logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Cambiar cada 5 segundos
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Renderizar los testimonios visibles
  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <div className="py-16 bg-white relative" id="testimonials">
      <div className="p-4 mx-auto text-center px-4 md:px-8 lg:px-12 w-full relative z-10">
        {/* Título de la sección */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Clientes alrededor del mundo
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-lg lg:text-xl mb-8">
          #1 app de Agenda en 74 países
        </p>

        {/* Carrusel de testimonios */}
        <div className="flex overflow-x-hidden space-x-4 justify-center">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 flex-shrink-0"
            >
              <div className="w-full min-h-[300px] p-6 bg-gradient-to-r from-purple-50 via-white to-purple-50 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div>
                    <h3 className="text-md md:text-lg lg:text-xl font-semibold text-gray-800">
                      {testimonial.name}
                    </h3>
                    <div className="flex space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="orange"
                          viewBox="0 0 24 24"
                          stroke="none"
                          className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                        >
                          <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
