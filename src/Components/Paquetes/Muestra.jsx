import React, { useRef, useEffect } from "react";
import webComida from "../../assets/webComida.png";
import "./Muestra.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PaquetesCards } from "./Masonry";

export const Paquetes = () => {
  const dimensions = screen.width;

  const projects = [
    {
      title: "Portal de comida",
      description: "Portal de comida (responsive)",
      //imageUrl: webComida,
      link: "https://main--stalwart-narwhal-93eefb.netlify.app/",
    },
    /*{
      title: "Página de Abogados",
      description: "Plantilla adecuada para los abogados",
      imageUrl: justicia,
      link: "https://main--bespoke-baklava-423557.netlify.app/",
    },
    {
      title: "Filtro de tarjetas",
      description: "Demo de un filtro de tarjetas",
      imageUrl: filter,
      link: "https://teal-jalebi-6ba797.netlify.app/",
    },
    {
      title: "Página universitaria",
      description: "Demo de página",
      imageUrl: itsur,
      link: "https://main--melodic-sundae-a09a6c.netlify.app/",
    },
    {
      title: "Acortador de URL",
      description: "Demo de consumo de APIs",
      imageUrl: short,
      link: "https://cute-boba-d3d365.netlify.app/",
    },
    {
      title: "Ecommerce",
      description: "Demo de una tienda en linea",
      imageUrl: ecomers,
      link: "https://lrwresearch.com/index.php",
    },
    {
      title: "Invitaciones digitales",
      description: "Demo de una invitación digital",
      imageUrl: digital,
      link: "https://startling-lolly-70cc76.netlify.app/"
    },
    {
      title: "Constructora",
      description: "Demo de una página constructora",
      imageUrl: constructora,
      link: "https://aesthetic-cucurucho-786504.netlify.app/",
    },
    {
      title: "Tienda de Zapatos",
      description: "Ecomerce para venta de Zapatos",
      imageUrl:zapatos,
      link:"https://www.calzadodiaz.com",
    },
    {
      title: "Landing Page Altertions For The Future",
      description: "Landing Page para una tienda de reparacion de ropa",
      imageUrl:pantalones,
      link:"https://www.alteracioneselfuturo.com",
    },
    {
      title: "TipTip",
      description: "Pagina de informacion para la aplicacion TipTip",
      imageUrl:TipTip,
      link:"https://play.google.com/store/apps/details?id=com.tiptiptip",
    },*/
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const carouselStyle = {
    cursor: "grab",
  };

  const handleMouseDown = () => {
    const carru = document.getElementById("carru");
    carru.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    const carru = document.getElementById("carru");
    carru.style.cursor = "grab";
  };

  const carruRef = useRef(null); // Referencia al div
  const followerRef = useRef(null); // Referencia al seguidor del cursor

  useEffect(() => {
    const div = carruRef.current;
    const follower = followerRef.current;

    if (div && follower) {
      follower.style.display = "none";

      const handleMouseMove = (e) => {
        // Asegúrate de que el cálculo se basa en la posición relativa al div
        const rect = div.getBoundingClientRect();
        follower.style.left = e.clientX - rect.left + "px";
        follower.style.top = e.clientY - rect.top + "px";
      };

      const handleMouseEnter = () => {
        follower.style.display = "block";
      };

      const handleMouseLeave = () => {
        follower.style.display = "none";
      };

      if (div) {
        div.addEventListener("mousemove", handleMouseMove);
        div.addEventListener("mouseenter", handleMouseEnter);
        div.addEventListener("mouseleave", handleMouseLeave);

        // Limpieza de eventos
        return () => {
          div.removeEventListener("mousemove", handleMouseMove);
          div.removeEventListener("mouseenter", handleMouseEnter);
          div.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    }
  }, []);

  return (
    <div className="w-full  min-h-screen ">
      <h3 className="text-center text-2xl font-bold md:text-3xl block w-full mt-10 mb-10">
        Desarrollo WEB
      </h3>
      <PaquetesCards/>
      {/*
     <div
        id="carru"
        className=""
        style={carouselStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={carruRef}
      >
        <Slider {...settings}>
          {projects.map((project, index) => (
            <div key={index} className="carousel-item">
              <div className="max-w-sm m-auto">
                <CardsProjects {...project} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {dimensions > 1000 && (
        <div ref={followerRef} className="cursor-follower"></div>
      )}
        */}
    </div>
  );
};