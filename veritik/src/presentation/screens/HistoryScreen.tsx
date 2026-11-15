import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { HistoryItem } from '../../application';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import { LEVEL_SHORT } from '../content/labels';
import type { TabScreenProps } from '../navigation/types';
import { levelColors, theme } from '../theme';

export function HistoryScreen({ navigation }: TabScreenProps<'History'>) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void container.getSearchHistory.execute(50).then((list) => {
        if (active) setItems(list);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen>
      <Text style={styles.title}>Historial</Text>
      {items !== null && items.length === 0 && (
        <Card><Text style={styles.empty}>Aún no has analizado ninguna cuenta. Tus análisis aparecerán aquí.</Text></Card>
      )}
      {items?.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate('Result', { analysisId: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`Ver análisis de ${item.handle}`}
        >
          <Card style={styles.row}>
            <Text style={styles.name}>{item.handle}</Text>
            <Text style={[styles.score, { color: levelColors[item.level].foreground }]}>
              {item.score} · {LEVEL_SHORT[item.level]}
            </Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h1, color: theme.colors.textPrimary },
  empty: { ...theme.typography.body, color: theme.colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: theme.sizes.minTouchTarget },
  name: { ...theme.typography.body, color: theme.colors.textPrimary },
  score: { ...theme.typography.bodySmall, fontFamily: theme.fontFamily.semibold },
});
