import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { HistoryItem, QuotaStatus } from '../../application';
import { Username } from '../../domain';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import { LEVEL_SHORT, messageForCode } from '../content/labels';
import type { TabScreenProps } from '../navigation/types';
import { useSessionStore } from '../store/useSessionStore';
import { levelColors, theme } from '../theme';

function getInitials(handle: string): string {
  const clean = handle.replace(/^@+/, '').trim();
  if (!clean) return '?';
  return clean.slice(0, 2).toUpperCase();
}

function formatHandle(handle: string): string {
  const clean = handle.replace(/^@+/, '').trim();
  return `@${clean}`;
}

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const isPremium = useSessionStore((s) => s.isPremium);
  const [username, setUsername] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  // Se recarga cada vez que la pantalla vuelve a estar visible (p. ej. al regresar de un análisis).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [nextQuota, nextRecent] = await Promise.all([
          container.checkFreeQuota.execute({ isPremium }),
          container.getSearchHistory.execute(3),
        ]);
        if (active) {
          setQuota(nextQuota);
          setRecent(nextRecent);
        }
      })();
      return () => {
        active = false;
      };
    }, [isPremium]),
  );

  const handleUsernameChange = (text: string) => {
    const normalized = text.replace(/^@+/, '').replace(/\s+/g, '');
    setUsername(normalized);
    if (error !== null) {
      setError(null);
    }
  };

  const submit = () => {
    const candidate = username.trim();
    if (!Username.isValid(candidate)) {
      setError(messageForCode('INVALID_USERNAME'));
      return;
    }
    if (quota !== null && !quota.canAnalyze) {
      setError(messageForCode('QUOTA_EXCEEDED'));
      return;
    }
    setError(null);
    navigation.navigate('Analysis', { username: candidate });
  };

  const showFreeQuota =
    !isPremium &&
    quota !== null &&
    quota.remaining !== null &&
    quota.limit !== null &&
    quota.limit > 0;

  const remainingRatio = showFreeQuota
    ? Math.max(0, Math.min(1, quota.remaining! / quota.limit!))
    : 0;

  return (
    <Screen>
      {/* Top bar de marca y estado */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>Veritik</Text>
        {isPremium ? (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        ) : (
          <Text style={styles.publicChip}>Cuentas públicas</Text>
        )}
      </View>

      {/* Propuesta de valor directa */}
      <View style={styles.hero}>
        <Text style={styles.title}>¿Qué cuenta quieres revisar?</Text>
        <Text style={styles.subtitle}>
          Escribe un @usuario de TikTok y obtén un diagnóstico claro en segundos.
        </Text>
      </View>

      {/* Bloque principal de búsqueda */}
      <Card style={styles.searchCard}>
        <Text style={styles.label}>Usuario de TikTok</Text>

        <View
          style={[
            styles.inputRow,
            focused && styles.inputFocused,
            error !== null && styles.inputError,
          ]}
        >
          <Text style={styles.at}>@</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="nombre.usuario"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={submit}
            accessibilityLabel="Usuario de TikTok"
          />
          {username.length > 0 && (
            <Pressable
              onPress={() => {
                setUsername('');
                setError(null);
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Borrar usuario"
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>

        {error !== null && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>!</Text>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        <Button label="Analizar cuenta" onPress={submit} />

        {/* Indicador de cuota gratuita */}
        {showFreeQuota && (
          <View style={styles.quotaContainer}>
            <View style={styles.quotaHeader}>
              <Text style={styles.note}>Análisis gratis este mes</Text>
              <Text style={styles.quotaCount}>
                {quota.remaining} de {quota.limit}
              </Text>
            </View>
            <View style={styles.quotaTrack}>
              <View
                style={[
                  styles.quotaFill,
                  {
                    width: `${remainingRatio * 100}%`,
                    backgroundColor:
                      quota.remaining === 0
                        ? theme.colors.risk
                        : theme.colors.primaryAccent,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </Card>

      {/* Análisis recientes */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <Pressable
              onPress={() => navigation.navigate('History')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Ver todo el historial"
            >
              <Text style={styles.seeAll}>Ver todo ›</Text>
            </Pressable>
          </View>

          <Card style={styles.recentCard}>
            {recent.map((item, index) => {
              const palette = levelColors[item.level];
              const isLast = index === recent.length - 1;

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.recentRow,
                    !isLast && styles.rowDivider,
                    pressed && styles.pressedRow,
                  ]}
                  onPress={() =>
                    navigation.navigate('Result', { analysisId: item.id })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Ver análisis de ${item.handle}`}
                >
                  <View style={styles.recentLeft}>
                    <View
                      style={[
                        styles.miniAvatar,
                        { backgroundColor: `${palette.foreground}18` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniAvatarText,
                          { color: palette.foreground },
                        ]}
                      >
                        {getInitials(item.handle)}
                      </Text>
                    </View>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {formatHandle(item.handle)}
                    </Text>
                  </View>

                  <View style={styles.recentRight}>
                    <View
                      style={[
                        styles.scorePill,
                        { backgroundColor: `${palette.foreground}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.recentScore,
                          { color: palette.foreground },
                        ]}
                      >
                        {item.score} · {LEVEL_SHORT[item.level]}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    ...theme.typography.h2,
    color: theme.colors.primaryAccent,
  },
  publicChip: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  proBadge: {
    backgroundColor: `${theme.colors.primaryAccent}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.md,
  },
  proBadgeText: {
    ...theme.typography.label,
    color: theme.colors.primaryAccent,
    fontFamily: theme.fontFamily.semibold,
  },

  hero: {
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  searchCard: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    height: theme.sizes.inputHeight,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputFocused: {
    borderColor: theme.colors.primaryAccent,
  },
  inputError: {
    borderColor: theme.colors.risk,
  },
  at: {
    ...theme.typography.bodyLarge,
    color: theme.colors.primaryAccent,
    fontFamily: theme.fontFamily.semibold,
  },
  input: {
    flex: 1,
    ...theme.typography.bodyLarge,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.textSecondary}20`,
  },
  clearText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.risk}14`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  errorIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.risk,
    backgroundColor: `${theme.colors.risk}25`,
  },
  error: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.risk,
  },

  quotaContainer: {
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.xxs,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  note: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  quotaCount: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    fontFamily: theme.fontFamily.semibold,
  },
  quotaTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 999,
  },

  section: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  seeAll: {
    ...theme.typography.bodySmall,
    color: theme.colors.primaryAccent,
    fontFamily: theme.fontFamily.semibold,
  },
  recentCard: {
    paddingVertical: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: theme.sizes.minTouchTarget,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxs,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pressedRow: {
    opacity: 0.75,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
  },
  recentName: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fontFamily.semibold,
    flexShrink: 1,
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  scorePill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: 999,
  },
  recentScore: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    opacity: 0.6, 
  },
});