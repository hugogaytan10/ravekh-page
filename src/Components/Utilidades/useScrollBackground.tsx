import React, { useEffect } from "react";

export const useScrollBackground = () => {
  useEffect(() => {
    const handleScroll = () => {

      const sections = document.querySelectorAll("section");

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition > sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const distanceScrolled = scrollPosition - sectionTop;
          const scrollFraction = distanceScrolled / sectionHeight;

          const startColor = [255, 255, 255]; // RGB for white
          const endColor = section.dataset.endcolor ? section.dataset.endcolor.split(",").map(Number) : [73, 5, 146]; // Default color or data-endcolor

          const newColor = startColor.map((start, index) =>
            Math.round(start + (endColor[index] - start) * scrollFraction)
          );
          section.style.backgroundColor = `rgb(${newColor.join(",")})`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
};


