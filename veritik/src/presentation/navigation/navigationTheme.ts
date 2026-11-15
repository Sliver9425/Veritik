import { DarkTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { theme } from '../theme';

/** Tema oscuro de React Navigation con los tokens de Veritik. */
export const navigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primaryAccent,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.risk,
  },
};
