import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const FootbalBall: React.FC<CustomSvgProps> = ({
    width = 28,
    height = 28,
    fillColor = "#6D01D1",
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 28 28"
            fill="none"
        >
            <Path
                d="M7.14585 7.12843C5.14806 9.11774 4.1418 11.6396 3.6351 13.6419L12.6669 22.6348C14.6781 22.1304 17.2107 21.1286 19.2085 19.1393C21.2062 17.15 22.2125 14.6281 22.7192 12.6254L13.6874 3.63286C11.6762 4.13733 9.14363 5.14136 7.14585 7.12843ZM16.6995 8.62979L17.7049 9.63069L16.1968 11.132L17.2022 12.1329L16.1928 13.1325L15.1861 12.1329L14.1825 13.1325L15.1861 14.1348L14.1812 15.1357L13.1772 14.1348L12.1718 15.1357L13.1772 16.1366L12.1718 17.1375L11.1682 16.1366L9.66016 17.6379L8.65345 16.637L10.1615 15.1357L9.15613 14.1348L10.1615 13.1325L11.1682 14.1348L12.1718 13.1325L11.1682 12.1329L12.1731 11.132L13.1772 12.1329L14.1825 11.132L13.1772 10.1311L14.1825 9.13024L15.1861 10.1311L16.6995 8.62979ZM23.1094 10.6061C23.4384 8.16148 22.463 3.89358 22.463 3.89358C22.463 3.89358 18.171 2.91679 15.7156 3.24447C15.6022 3.2592 15.483 3.27661 15.3584 3.29536L23.0581 10.9611C23.0772 10.8378 23.0942 10.7191 23.1094 10.6061ZM3.24492 15.6615C2.9159 18.1062 3.89358 22.463 3.89358 22.463C3.89358 22.463 6.57218 23.1772 8.35166 23.1772C9.11657 23.176 9.88056 23.1245 10.6387 23.0232C10.7521 23.0085 10.8713 22.9911 10.9959 22.9719L3.29626 15.3066C3.27706 15.4299 3.2601 15.5486 3.24492 15.6615Z"
                fill={fillColor}
            />
        </Svg>
    );
};

export default FootbalBall;
