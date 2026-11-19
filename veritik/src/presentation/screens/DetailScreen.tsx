import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/molecules/BackHeader';
import { BottomSheet } from '../components/molecules/BottomSheet';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Chip } from '../components/atoms/Chip';
import { Screen } from '../components/atoms/Screen';
import { STATUS_TEXT } from '../content/labels';
import { SIGNAL_COPY, UNAVAILABLE_EXPLANATION } from '../content/signalCopy';
import { useAnalysisDetail } from '../hooks/useAnalysisDetail';
import type { RootScreenProps } from '../navigation/types';
import { statusColors, theme } from '../theme';
import type { Signal } from '../../domain';

export function DetailScreen({ navigation, route }: RootScreenProps<'Detail'>) {
  const { result, error, loading } = useAnalysisDetail(route.params.analysisId);
  const [selected, setSelected] = useState<Signal | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const goBack = () => navigation.goBack();

  const openSheet = (signal: Signal) => {
    setSelected(signal); // se conserva al cerrar para que el contenido no desaparezca durante la animación de salida
    setSheetVisible(true);
  };
  const closeSheet = () => setSheetVisible(false);

  const selectedCopy = selected === null ? null : SIGNAL_COPY[selected.id];
  const selectedStatus = selected?.status ?? null;

  return (
    <>
      <Screen>
        <BackHeader title="Detalle de señales" onBack={goBack} />

        {loading && <ActivityIndicator color={theme.colors.primaryAccent} style={styles.loader} />}
        {!loading && result === null && <Card><Text style={styles.body}>{error ?? 'No encontramos ese análisis.'}</Text></Card>}

        {result !== null && (
          <>
            <Text style={styles.hint}>Toca una señal para ver cómo se calcula.</Text>
            {result.signals.map((signal) => {
              const copy = SIGNAL_COPY[signal.id];
              const status = signal.status;
              return (
                <Pressable
                  key={signal.id}
                  onPress={() => openSheet(signal)}
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.label}. Ver cómo se calcula`}
                >
                  <Card>
                    <View style={styles.rowTop}>
                      <View style={styles.flex}>
                        <Text style={styles.name}>{copy.label}</Text>
                        <Text style={styles.value}>{signal.rawValue === null ? '—' : copy.format(signal.rawValue)}</Text>
                      </View>
                      {status === null ? (
                        <Chip label="Sin datos" foreground={theme.colors.textSecondary} background={theme.colors.surfaceElevated} />
                      ) : (
                        <Chip label={STATUS_TEXT[status]} foreground={statusColors[status].foreground} background={statusColors[status].background} />
                      )}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
            <Text style={styles.footer}>
              El puntaje es una estimación basada en señales públicas, no una acusación. Los umbrales aún se están calibrando.
            </Text>
          </>
        )}
      </Screen>

      <BottomSheet visible={sheetVisible} onClose={closeSheet} title={selectedCopy === null ? '' : `¿Cómo se calcula "${selectedCopy.label}"?`}>
        {selected !== null && selectedCopy !== null && (
          <>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetValue}>{selected.rawValue === null ? 'Sin datos' : selectedCopy.format(selected.rawValue)}</Text>
              {selectedStatus !== null && (
                <Chip label={STATUS_TEXT[selectedStatus]} foreground={statusColors[selectedStatus].foreground} background={statusColors[selectedStatus].background} />
              )}
            </View>
            <Text style={styles.sheetText}>{selectedStatus === null ? UNAVAILABLE_EXPLANATION : selectedCopy.explanation}</Text>
            <Button label="Entendido" onPress={closeSheet} />
          </>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: theme.spacing.xxl },
  body: { ...theme.typography.body, color: theme.colors.textPrimary },
  hint: { ...theme.typography.label, color: theme.colors.textSecondary },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm, minHeight: theme.sizes.minTouchTarget },
  flex: { flex: 1 },
  name: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
  value: { ...theme.typography.caption, color: theme.colors.textSecondary },
  footer: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.xs },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetValue: { ...theme.typography.metric, color: theme.colors.textPrimary },
  sheetText: { ...theme.typography.bodySmall, color: theme.colors.textOnSheet },
});
 