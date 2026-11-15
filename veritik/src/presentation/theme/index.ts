import { colors, levelColors, statusColors } from './colors';
import { motion } from './motion';
import { layout, radius, sizes, spacing } from './spacing';
import { fontFamily, typography } from './typography';

export const theme = {
  colors,
  statusColors,
  levelColors,
  fontFamily,
  typography,
  spacing,
  radius,
  sizes,
  layout,
  motion,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './motion';
