import { MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = configureFonts({
  config: {
    fontFamily: 'System',
  },
});

export const DarkTheme = {
  ...MD3DarkTheme,
  roundness: 14,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#00BFA5', // Vibrant Teal
    onPrimary: '#00382E',
    primaryContainer: '#005144',
    onPrimaryContainer: '#70F7DC',

    secondary: '#9D65FF', // Vibrant Purple
    onSecondary: '#2C0064',
    secondaryContainer: '#4B1C96',
    onSecondaryContainer: '#E8DDFF',

    tertiary: '#83D6CB', // Soft Teal
    background: '#0F1216', // Deep Dark
    surface: '#181C22', // Rounded Card Surface
    surfaceVariant: '#222831',
    onSurface: '#E6EAEF',
    onSurfaceVariant: '#A4AFBD',

    outline: '#2F3642',
    outlineVariant: '#222731',
    error: '#FF6B6B',
    onError: '#68000F',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#181C22',
      level2: '#202630',
      level3: '#262D3A',
    },
  },
  fonts: fontConfig,
};
