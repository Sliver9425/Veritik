import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import { errorMessage } from '../content/labels';
import type { RootScreenProps } from '../navigation/types';
import { useSessionStore } from '../store/useSessionStore';
import { theme } from '../theme';

const STEPS = [
  'Obteniendo el perfil',
  'Revisando los videos recientes',
  'Midiendo la interacción',
  'Calculando el puntaje',
] as const;

export function AnalysisScreen({ navigation, route }: RootScreenProps<'Analysis'>) {
  const { username } = route.params;
  const isPremium = useSessionStore((s) => s.isPremium);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    // Los pasos son orientativos: el avance real depende de la respuesta del origen de datos.
    const timer = setInterval(() => setActiveStep((i) => Math.min(i + 1, STEPS.length - 1)), 1200);

    if (!started.current) {
      started.current = true; // evita lanzar el análisis dos veces (y gastar dos cuotas)
      container.analyzeProfile
        .execute({ username, isPremium })
        .then((result) => {
          if (mounted.current) navigation.replace('Result', { analysisId: result.id });
        })
        .catch((e: unknown) => {
          if (mounted.current) setError(errorMessage(e));
        })
        .finally(() => clearInterval(timer));
    }

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [username, isPremium, navigation]);

  return (
    <Screen scroll={false}>
      <Text style={styles.title}>{error === null ? 'Analizando…' : 'No pudimos completar el análisis'}</Text>
      <Text style={styles.handle}>@{username.trim().replace(/^@+/, '').toLowerCase()}</Text>

      {error === null ? (
        <Card style={styles.steps}>
          {STEPS.map((step, index) => {
            const done = index < activeStep;
            const current = index === activeStep;
            return (
              <View key={step} style={styles.stepRow}>
                {current ? (
                  <ActivityIndicator color={theme.colors.primaryAccent} />
                ) : (
                  <Text style={[styles.mark, done && styles.markDone]}>{done ? '✓' : '○'}</Text>
                )}
                <Text style={[styles.stepText, !done && !current && styles.stepPending]}>{step}</Text>
              </View>
            );
          })}
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
          <Button label="Volver" onPress={() => navigation.goBack()} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h1, color: theme.colors.textPrimary },
  handle: { ...theme.typography.bodyLarge, color: theme.colors.textSecondary },
  steps: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 28 },
  mark: { ...theme.typography.body, width: 20, textAlign: 'center', color: theme.colors.textSecondary },
  markDone: { color: theme.colors.good },
  stepText: { ...theme.typography.body, color: theme.colors.textPrimary },
  stepPending: { color: theme.colors.textSecondary },
  errorText: { ...theme.typography.body, color: theme.colors.textPrimary },
});
