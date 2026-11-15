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

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const isPremium = useSessionStore((s) => s.isPremium);
  const [username, setUsername] = useState('');
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

  const submit = () => {
    if (!Username.isValid(username)) {
      setError(messageForCode('INVALID_USERNAME'));
      return;
    }
    if (quota !== null && !quota.canAnalyze) {
      setError(messageForCode('QUOTA_EXCEEDED'));
      return;
    }
    setError(null);
    navigation.navigate('Analysis', { username });
  };

  return (
    <Screen>
      <Text style={styles.brand}>Veritik</Text>
      <Text style={styles.title}>¿Qué cuenta quieres revisar?</Text>
      <Text style={styles.subtitle}>Escribe un @usuario y en 30 segundos sabes si vale la pena.</Text>

      <Text style={styles.label}>Usuario de TikTok</Text>
      <View style={[styles.inputRow, error !== null && styles.inputError]}>
        <Text style={styles.at}>@</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="nombre.usuario"
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
          accessibilityLabel="Usuario de TikTok"
        />
      </View>
      {error !== null && <Text style={styles.error}>{error}</Text>}

      <Button label="Analizar cuenta" onPress={submit} />
      <Text style={styles.note}>
        Solo cuentas públicas
        {quota !== null && quota.remaining !== null ? ` · ${quota.remaining} de ${quota.limit} análisis gratis este mes` : ''}
      </Text>

      {recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          <Card>
            {recent.map((item) => (
              <Pressable
                key={item.id}
                style={styles.recentRow}
                onPress={() => navigation.navigate('Result', { analysisId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Ver análisis de ${item.handle}`}
              >
                <Text style={styles.recentName}>{item.handle}</Text>
                <Text style={[styles.recentScore, { color: levelColors[item.level].foreground }]}>
                  {item.score} · {LEVEL_SHORT[item.level]}
                </Text>
              </Pressable>
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { ...theme.typography.h2, color: theme.colors.primaryAccent },
  title: { ...theme.typography.h1, color: theme.colors.textPrimary, marginTop: theme.spacing.md },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
  label: { ...theme.typography.label, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, height: theme.sizes.inputHeight,
    paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  inputError: { borderColor: theme.colors.risk },
  at: { ...theme.typography.bodyLarge, color: theme.colors.primaryAccent },
  input: { flex: 1, ...theme.typography.bodyLarge, color: theme.colors.textPrimary },
  error: { ...theme.typography.bodySmall, color: theme.colors.risk },
  note: { ...theme.typography.label, color: theme.colors.textSecondary, textAlign: 'center' },
  section: { gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
  recentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    minHeight: theme.sizes.minTouchTarget, paddingVertical: theme.spacing.xxs,
  },
  recentName: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
  recentScore: { ...theme.typography.bodySmall, fontFamily: theme.fontFamily.semibold },
});
