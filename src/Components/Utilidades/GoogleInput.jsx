// GoogleInput.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './GoogleInput.css';

const GoogleInput = ({ type, placeholder, name, value, onChange, onBlur }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur(); 
    };

    return (
        <div className={`google-input-container ${isFocused ? 'focused' : ''}`}>
            <input
                type={type}
                placeholder={placeholder}
                name={name} 
                id={name} 
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                className="google-input"
            />
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
};

export default GoogleInput;
