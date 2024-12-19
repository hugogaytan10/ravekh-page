import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { data } from "./data/information"; // Asegúrate de que la ruta sea correcta

export const AnimatedSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const slide = Math.round(
      (event.currentTarget.scrollLeft / event.currentTarget.offsetWidth)
    );
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }

    // Regresa al primer slide si es el último
    if (slide === data.length - 1) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ left: 0, behavior: "smooth" });
          setActiveIndex(0);
        }
      }, 20000);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white">
      {/* Slider */}
      <div
        ref={scrollViewRef}
        className="flex overflow-x-auto snap-x snap-mandatory w-full h-64"
        onScroll={handleScroll}
      >
        {data.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 snap-start w-full h-full flex flex-col justify-between border rounded-md shadow-md m-2"
            style={{ width: "100%" }}
          >
            <div
              className={`h-16 flex items-center justify-center text-white font-bold text-lg rounded-t-md ${
                item.title === "Emprendedor"
                  ? "bg-black"
                  : item.title === "Empresarial"
                  ? "bg-purple-500"
                  : "bg-purple-200"
              }`}
            >
              {item.title}
            </div>

            <div className="flex flex-col items-center justify-center p-4 h-full">
              {item.features.map((feature, idx) => (
                <p key={idx} className="text-center text-sm text-gray-700">
                  {feature}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex space-x-2 mt-4 mb-20">
        {data.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === activeIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

     
    </div>
  );
};
