import React, { useState } from 'react';
import './GoogleInput.css';

const GoogleInput = ({ type, placeholder, value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (!value) {
            setIsFocused(false);
        }
    };

    return (
        <div className={`google-input-container ${isFocused ? 'focused' : ''}`}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="google-input"
            />
        </div>
    );
};

export default GoogleInput;
