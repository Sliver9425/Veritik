import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

/** Encabezado de pantallas secundarias: flecha de volver + título (las cabeceras nativas están ocultas). */
export function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Volver" style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={theme.colors.textPrimary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  back: { width: theme.sizes.minTouchTarget, height: theme.sizes.minTouchTarget, alignItems: 'flex-start', justifyContent: 'center' },
  title: { ...theme.typography.h2, color: theme.colors.textPrimary, flex: 1 },
});
