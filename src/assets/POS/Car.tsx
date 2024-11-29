import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const Car: React.FC<CustomSvgProps> = ({
    width = 25,
    height = 24,
    fillColor = "#6D01D1",
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 25 24"
            fill="none"
        >
            <Path
                d="M0.866135 12.9478C1.04192 11.0536 1.33147 10.6847 1.44084 10.5459C1.69231 10.2253 2.09465 10.0158 2.52043 9.79594C2.54451 9.78371 2.5653 9.76629 2.58116 9.74503C2.59702 9.72378 2.60752 9.69927 2.61183 9.67345C2.61614 9.64763 2.61414 9.62121 2.60599 9.59626C2.59784 9.57131 2.58376 9.54852 2.56487 9.52969C2.48602 9.45292 2.42542 9.36067 2.38723 9.25928C2.34905 9.15789 2.33419 9.04977 2.34367 8.94234C2.36204 8.75185 2.45431 8.57494 2.60218 8.44669C2.75006 8.31845 2.94274 8.24825 3.14201 8.25H3.90373C3.93638 8.25019 3.96899 8.25222 4.00139 8.25609C4.02362 8.24683 4.04666 8.23946 4.07024 8.23406C4.52141 7.31859 5.13908 6.06516 6.41936 5.45344C8.31828 4.54687 11.8163 4.5 12.4999 4.5C13.1835 4.5 16.6816 4.54687 18.578 5.45203C19.8583 6.06375 20.476 7.31719 20.9272 8.23266L20.9311 8.24016C20.9536 8.24319 20.9757 8.24854 20.997 8.25609C21.0294 8.25222 21.062 8.25019 21.0947 8.25H21.8578C22.0571 8.24825 22.2498 8.31845 22.3977 8.44669C22.5455 8.57494 22.6378 8.75185 22.6562 8.94234C22.6648 9.04952 22.6493 9.15723 22.6106 9.25811C22.572 9.359 22.511 9.45067 22.4321 9.52688C22.4132 9.54571 22.3991 9.5685 22.3909 9.59345C22.3828 9.6184 22.3808 9.64482 22.3851 9.67064C22.3894 9.69646 22.3999 9.72096 22.4158 9.74222C22.4316 9.76348 22.4524 9.7809 22.4765 9.79313C22.9023 10.0144 23.3066 10.2239 23.5561 10.5431C23.6655 10.6838 23.9545 11.0508 24.1308 12.945C24.2284 14.0109 24.2431 15.1144 24.1664 15.825C24.0058 17.3016 23.7045 18.1941 23.6918 18.2311C23.6456 18.3659 23.5605 18.4853 23.4464 18.5755C23.3323 18.6656 23.1939 18.7229 23.0473 18.7406V18.75C23.0473 18.9489 22.965 19.1397 22.8185 19.2803C22.672 19.421 22.4732 19.5 22.266 19.5H19.5317C19.3245 19.5 19.1257 19.421 18.9792 19.2803C18.8327 19.1397 18.7504 18.9489 18.7504 18.75C18.33 18.75 18.0375 18.6778 17.7275 18.6009C17.2798 18.4851 16.8223 18.4081 16.3603 18.3708C14.8705 18.2344 13.3891 18.1875 12.4999 18.1875C11.6288 18.1875 10.082 18.2344 8.58977 18.3708C8.12596 18.4082 7.6666 18.4855 7.21721 18.6019C6.92033 18.675 6.6386 18.7425 6.24846 18.7495C6.24846 18.9484 6.16615 19.1392 6.01964 19.2799C5.87313 19.4205 5.67441 19.4995 5.46721 19.4995H2.73283C2.52563 19.4995 2.32692 19.4205 2.18041 19.2799C2.03389 19.1392 1.95158 18.9484 1.95158 18.7495V18.7439C1.8046 18.7265 1.66579 18.6694 1.55133 18.5792C1.43687 18.489 1.35147 18.3694 1.3051 18.2344C1.29241 18.1973 0.991137 17.3048 0.830492 15.8283C0.753832 15.1172 0.767502 14.0156 0.866135 12.9478ZM19.5151 8.87391C19.1244 8.07703 18.6777 7.17516 17.8822 6.795C16.7328 6.24563 14.3505 5.99812 12.4999 5.99812C10.6493 5.99812 8.26701 6.24375 7.1176 6.795C6.32219 7.17516 5.87737 8.0775 5.48479 8.87391L5.43596 8.97563C5.40741 9.03353 5.39478 9.0975 5.3993 9.16142C5.40381 9.22534 5.4253 9.28708 5.46173 9.34076C5.49816 9.39445 5.54831 9.43827 5.60739 9.46806C5.66648 9.49785 5.73253 9.51261 5.79924 9.51094C7.4218 9.46875 10.8398 9.33375 12.4999 9.33375C14.1601 9.33375 17.578 9.47203 19.203 9.51422C19.2698 9.51589 19.3358 9.50113 19.3949 9.47134C19.454 9.44155 19.5041 9.39773 19.5406 9.34405C19.577 9.29037 19.5985 9.22862 19.603 9.1647C19.6075 9.10078 19.5949 9.03681 19.5663 8.97891C19.5492 8.94422 19.5312 8.90906 19.5151 8.87391ZM18.9325 12.6066C19.7725 12.7036 20.6178 12.7515 21.4638 12.75C21.9814 12.75 22.5151 12.6094 22.6142 12.1669C22.6821 11.8692 22.6747 11.7019 22.6381 11.5336C22.6073 11.3906 22.5585 11.2866 22.3144 11.25C21.6796 11.1562 21.3246 11.2739 20.2856 11.5678C19.5966 11.7623 19.0995 12.0216 18.8163 12.2269C18.6742 12.3281 18.7499 12.5925 18.9325 12.6066ZM8.12297 16.4503C8.76555 16.5206 10.0507 16.4948 12.4853 16.4948C14.9198 16.4948 16.2045 16.5206 16.8471 16.4503C17.5102 16.3795 18.3554 15.7777 17.7782 15.2414C17.394 14.888 16.4975 14.6236 15.3036 14.475C14.1098 14.3264 13.6044 14.25 12.4902 14.25C11.3759 14.25 10.9218 14.2969 9.67668 14.4755C8.43156 14.6541 7.49065 14.9217 7.20207 15.2419C6.6757 15.8156 7.46037 16.3758 8.12297 16.4531V16.4503ZM2.38567 12.1664C2.48332 12.6108 3.02043 12.7495 3.53606 12.7495C4.39825 12.7497 5.25973 12.7018 6.11614 12.6061C6.26555 12.5925 6.33489 12.3408 6.18352 12.2264C5.90471 12.0159 5.40227 11.7619 4.71428 11.5673C3.67522 11.2734 3.0761 11.1558 2.56145 11.2537C2.43596 11.2777 2.36955 11.407 2.36174 11.4881C2.3273 11.7139 2.33541 11.9438 2.38567 12.1669V12.1664Z"
                fill={fillColor}
            />
        </Svg>
    );
};

export default Car;
