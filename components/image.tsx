import React from 'react';
import {View, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faImage} from '@fortawesome/free-solid-svg-icons';
import colors from '../styles/colors';
import { getAbsoluteURL } from '../utils';

export default function ImageIcon(props) {
  return (
    <View style={props.styles}>
      {props.url ? (
        <Image
          source={{uri: getAbsoluteURL(props.url), width: props.width, height: props.height}}
          style={{resizeMode: 'cover',}}
        />
      ) : (
        <FontAwesomeIcon
          icon={faImage}
          size={props.height}
          color={colors.primary}
        />
      )}
    </View>
  );
}
