import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/atoms/Button';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import type { RootScreenProps } from '../navigation/types';
import { theme } from '../theme';

const STEPS = [
  { icon: 'at-outline', title: 'Escribe un @usuario', text: 'Ingresa el nombre de cualquier cuenta pública de TikTok que quieras revisar.' },
  { icon: 'analytics-outline', title: 'Analizamos señales públicas', text: 'Medimos interacción, vistas, comentarios y frecuencia de publicación. No necesitamos tu contraseña.' },
  { icon: 'shield-checkmark-outline', title: 'Decide con datos', text: 'Recibes un puntaje de 0 a 100 y el detalle de cada señal. Es una estimación, no una acusación.' },
] as const;

export function OnboardingScreen({ navigation }: RootScreenProps<'Onboarding'>) {
  const [step, setStep] = useState(0);
  const current = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    await container.completeOnboarding.execute();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };
  const next = () => {
    if (isLast) void finish();
    else setStep((s) => s + 1);
  };

  return (
    <Screen scroll={false}>
      <View style={styles.top}>
        <Text style={styles.brand}>Veritik</Text>
        {!isLast && (
          <Pressable onPress={() => void finish()} style={styles.skip} accessibilityRole="button" accessibilityLabel="Saltar introducción">
            <Text style={styles.skipText}>Saltar</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name={current.icon} size={72} color={theme.colors.primaryAccent} />
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.text}>{current.text}</Text>
      </View>

      <View style={styles.dots} accessible accessibilityLabel={`Paso ${step + 1} de ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
      <Button label={isLast ? 'Empezar' : 'Siguiente'} onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { ...theme.typography.h2, color: theme.colors.primaryAccent },
  skip: { minHeight: theme.sizes.minTouchTarget, minWidth: theme.sizes.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  skipText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  iconCircle: {
    width: 148, height: 148, borderRadius: 74, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
  },
  title: { ...theme.typography.h1, color: theme.colors.textPrimary, textAlign: 'center', marginTop: theme.spacing.md },
  text: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { width: 24, backgroundColor: theme.colors.primaryAccent },
});
