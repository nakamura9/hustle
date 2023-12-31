import React from 'react';
import {Text, Pressable, View, StyleSheet, Image} from 'react-native';
import colors from '../../styles/colors';
import {shadow, text} from '../../styles/inputs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faImage,
  faHeart,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

const SquareBundleButton = function (props) {
  const navigator = useNavigation();

  return (
    <Pressable
      onPress={() => {
        navigator.navigate('Bundle', {bundle: props.id});
      }}>
      <View style={styles.square}>
        {props.url ? (
          <Image source={{uri: props.url, width: 75, height: 75, zIndex: 1}} />
        ) : (
          <FontAwesomeIcon icon={faImage} size={30} color={colors.primary} />
        )}
        {props.price && (
          <View style={styles.price}>
            <Text>{props.price}</Text>
          </View>
        )}
      </View>
      {props.name && <Text style={styles.text}>{props.name}</Text>}
      {props.actions && <Actions />}
    </Pressable>
  );
};

const Actions = props => {
  return (
    <View style={styles.row}>
      <View style={styles.wishlist}>
        <FontAwesomeIcon icon={faHeart} size={20} color={'white'} />
      </View>
      <View style={styles.addToCart}>
        <FontAwesomeIcon icon={faShoppingCart} size={20} color={'white'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: 100,
    gap: 4,
    padding: 4,
  },
  wishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'crimson',
    padding: 4,
    borderRadius: 4,
  },
  addToCart: {
    flex: 2,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 4,
    alignItems: 'center',
    borderRadius: 4,
  },
  square: {
    width: 76,
    height: 76,
    borderRadius: 12.5,
    ...shadow,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
    overflow: "hidden"
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    ...text,
    textAlign: 'center',
    width: 100,
  },
  price: {
    zIndex: 100,
    ...text,
    position: 'absolute',
    bottom: 0,
    padding: 4,
    opacity: 0.75,
  },
});

export {SquareBundleButton};
