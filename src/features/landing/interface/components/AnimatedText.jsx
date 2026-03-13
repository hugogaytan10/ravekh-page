import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

export const AnimatedText = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const spans = containerRef.current?.querySelectorAll("span") ?? [];

    spans.forEach((span, index) => {
      span.style.animationDelay = `${index * 0.1}s`;
    });
  }, [text]);

  return (
    <div ref={containerRef} className="title">
      {text.split("").map((letter, index) => (
        <span key={`${text}-${index}`}>{letter === " " ? "\u00A0" : letter}</span>
      ))}
    </div>
  );
};

AnimatedText.propTypes = {
  text: PropTypes.string.isRequired,
};
