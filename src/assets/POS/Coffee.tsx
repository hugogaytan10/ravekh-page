import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

const Coffee: React.FC<CustomSvgProps> = ({
    width = 24,
    height = 24,
    strokeColor = "#6D01D1",
    strokeWidth = 2,
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
        >
            <Path
                d="M17.1118 4.33496H19.9511C20.1394 4.33496 20.3199 4.40975 20.4531 4.54286C20.5862 4.67598 20.661 4.85653 20.661 5.04478V6.55315C20.661 7.09439 20.4459 7.61346 20.0632 7.99617C19.6805 8.37888 19.1615 8.59389 18.6202 8.59389H17.1118M17.1118 4.33496H5.04489V12.8528C5.04489 13.7941 5.41881 14.6968 6.0844 15.3624C6.74998 16.028 7.65271 16.4019 8.59399 16.4019H13.5627C14.0288 16.4019 14.4903 16.3101 14.9209 16.1318C15.3515 15.9534 15.7428 15.692 16.0723 15.3624C16.4019 15.0328 16.6633 14.6416 16.8417 14.211C17.02 13.7804 17.1118 13.3189 17.1118 12.8528V4.33496ZM3.62524 19.2412H18.5315"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default Coffee;
