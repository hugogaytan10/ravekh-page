import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const ThumbsUp: React.FC<CustomSvgProps> = ({
    width = 20,
    height = 20,
    fillColor = "#6D01D1",
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
        >
            <Path
                d="M18.4398 13.0469L12.8086 12.8074C12.6285 12.7934 11.875 12.7602 11.875 11.7969C11.875 10.8668 12.6234 10.8074 12.818 10.7859L18.4398 10.5469C18.9348 10.552 19.375 11.1105 19.375 11.7969C19.375 12.4832 18.9348 13.0418 18.4398 13.0469ZM12.9145 7.90352L17.084 7.57812C17.5781 7.57812 18.125 8.22969 18.125 8.90156V8.91445C18.125 9.55195 17.6898 10.0715 17.1531 10.0781L12.9168 10.0105C11.875 9.88281 11.875 9.25117 11.875 8.97969C11.875 8.08594 12.7266 7.91914 12.9145 7.90352ZM16.4785 18.75L12.9875 18.4012C12.0313 18.3648 11.875 17.7273 11.875 17.3277C11.875 16.6098 12.3988 16.3668 12.9168 16.3668L16.4715 16.2496C17.0395 16.2586 17.4996 16.816 17.4996 17.4996C17.4996 18.1832 17.0437 18.7367 16.4785 18.75ZM17.8207 15.957L12.8832 15.7145C12.5164 15.6898 11.875 15.5973 11.875 14.6844C11.875 14.2156 12.0449 13.684 12.8516 13.609L17.8199 13.4574C18.334 13.4629 18.75 13.9844 18.75 14.684C18.75 15.3836 18.334 15.9508 17.8207 15.9566V15.957Z"
                fill={fillColor}
            />
            <Path
                d="M5.2168 9.29922C5.12633 9.34864 5.02496 9.37468 4.92188 9.375C5.02437 9.37471 5.12518 9.34894 5.21523 9.3L5.2168 9.29922ZM6.80234 6.59297C6.00156 7.98008 5.61641 8.73945 5.48125 9.01484C5.6168 8.73867 6.00234 7.9793 6.80234 6.59297Z"
                fill={fillColor}
            />
            <Path
                d="M5.44292 9.09521L5.48198 9.01709C5.42546 9.13672 5.33301 9.23572 5.21753 9.30029C5.30811 9.25112 5.38544 9.18076 5.44292 9.09521Z"
                fill={fillColor}
            />
            <Path
                d="M12.3461 2.05547C11.9777 1.53594 11.3672 1.25 10.625 1.25C10.509 1.24999 10.3952 1.28229 10.2965 1.34328C10.1977 1.40426 10.1179 1.49153 10.066 1.59531C9.94883 1.83242 9.47031 2.53281 8.96484 3.27148C8.26172 4.3 7.38867 5.57891 6.80742 6.58398L6.80234 6.59297C6.00234 7.9793 5.6168 8.73867 5.48125 9.01484L5.44219 9.09297C5.38434 9.17818 5.30674 9.24814 5.21602 9.29688C5.12601 9.34703 5.0249 9.37389 4.92188 9.375H3.9332C3.49876 9.375 3.06858 9.46057 2.66721 9.62682C2.26584 9.79307 1.90115 10.0368 1.59395 10.344C0.973542 10.9644 0.625 11.8058 0.625 12.6832V14.1914C0.624949 14.6259 0.71048 15.0561 0.87671 15.4575C1.04294 15.8589 1.28661 16.2237 1.59381 16.5309C1.90101 16.8381 2.26572 17.0819 2.66712 17.2481C3.06851 17.4144 3.49873 17.5 3.9332 17.5H5.83906C5.97211 17.5005 6.10214 17.5397 6.21328 17.6129C7.10938 18.198 8.80234 18.75 10.625 18.75C10.916 18.75 11.1793 18.7445 11.4168 18.7352C11.4734 18.7331 11.5283 18.7158 11.5758 18.685C11.6233 18.6541 11.6615 18.611 11.6864 18.5601C11.7113 18.5093 11.7219 18.4526 11.717 18.3962C11.7122 18.3398 11.6921 18.2857 11.659 18.2398L11.6551 18.2344C11.3203 17.7504 11.25 17.2266 11.25 16.875C11.2494 16.5419 11.3185 16.2123 11.4527 15.9074C11.491 15.821 11.5107 15.7275 11.5107 15.633C11.5107 15.5385 11.491 15.445 11.4527 15.3586C11.3191 15.0477 11.2502 14.7128 11.2502 14.3744C11.2502 14.036 11.3191 13.7011 11.4527 13.3902C11.4908 13.3041 11.5105 13.211 11.5105 13.1168C11.5105 13.0226 11.4908 12.9295 11.4527 12.8434C11.3198 12.5378 11.2512 12.2081 11.2512 11.8748C11.2512 11.5415 11.3198 11.2118 11.4527 10.9062C11.4927 10.816 11.5134 10.7183 11.5134 10.6195C11.5134 10.5208 11.4927 10.4231 11.4527 10.3328C11.3134 10.0192 11.2442 9.67903 11.25 9.33594C11.25 9.01562 11.3281 8.50391 11.5625 8.11758C11.6099 8.03796 11.6385 7.94862 11.6462 7.85631C11.6539 7.76399 11.6405 7.67114 11.607 7.58477C11.5922 7.5457 11.5773 7.50391 11.5629 7.46094C11.5161 7.31493 11.5046 7.15991 11.5293 7.00859C11.6465 6.25312 11.907 5.59102 12.1832 4.89297C12.3035 4.58906 12.4281 4.275 12.5434 3.94531C12.7832 3.25898 12.7113 2.57031 12.3461 2.05547Z"
                fill={fillColor}
            />
        </Svg>
    );
};

export default ThumbsUp;