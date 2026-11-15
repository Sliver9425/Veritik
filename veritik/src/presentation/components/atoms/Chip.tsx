import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface ChipProps {
  label: string;
  foreground: string;
  background: string;
}

/** Etiqueta de estado. Siempre lleva texto: el significado nunca depende solo del color. */
export function Chip({ label, foreground, background }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 14, borderRadius: theme.radius.pill },
  text: { ...theme.typography.label, fontFamily: theme.fontFamily.semibold },
});
