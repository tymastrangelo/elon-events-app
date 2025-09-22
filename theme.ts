import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Base
  primary: '#73000A', // Elon Maroon
  white: '#FFFFFF',
  black: '#222222',

  // Text
  textPrimary: '#222222',
  textSecondary: '#333333',
  textSubtle: '#666666',
  textMuted: '#888888',

  // Backgrounds
  background: '#FFFFFF',
  card: '#F9F9F9',
  input: '#F3F3F3',
  overlay: 'rgba(250,250,250,0.9)',

  // Accents & States
  accent: '#B59A57', // Elon Gold
  primaryLight: '#F7E6E7', // A light tint of the primary maroon
  destructive: '#FF3B30',
  live: 'red',
  border: '#EEEEEE',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 20,
};

const appTheme = { COLORS, SIZES };

export default appTheme;