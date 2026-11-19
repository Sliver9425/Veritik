import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { container } from '../composition';
import type { TabScreenProps } from '../navigation/types';
import { useSessionStore } from '../store/useSessionStore';
import { theme } from '../theme';

type SubscriptionDetailKey = 'modality' | 'limits';

export function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const isPremium = useSessionStore((s) => s.isPremium);
  const togglePremium = useSessionStore((s) => s.togglePremium);

  const [expandedDetail, setExpandedDetail] =
    useState<SubscriptionDetailKey | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const sourceLabel =
    container.dataSource === 'mock'
      ? 'Datos de ejemplo (local)'
      : 'Servidor de análisis';

  const limitsLabel = isPremium ? 'Ilimitados' : 'Hasta 3 al mes';

  const modalityReason = isPremium
    ? 'Sí está activa la modalidad Premium en este entorno de prueba, por lo que no se aplica el límite mensual del plan gratuito.'
    : 'No está activo el plan Premium; la cuenta funciona actualmente bajo la modalidad gratuita de prueba.';

  const limitsReason = isPremium
    ? 'No hay restricción mensual: el plan gratuito incluye hasta 3 análisis mensuales, pero con Premium activo puedes realizar análisis ilimitados.'
    : 'El plan gratuito incluye hasta 3 análisis mensuales para controlar el uso de prueba; al alcanzar el límite, se bloquean nuevas consultas gratuitas hasta el próximo ciclo o hasta activar Premium.';

  const toggleDetail = (key: SubscriptionDetailKey) => {
    setExpandedDetail((current) => (current === key ? null : key));
  };

  const handleTogglePremium = () => {
    setConfirmReset(false);
    setResetDone(false);
    togglePremium();
  };

  const handleConfirmReset = async () => {
    await container.resetLocalData();
    setConfirmReset(false);
    setResetDone(true);
  };

  return (
    <Screen>
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Perfil</Text>
          <View
            style={[
              styles.planBadge,
              isPremium ? styles.planBadgePro : styles.planBadgeFree,
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                isPremium ? styles.planBadgeTextPro : styles.planBadgeTextFree,
              ]}
            >
              {isPremium ? 'Premium' : 'Gratis'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Configuración de suscripción, datos locales y guía de uso.
        </Text>
      </View>

      {/* Suscripción: modalidad, límites y activar premium */}
      <Card style={styles.card}>
        <Text style={styles.heading}>Suscripción</Text>

        <View style={styles.listBox}>
          <Pressable
            onPress={() => toggleDetail('modality')}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedDetail === 'modality' }}
          >
            <Text style={styles.rowLabel}>Modalidad</Text>
            <View style={styles.rowValueWrap}>
              <Text style={styles.rowValue}>
                {isPremium ? 'Premium' : 'Gratuita'}
              </Text>
              <Text style={styles.chevron}>
                {expandedDetail === 'modality' ? '⌄' : '›'}
              </Text>
            </View>
          </Pressable>

          {expandedDetail === 'modality' && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonTitle}>
                {isPremium ? 'Por qué sí' : 'Por qué no'}
              </Text>
              <Text style={styles.reasonText}>{modalityReason}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Pressable
            onPress={() => toggleDetail('limits')}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedDetail === 'limits' }}
          >
            <Text style={styles.rowLabel}>Límites</Text>
            <View style={styles.rowValueWrap}>
              <Text
                style={[
                  styles.rowValue,
                  isPremium && { color: theme.colors.primaryAccent },
                ]}
              >
                {limitsLabel}
              </Text>
              <Text style={styles.chevron}>
                {expandedDetail === 'limits' ? '⌄' : '›'}
              </Text>
            </View>
          </Pressable>

          {expandedDetail === 'limits' && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonTitle}>
                {isPremium ? 'Sin límite activo' : 'Límite de 3 mensuales'}
              </Text>
              <Text style={styles.reasonText}>{limitsReason}</Text>
            </View>
          )}
        </View>

        <Button
          label={
            isPremium
              ? 'Desactivar premium (prueba)'
              : 'Activar premium (prueba)'
          }
          variant="secondary"
          small
          onPress={handleTogglePremium}
        />
      </Card>

      {/* Datos y almacenamiento local */}
      <Card style={styles.card}>
        <Text style={styles.heading}>Datos y almacenamiento</Text>

        <View style={styles.listBox}>
          <View style={styles.rowStatic}>
            <Text style={styles.rowLabel}>Fuente de perfiles</Text>
            <Text style={styles.rowValue}>{sourceLabel}</Text>
          </View>
        </View>

        <Text style={styles.body}>
          Reiniciar borra el historial guardado y restablece el contador mensual
          en este dispositivo.
        </Text>

        {resetDone && (
          <Text style={styles.confirmNotice}>
            Historial y contador reiniciados.
          </Text>
        )}

        {!confirmReset ? (
          <Button
            label="Reiniciar historial y contador"
            variant="secondary"
            small
            onPress={() => {
              setResetDone(false);
              setConfirmReset(true);
            }}
          />
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              ¿Confirmas eliminar el historial y reiniciar el contador mensual?
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                onPress={() => setConfirmReset(false)}
                style={({ pressed }) => [
                  styles.btnCancel,
                  pressed && styles.rowPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleConfirmReset()}
                style={({ pressed }) => [
                  styles.btnConfirm,
                  pressed && styles.rowPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.btnConfirmText}>Reiniciar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Card>

      {/* Guía de uso */}
      <Card style={styles.card}>
        <Text style={styles.heading}>Guía de uso</Text>
        <Text style={styles.body}>
          Vuelve a revisar la introducción inicial de la aplicación.
        </Text>
        <Button
          label="Ver introducción"
          variant="secondary"
          small
          onPress={() => navigation.navigate('Onboarding')}
        />
      </Card>

      <Text style={styles.footer}>
        Veritik analiza solo señales públicas y entrega estimaciones, no
        acusaciones.
      </Text>
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

  planBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: 999,
    borderWidth: 1,
  },
  planBadgeFree: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
  },
  planBadgePro: {
    backgroundColor: `${theme.colors.primaryAccent}14`,
    borderColor: `${theme.colors.primaryAccent}45`,
  },
  planBadgeText: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
  },
  planBadgeTextFree: {
    color: theme.colors.textSecondary,
  },
  planBadgeTextPro: {
    color: theme.colors.primaryAccent,
  },

  card: {
    gap: theme.spacing.xs,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  listBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.sizes.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  rowStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },
  chevron: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },

  reasonBox: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 2,
  },
  reasonTitle: {
    ...theme.typography.label,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.primaryAccent,
  },
  reasonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  confirmNotice: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.primaryAccent,
  },
  confirmBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  confirmText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    lineHeight: 19,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
  btnCancel: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  btnCancelText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.textSecondary,
  },
  btnConfirm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.risk}55`,
    backgroundColor: `${theme.colors.risk}16`,
  },
  btnConfirmText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.risk,
  },

  footer: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});