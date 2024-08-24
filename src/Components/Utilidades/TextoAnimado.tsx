import React, { useEffect, useRef } from "react";
import "./TextoAnimado.css";

export const TextoAnimado = ({ text, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const spans = (containerRef.current as HTMLElement).querySelectorAll("span");

      spans.forEach((span, index) => {
        span.style.animationDelay = `${index * 0.1}s`;
      });
    
      }
    
  }, []);

  return (
    <div ref={containerRef} className={`title `}>
      {text.split("").map((letter, index) => (
        <span key={index} >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </div>
  );
};
