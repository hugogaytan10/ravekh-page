import { useState } from "react";
import PropTypes from "prop-types";
import "./GoogleInput.css";

export const GoogleInput = ({ type, placeholder, name, value, onChange, onBlur, rows = 5 }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isTextarea = type === "textarea";

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    onBlur(event);
  };

  return (
    <div className={`google-input-container ${isFocused ? "focused" : ""}`}>
      {isTextarea ? (
        <textarea
          placeholder={placeholder}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={rows}
          className="google-input google-textarea"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="google-input"
        />
      )}
    </div>
  );
};

GoogleInput.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  rows: PropTypes.number,
};
