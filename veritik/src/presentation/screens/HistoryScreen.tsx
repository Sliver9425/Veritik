import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { HistoryItem } from '../../application';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import { LEVEL_SHORT } from '../content/labels';
import type { TabScreenProps } from '../navigation/types';
import { levelColors, theme } from '../theme';

function getInitials(handle: string): string {
  const clean = handle.replace(/^@+/, '').trim();
  if (!clean) return '?';
  return clean.slice(0, 2).toUpperCase();
}

function formatHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}

export function HistoryScreen({ navigation }: TabScreenProps<'History'>) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [query, setQuery] = useState('');

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

  const filteredItems = useMemo(() => {
    if (!items) return null;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) =>
      item.handle.toLowerCase().includes(trimmed),
    );
  }, [items, query]);

  return (
    <Screen>
      {/* Cabecera con contador */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Historial</Text>
          {items !== null && items.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {items.length} {items.length === 1 ? 'análisis' : 'análisis'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          Consulta los resultados y puntuaciones de tus evaluaciones recientes.
        </Text>
      </View>

      {/* Buscador rápido (solo visible si hay historial) */}
      {items !== null && items.length > 0 && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrar por usuario..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Buscar en el historial"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
            >
              <Text style={styles.clearButton}>✕</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Estado de carga (Skeletons) */}
      {items === null && (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4].map((key) => (
            <Card key={key} style={styles.skeletonCard}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonLines}>
                <View style={styles.skeletonLinePrimary} />
                <View style={styles.skeletonLineSecondary} />
              </View>
              <View style={styles.skeletonPill} />
            </Card>
          ))}
        </View>
      )}

      {/* Estado vacío inicial */}
      {items !== null && items.length === 0 && (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>📊</Text>
          </View>
          <Text style={styles.emptyTitle}>Sin análisis todavía</Text>
          <Text style={styles.emptyDescription}>
            Aún no has analizado ninguna cuenta. Cuando evalúes un perfil, su
            puntuación y diagnóstico aparecerán aquí.
          </Text>
        </Card>
      )}

      {/* Estado vacío tras filtrar */}
      {filteredItems !== null &&
        items !== null &&
        items.length > 0 &&
        filteredItems.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin coincidencias</Text>
            <Text style={styles.emptyDescription}>
              No encontramos ninguna cuenta que coincida con "{query}".
            </Text>
          </Card>
        )}

      {/* Lista de resultados */}
      {filteredItems && filteredItems.length > 0 && (
        <View style={styles.listContainer}>
          {filteredItems.map((item) => {
            const palette = levelColors[item.level];
            const badgeBg =
              'background' in palette && palette.background
                ? palette.background
                : `${palette.foreground}18`;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate('Result', { analysisId: item.id })
                }
                accessibilityRole="button"
                accessibilityLabel={`Ver análisis de ${item.handle}, puntuación ${item.score}, nivel ${LEVEL_SHORT[item.level]}`}
                style={({ pressed }) => [
                  styles.pressableWrapper,
                  pressed && styles.pressedCard,
                ]}
              >
                <Card style={styles.itemCard}>
                  {/* Avatar con iniciales */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: badgeBg,
                        borderColor: `${palette.foreground}35`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: palette.foreground },
                      ]}
                    >
                      {getInitials(item.handle)}
                    </Text>
                  </View>

                  {/* Información de la cuenta */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.handle} numberOfLines={1}>
                      {formatHandle(item.handle)}
                    </Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      Toca para ver el reporte completo
                    </Text>
                  </View>

                  {/* Badge de puntuación y chevron */}
                  <View style={styles.rightContainer}>
                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor: badgeBg,
                          borderColor: `${palette.foreground}30`,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: palette.foreground },
                        ]}
                      />
                      <Text
                        style={[
                          styles.scoreText,
                          { color: palette.foreground },
                        ]}
                      >
                        {item.score} · {LEVEL_SHORT[item.level]}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${theme.colors.textPrimary}10`,
  },
  countText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },

  /* Buscador */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.textPrimary}08`,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}12`,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingLeft: 8,
  },

  /* Lista y tarjetas */
  listContainer: {
    gap: 10,
  },
  pressableWrapper: {
    borderRadius: 16,
  },
  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: theme.sizes.minTouchTarget,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  handle: {
    ...theme.typography.body,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },
  metaText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    fontSize: 12,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textSecondary,
    opacity: 0.6,
    marginLeft: 2,
  },

  /* Estado vacío */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.textPrimary}08`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 26,
  },
  emptyTitle: {
    ...theme.typography.body,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Skeletons de carga */
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    opacity: 0.5,
  },
  skeletonAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${theme.colors.textPrimary}15`,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
  skeletonLinePrimary: {
    height: 14,
    width: '55%',
    borderRadius: 6,
    backgroundColor: `${theme.colors.textPrimary}15`,
  },
  skeletonLineSecondary: {
    height: 10,
    width: '35%',
    borderRadius: 6,
    backgroundColor: `${theme.colors.textPrimary}10`,
  },
  skeletonPill: {
    height: 26,
    width: 74,
    borderRadius: 999,
    backgroundColor: `${theme.colors.textPrimary}15`,
  },
});