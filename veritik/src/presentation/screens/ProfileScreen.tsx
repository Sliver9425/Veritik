import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import type { TabScreenProps } from '../navigation/types';
import { useSessionStore } from '../store/useSessionStore';
import { theme } from '../theme';

/** Perfil y ajustes. Por ahora incluye herramientas de PRUEBA (plan y reinicio de datos). */
export function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const isPremium = useSessionStore((s) => s.isPremium);
  const togglePremium = useSessionStore((s) => s.togglePremium);
  const [resetDone, setResetDone] = useState(false);

  const sourceLabel =
    container.dataSource === 'mock'
      ? 'Ejemplos locales (sin backend)'
      : 'Servidor de análisis';

  const handleResetData = async () => {
    await container.resetLocalData();
    setResetDone(true);
  };

  const handleTogglePremium = () => {
    setResetDone(false);
    togglePremium();
  };

  return (
    <Screen>
      {/* Cabecera con badge de plan */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Perfil</Text>
          <View
            style={[
              styles.planPill,
              isPremium ? styles.planPillPro : styles.planPillFree,
            ]}
          >
            <Text
              style={[
                styles.planPillText,
                isPremium ? styles.planPillTextPro : styles.planPillTextFree,
              ]}
            >
              {isPremium ? 'PREMIUM ACTIVO' : 'PLAN GRATIS'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Gestiona tu modalidad de uso, datos locales y preferencias de la app.
        </Text>
      </View>

      {/* Tarjeta de Plan */}
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.heading}>Plan actual</Text>
          <Text style={styles.modeTag}>Modo prueba</Text>
        </View>

        <View style={styles.planHighlight}>
          <Text style={styles.planHighlightTitle}>
            {isPremium ? 'Análisis ilimitados' : '3 análisis gratis al mes'}
          </Text>
          <Text style={styles.body}>
            {isPremium
              ? 'Puedes revisar cuentas públicas sin límite mensual mientras esté activo.'
              : 'Ideal para probar cuentas públicas; activa el modo de prueba si necesitas más.'}
          </Text>
        </View>

        <Button
          label={
            isPremium
              ? 'Volver al plan gratis (prueba)'
              : 'Probar plan premium (prueba)'
          }
          variant="secondary"
          small
          onPress={handleTogglePremium}
        />
      </Card>

      {/* Tarjeta de Datos y origen */}
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.heading}>Datos y origen</Text>
          <Text style={styles.modeTag}>Prueba</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Origen de perfiles</Text>
          <Text style={styles.infoValue}>{sourceLabel}</Text>
        </View>

        <Text style={styles.body}>
          Si necesitas empezar de cero, puedes borrar el historial guardado y el
          contador mensual de este dispositivo.
        </Text>

        {resetDone && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              Historial y contador reiniciados correctamente.
            </Text>
          </View>
        )}

        <Button
          label="Reiniciar historial y contador"
          variant="secondary"
          small
          onPress={() => void handleResetData()}
        />
      </Card>

      {/* Tarjeta de Bienvenida */}
      <Card style={styles.sectionCard}>
        <Text style={styles.heading}>Bienvenida</Text>
        <Text style={styles.body}>
          Repasa cómo funciona Veritik y qué evalúa en cada cuenta.
        </Text>
        <Button
          label="Ver la introducción otra vez"
          variant="secondary"
          small
          onPress={() => navigation.navigate('Onboarding')}
        />
      </Card>

      {/* Aviso de transparencia */}
      <Card style={styles.disclaimerCard}>
        <Text style={styles.note}>
          Veritik analiza solo señales públicas y entrega estimaciones, no
          acusaciones.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xxs,
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

  planPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: 999,
    borderWidth: 1,
  },
  planPillFree: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
  },
  planPillPro: {
    backgroundColor: `${theme.colors.primaryAccent}18`,
    borderColor: `${theme.colors.primaryAccent}45`,
  },
  planPillText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
  },
  planPillTextFree: {
    color: theme.colors.textSecondary,
  },
  planPillTextPro: {
    color: theme.colors.primaryAccent,
  },

  sectionCard: {
    gap: theme.spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  modeTag: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.md,
  },

  planHighlight: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 2,
  },
  planHighlightTitle: {
    ...theme.typography.body,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },

  feedbackBox: {
    backgroundColor: `${theme.colors.primaryAccent}15`,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  feedbackText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.primaryAccent,
  },

  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: theme.colors.surface,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});