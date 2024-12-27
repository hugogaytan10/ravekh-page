import React from 'react';


interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const ShieldIcon: React.FC<CustomSvgProps> = ({
    width = 30,
    height = 30,
    fillColor = "#6D01D1",
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 30 30"
            fill="none"
        >
            <path
                d="M27.9095 8.07747C27.8964 7.86794 27.8133 7.66888 27.6736 7.51218C27.5339 7.35547 27.3457 7.2502 27.139 7.21321C22.0982 6.30969 19.9771 5.60305 15.425 3.55462C14.9703 3.38528 14.6884 3.38821 14.2531 3.55462C9.70093 5.6054 7.57984 6.30852 2.53902 7.21321C2.33236 7.2502 2.1441 7.35547 2.0044 7.51218C1.86469 7.66888 1.78162 7.86794 1.76851 8.07747C1.54292 11.6575 2.0228 14.9915 3.19585 17.9886C4.15504 20.4325 5.57605 22.6688 7.3812 24.5751C9.99858 27.3542 12.9007 28.9767 14.3972 29.5907C14.681 29.7065 14.9988 29.7065 15.2826 29.5907C16.8646 28.9509 19.6589 27.3747 22.2968 24.574C24.1019 22.6679 25.5229 20.4321 26.4822 17.9886C27.6552 14.9921 28.1351 11.6575 27.9095 8.07747Z"
                fill={fillColor}
            />
        </svg>
    );
};

export default ShieldIcon;
