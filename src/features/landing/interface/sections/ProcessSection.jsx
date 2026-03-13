import PropTypes from "prop-types";
import { AnimatedText } from "../components/AnimatedText";
import { useSectionTextAnimation } from "../../hooks/useSectionTextAnimation";
import "../styles/landingVisuals.css";

export const ProcessSection = ({ content }) => {
  const { sectionRef, shouldAnimate } = useSectionTextAnimation(0.9);

  return (
    <div ref={sectionRef} className="w-full relative flex flex-wrap justify-between min-h-screen md:items-center">
      <span className="block w-full text-white text-sm text-center absolute top-4 rombo">{content.label}</span>
      <h2 className="text-gray-50 font-bold text-4xl w-full md:w-1/4 text-center mb-10">
        {shouldAnimate ? <AnimatedText text={content.title} /> : content.title}
      </h2>
      <div className="relative w-full md:w-1/4 flex items-center justify-center">
        <img src={content.image} alt={content.title} className="img-circle relative z-10 h-52 md:h-96 md:w-96 object-contain" />
        <div className="circle-of-dots" />
      </div>
      <p className="font-thin text-gray-50 mt-5 w-full md:w-1/4 p-1 ml-8 text-left text-base md:text-xl">
        {content.description}
      </p>
    </div>
  );
};

ProcessSection.propTypes = {
  content: PropTypes.shape({
    label: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};
