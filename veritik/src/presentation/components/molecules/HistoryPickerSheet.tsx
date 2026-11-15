import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { HistoryItem } from '../../../application';
import { container } from '../../composition';
import { shortDate } from '../../content/format';
import { LEVEL_SHORT } from '../../content/labels';
import { levelColors, theme } from '../../theme';
import { Button } from '../atoms/Button';
import { BottomSheet } from './BottomSheet';

interface HistoryPickerSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
}

/** Hoja inferior para elegir un análisis guardado. */
export function HistoryPickerSheet({ visible, title, onClose, onSelect }: HistoryPickerSheetProps) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    void container.getSearchHistory.execute(50).then((list) => {
      if (active) setItems(list);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {items === null && <ActivityIndicator color={theme.colors.primaryAccent} />}
      {items !== null && items.length === 0 && (
        <Text style={styles.empty}>Aún no hay análisis guardados. Analiza una cuenta desde Inicio y vuelve aquí.</Text>
      )}
      {items !== null && items.length > 0 && (
        <ScrollView style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.handle}, puntaje ${item.score}, analizado el ${shortDate(item.analyzedAt)}`}
            >
              <View>
                <Text style={styles.name}>{item.handle}</Text>
                <Text style={styles.date}>Analizado el {shortDate(item.analyzedAt)}</Text>
              </View>
              <Text style={[styles.score, { color: levelColors[item.level].foreground }]}>
                {item.score} · {LEVEL_SHORT[item.level]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Button label="Cancelar" variant="secondary" small onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: { ...theme.typography.bodySmall, color: theme.colors.textOnSheet },
  list: { maxHeight: 320 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    minHeight: theme.sizes.buttonHeight, paddingVertical: theme.spacing.xs,
  },
  name: { ...theme.typography.body, color: theme.colors.textPrimary },
  date: { ...theme.typography.caption, color: theme.colors.textSecondary },
  score: { ...theme.typography.bodySmall, fontFamily: theme.fontFamily.semibold },
});
