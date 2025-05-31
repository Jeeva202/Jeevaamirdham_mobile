import { DefaultTheme, configureFonts } from 'react-native-paper';

const customTheme = {
  ...DefaultTheme,
  colors: {
    primary: '#E68E00', // #F7A500
    onPrimary: 'rgb(255, 255, 255)', // White
    primaryContainer: 'rgb(255, 224, 178)', // Light orange
    onPrimaryContainer: 'rgb(66, 45, 0)', // Dark orange
    secondary: 'rgb(204, 204, 204)', // #CCCCCC (light grey)
    onSecondary: 'rgb(255, 255, 255)', // White
    secondaryContainer: 'rgb(255, 224, 178)', // Light orange
    onSecondaryContainer: 'rgb(51, 51, 51)', // Dark grey
    background: 'rgb(245, 245, 245)', // #F5F5F5 (light grey)
    onBackground: 'rgb(0, 0, 0)', // #000000 (black)
    surface: 'rgb(255, 255, 255)', // #FFFFFF (white)
    onSurface: 'rgb(0, 0, 0)', // #000000 (black)
    surfaceVariant: 'rgb(245, 245, 245)', // #F5F5F5 (light grey)
    onSurfaceVariant: 'rgb(153, 153, 153)', // #999999 (placeholder)
    outline: 'rgb(204, 204, 204)', // #CCCCCC (light grey)
    outlineVariant: 'rgb(224, 224, 224)', // Light grey
    shadow: 'rgb(0, 0, 0)', // Black
    scrim: 'rgb(0, 0, 0)', // Black
    inverseSurface: 'rgb(50, 47, 51)', // Keep as is (optional)
    inverseOnSurface: 'rgb(245, 239, 244)', // Keep as is (optional)
    inversePrimary: 'rgb(255, 209, 128)', // Light orange
    elevation: {
      level0: 'transparent',
      level1: 'rgb(250, 250, 250)', // Light grey
      level2: 'rgb(245, 245, 245)', // Light grey
      level3: 'rgb(240, 240, 240)', // Light grey
      level4: 'rgb(238, 238, 238)', // Light grey
      level5: 'rgb(235, 235, 235)', // Light grey
    },
    surfaceDisabled: 'rgba(0, 0, 0, 0.12)', // Black with opacity
    onSurfaceDisabled: 'rgba(0, 0, 0, 0.38)', // Black with opacity
    backdrop: 'rgba(51, 47, 55, 0.4)', // Keep as is (optional)
  },

};

export default customTheme;