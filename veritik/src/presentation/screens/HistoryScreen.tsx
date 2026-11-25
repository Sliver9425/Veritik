import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { HistoryItem } from '../../application';
import type { ScoreLevel } from '../../domain';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import { LEVEL_SHORT } from '../content/labels';
import type { TabScreenProps } from '../navigation/types';
import { levelColors, theme } from '../theme';

type LevelFilter = 'ALL' | ScoreLevel;

const LEVEL_KEYS = Object.keys(LEVEL_SHORT) as ScoreLevel[];

function getInitials(handle: string): string {
  const clean = handle.replace(/^@+/, '').trim();
  if (!clean) return '?';
  return clean.slice(0, 2).toUpperCase();
}

function formatHandle(handle: string): string {
  const clean = handle.replace(/^@+/, '').trim();
  return `@${clean}`;
}

export function HistoryScreen({ navigation }: TabScreenProps<'History'>) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('ALL');

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

    return items.filter((item) => {
      const matchesLevel =
        selectedLevel === 'ALL' || item.level === selectedLevel;
      const matchesQuery =
        trimmed.length === 0 || item.handle.toLowerCase().includes(trimmed);
      return matchesLevel && matchesQuery;
    });
  }, [items, query, selectedLevel]);

  const hasActiveFilters = query.trim().length > 0 || selectedLevel !== 'ALL';

  const resetFilters = () => {
    setQuery('');
    setSelectedLevel('ALL');
  };

  return (
    <Screen>
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Historial</Text>
          {items !== null && items.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countText}>
                {filteredItems && hasActiveFilters
                  ? `${filteredItems.length} de ${items.length}`
                  : `${items.length} ${items.length === 1 ? 'registro' : 'registros'}`}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          Revisa los análisis guardados y accede al detalle de cada evaluación.
        </Text>
      </View>

      {/* Búsqueda y filtros por nivel */}
      {items !== null && items.length > 0 && (
        <View style={styles.controls}>
          <View style={styles.searchBox}>
            <View style={styles.searchIconWrap} aria-hidden>
              <View style={styles.magnifierRing} />
              <View style={styles.magnifierHandle} />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar cuenta por @usuario..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar cuenta en el historial"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.clearBtn,
                  pressed && styles.pressedOpacity,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Limpiar texto de búsqueda"
              >
                <Text style={styles.clearBtnText}>Limpiar</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            <Pressable
              onPress={() => setSelectedLevel('ALL')}
              style={({ pressed }) => [
                styles.filterChip,
                selectedLevel === 'ALL' && styles.filterChipActive,
                pressed && styles.pressedOpacity,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedLevel === 'ALL' }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedLevel === 'ALL' && styles.filterChipTextActive,
                ]}
              >
                Todos
              </Text>
            </Pressable>

            {LEVEL_KEYS.map((lvl) => {
              const active = selectedLevel === lvl;
              const palette = levelColors[lvl];
              return (
                <Pressable
                  key={lvl}
                  onPress={() => setSelectedLevel(active ? 'ALL' : lvl)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    active && {
                      backgroundColor: `${palette.foreground}16`,
                      borderColor: `${palette.foreground}55`,
                    },
                    pressed && styles.pressedOpacity,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: palette.foreground },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      active && {
                        color: palette.foreground,
                        fontFamily: theme.fontFamily.semibold,
                      },
                    ]}
                  >
                    {LEVEL_SHORT[lvl]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Carga */}
      {items === null && (
        <View style={styles.list}>
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} style={styles.skeletonCard}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonCol}>
                <View style={styles.skeletonBarLg} />
                <View style={styles.skeletonBarSm} />
              </View>
              <View style={styles.skeletonBadge} />
            </Card>
          ))}
        </View>
      )}

      {/* Vacío sin historial */}
      {items !== null && items.length === 0 && (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyMark}>
            <View style={styles.emptyBarShort} />
            <View style={styles.emptyBarLong} />
            <View style={styles.emptyBarMid} />
          </View>
          <Text style={styles.emptyTitle}>Aún no hay análisis registrados</Text>
          <Text style={styles.emptyText}>
            Cuando analices una cuenta pública, aparecerá aquí con su
            puntuación y nivel correspondiente.
          </Text>
        </Card>
      )}

      {/* Vacío por filtros */}
      {items !== null &&
        items.length > 0 &&
        filteredItems !== null &&
        filteredItems.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin resultados para este filtro</Text>
            <Text style={styles.emptyText}>
              No se encontraron cuentas que coincidan con tu búsqueda o nivel
              seleccionado.
            </Text>
            {hasActiveFilters && (
              <Pressable
                onPress={resetFilters}
                style={({ pressed }) => [
                  styles.resetFilterBtn,
                  pressed && styles.pressedOpacity,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.resetFilterText}>Restablecer filtros</Text>
              </Pressable>
            )}
          </Card>
        )}

      {/* Lista de análisis */}
      {filteredItems && filteredItems.length > 0 && (
        <View style={styles.list}>
          {filteredItems.map((item) => {
            const palette = levelColors[item.level];
            const badgeBg = palette.background;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate('Result', { analysisId: item.id })
                }
                accessibilityRole="button"
                accessibilityLabel={`Ver análisis de ${item.handle}, puntaje ${item.score}, ${LEVEL_SHORT[item.level]}`}
                style={({ pressed }) => [
                  styles.pressable,
                  pressed && styles.pressedCard,
                ]}
              >
                <Card style={styles.rowCard}>
                  <View
                    style={[
                      styles.leftAccent,
                      { backgroundColor: palette.foreground },
                    ]}
                  />

                  <View style={styles.rowContent}>
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

                    <View style={styles.accountMeta}>
                      <Text style={styles.handle} numberOfLines={1}>
                        {formatHandle(item.handle)}
                      </Text>
                      <Text style={styles.caption} numberOfLines={1}>
                        Ver informe detallado
                      </Text>
                    </View>

                    <View style={styles.scoreBlock}>
                      <View
                        style={[
                          styles.scoreBadge,
                          {
                            backgroundColor: badgeBg,
                            borderColor: `${palette.foreground}30`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreNumber,
                            { color: palette.foreground },
                          ]}
                        >
                          {item.score}
                        </Text>
                        <Text
                          style={[
                            styles.scoreLevel,
                            { color: palette.foreground },
                          ]}
                        >
                          {LEVEL_SHORT[item.level]}
                        </Text>
                      </View>
                      <Text style={styles.arrow} aria-hidden>
                        ›
                      </Text>
                    </View>
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
    gap: theme.spacing.xxs,
    marginBottom: theme.spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
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
  countPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textSecondary,
  },

  controls: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  searchIconWrap: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magnifierRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary,
    position: 'absolute',
    top: 1,
    left: 1,
  },
  magnifierHandle: {
    width: 5,
    height: 1.5,
    backgroundColor: theme.colors.textSecondary,
    position: 'absolute',
    bottom: 2,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    paddingHorizontal: theme.spacing.xxs,
    paddingVertical: 2,
  },
  clearBtnText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.primaryAccent,
  },

  filterChipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: `${theme.colors.primaryAccent}14`,
    borderColor: theme.colors.primaryAccent,
  },
  filterChipText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.primaryAccent,
    fontFamily: theme.fontFamily.semibold,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  list: {
    gap: theme.spacing.xs,
  },
  pressable: {
    borderRadius: theme.radius.md,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  pressedOpacity: {
    opacity: 0.75,
  },
  rowCard: {
    overflow: 'hidden',
    padding: 0,
    minHeight: theme.sizes.minTouchTarget,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
    letterSpacing: 0.4,
  },
  accountMeta: {
    flex: 1,
    gap: 2,
  },
  handle: {
    ...theme.typography.body,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  scoreNumber: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
  },
  scoreLevel: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    opacity: 0.55,
  },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  emptyMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 13,
    gap: 4,
    marginBottom: theme.spacing.xxs,
  },
  emptyBarShort: {
    height: 2,
    width: '45%',
    borderRadius: 1,
    backgroundColor: theme.colors.textSecondary,
  },
  emptyBarLong: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    backgroundColor: theme.colors.primaryAccent,
  },
  emptyBarMid: {
    height: 2,
    width: '75%',
    borderRadius: 1,
    backgroundColor: theme.colors.textSecondary,
  },
  emptyTitle: {
    ...theme.typography.body,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetFilterBtn: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: `${theme.colors.primaryAccent}14`,
    borderWidth: 1,
    borderColor: `${theme.colors.primaryAccent}40`,
  },
  resetFilterText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.primaryAccent,
  },

  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    opacity: 0.65,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
  skeletonCol: {
    flex: 1,
    gap: 6,
  },
  skeletonBarLg: {
    height: 13,
    width: '52%',
    borderRadius: 6,
    backgroundColor: theme.colors.border,
  },
  skeletonBarSm: {
    height: 10,
    width: '32%',
    borderRadius: 6,
    backgroundColor: theme.colors.border,
  },
  skeletonBadge: {
    width: 68,
    height: 26,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
  },
});