import React from 'react';
import { CardsProjects } from './CardsProjects';
import mascotitas from '../../assets/MASCOTITAS.png';
import filter from '../../assets/filter-cards.png';
import itsur from '../../assets/ITSUR.png';
import short from '../../assets/short-link.png';
import webComida from '../../assets/webComida.png';
import ecomers from '../../assets/ecomers.png';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export const Muestra = () => {
  const projects = [
    {
      title: 'Portal de comida',
      description: 'Portal de comida (responsive)',
      imageUrl: webComida,
      link: 'https://main--stalwart-narwhal-93eefb.netlify.app/',
    },
    {
      title: 'Mascotitas',
      description: 'Demo de una tienda para mascotas',
      imageUrl: mascotitas,
      link: 'https://hugogaytan10.github.io/Mascotitas',
    },
    {
      title: 'Filtro de tarjetas',
      description: 'Demo de un filtro de tarjetas',
      imageUrl: filter,
      link: 'https://teal-jalebi-6ba797.netlify.app/',
    },
    {
      title: 'Página escolar',
      description: 'Demo de página',
      imageUrl: itsur,
      link: 'https://main--melodic-sundae-a09a6c.netlify.app/',
    },
    {
      title: 'Acortador de URL',
      description: 'Demo de consumo de APIs',
      imageUrl: short,
      link: 'https://cute-boba-d3d365.netlify.app/',
    },
    {
      title: 'Ecommerce',
      description: 'Demo de una tienda en linea',
      imageUrl: ecomers,
      link: 'https://lrwresearch.com/index.php',
    },
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
    background: 'linear-gradient(190deg, #8B4780 0%, #3C0433 100%)',
  };

  return (
    <div className="w-3/4 block mt-16 m-auto scroll-content fadeTop">
      <h3 className='text-center text-2xl font-bold md:text-3xl block w-full'>Algunos Demos</h3>
      <div style={carouselStyle}>
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
    </div>
  );
};
