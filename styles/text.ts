import {Appearance} from 'react-native';

const background = {
    color: Appearance.getColorScheme() === 'dark' ? '#333' : 'white',
  };

const text = {
    color: Appearance.getColorScheme() === 'dark' ? 'white' : 'black',
  };

const label = {
  fontSize: 18,
  fontWeight: 'bold',
  ...text,
  marginBottom: 8,
};


const paragraph = {
    ...text, 
};

const heading = {
    fontSize: 28,
    marginBottom: 12,
    ...text
}

const title = {
    fontSize: 24,
    marginBottom: 8,
    ...text
};

const subTitle = {
    fontSize: 18,
    marginBottom: 6,
    ...text

};


export {label, text, paragraph, title, subTitle, background}
