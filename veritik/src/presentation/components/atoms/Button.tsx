import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, small = false, style }: ButtonProps) {
  const primary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive }}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        small ? styles.small : styles.regular,
        primary ? styles.primary : styles.secondary,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimaryAction} />
      ) : (
        <Text style={[small ? styles.labelSmall : styles.label, primary ? styles.labelPrimary : styles.labelSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.md },
  regular: { height: theme.sizes.buttonHeight },
  small: { height: theme.sizes.buttonHeightSmall },
  primary: { backgroundColor: theme.colors.primaryAction },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.borderStrong },
  inactive: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
  label: { ...theme.typography.button },
  labelSmall: { ...theme.typography.buttonSmall },
  labelPrimary: { color: theme.colors.onPrimaryAction },
  labelSecondary: { color: theme.colors.textPrimary },
});
