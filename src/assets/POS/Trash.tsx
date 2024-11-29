import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

interface TrashIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const Trash: React.FC<TrashIconProps> = ({ width = 40, height = 40, fill = '#8A20EC' }) => {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 60 60" fill="none">
        <Path
          d="M52.4473 11.25H39.375V5.625C39.375 5.12772 39.1775 4.65081 38.8258 4.29917C38.4742 3.94754 37.9973 3.75 37.5 3.75H22.5C22.0027 3.75 21.5258 3.94754 21.1742 4.29917C20.8225 4.65081 20.625 5.12772 20.625 5.625V11.25H7.55273L7.5 15.9375H11.3672L13.7215 52.7344C13.7811 53.6859 14.2009 54.5791 14.8955 55.2322C15.5902 55.8852 16.5075 56.2492 17.4609 56.25H42.5391C43.492 56.2499 44.4091 55.887 45.1041 55.2351C45.7991 54.5832 46.2198 53.6912 46.2809 52.7402L48.6328 15.9375H52.5L52.4473 11.25ZM20.625 48.75L19.5703 18.75H23.4375L24.4922 48.75H20.625ZM31.875 48.75H28.125V18.75H31.875V48.75ZM34.6875 11.25H25.3125V7.96875C25.3125 7.84443 25.3619 7.7252 25.4498 7.63729C25.5377 7.54939 25.6569 7.5 25.7812 7.5H34.2188C34.3431 7.5 34.4623 7.54939 34.5502 7.63729C34.6381 7.7252 34.6875 7.84443 34.6875 7.96875V11.25ZM39.375 48.75H35.5078L36.5625 18.75H40.4297L39.375 48.75Z"
          fill={fill}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Trash;
