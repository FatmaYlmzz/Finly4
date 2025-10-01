import { Colors } from './colors';
import { Typography } from './typ';

export const theme = (mode = 'light') => ({
  colors: Colors[mode],
  typography: Typography,
});
