import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const Airplane: React.FC<CustomSvgProps> = ({
    width = 28,
    height = 29,
    fillColor = "#6D01D1",
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 28 29"
            fill="none"
        >
            <Path
                d="M22.0664 11.2675C21.9322 11.2675 21.3541 11.2721 21.1454 11.2852L18.2958 11.3717L11.7243 2.1582H8.62605L12.3054 11.53L7.50533 11.612L5.3211 8.53472H2.75063L3.76727 13.8967C3.77467 13.9274 3.78355 13.9576 3.79342 13.9872C3.79414 13.99 3.79414 13.993 3.79342 13.9958C3.7833 14.0252 3.77458 14.0552 3.76727 14.0857L2.73682 19.4659H5.29101L7.53295 16.3346L12.3064 16.4581L8.62556 25.8424H11.7332L18.2938 16.6335L21.1435 16.7211C21.3551 16.7342 21.9327 16.7388 22.0639 16.7388C23.265 16.7388 24.2476 16.5486 24.9846 16.1729C26.2346 15.5375 26.421 14.5389 26.421 14.0003C26.421 12.2889 24.7932 11.2675 22.0664 11.2675Z"
                fill={fillColor}
            />
        </Svg>
    );
};

export default Airplane;
