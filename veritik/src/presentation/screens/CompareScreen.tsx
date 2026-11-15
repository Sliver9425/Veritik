import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { HistoryItem } from '../../application';
import type { AnalysisResult, ComparisonVerdict, Signal } from '../../domain';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Chip } from '../components/atoms/Chip';
import { Screen } from '../components/atoms/Screen';
import { HistoryPickerSheet } from '../components/molecules/HistoryPickerSheet';
import { shortDate } from '../content/format';
import { LEVEL_TEXT, STATUS_TEXT } from '../content/labels';
import { SIGNAL_COPY } from '../content/signalCopy';
import { useComparison } from '../hooks/useComparison';
import type { TabScreenProps } from '../navigation/types';
import { levelColors, statusColors, theme } from '../theme';

type Slot = 'first' | 'second';

/** "@usuario · 15/11": la fecha distingue dos análisis de la misma cuenta (evolución). */
function displayName(result: AnalysisResult): string {
  return `${result.profile.username.handle} · ${shortDate(result.analyzedAt)}`;
}

export function CompareScreen({ navigation, route }: TabScreenProps<'Compare'>) {
  const [firstId, setFirstId] = useState<string | null>(null);
  const [secondId, setSecondId] = useState<string | null>(null);
  const [picking, setPicking] = useState<Slot | null>(null);
  const { data, error, loading } = useComparison(firstId, secondId);

  // Llega un análisis desde el botón "Comparar" del resultado.
  const incomingId = route.params?.firstId;
  useEffect(() => {
    if (incomingId !== undefined) {
      setFirstId(incomingId);
      navigation.setParams({ firstId: undefined });
    }
  }, [incomingId, navigation]);

  const select = (item: HistoryItem) => {
    if (picking === 'first') setFirstId(item.id);
    if (picking === 'second') setSecondId(item.id);
    setPicking(null);
  };

  return (
    <Screen>
      <Text style={styles.title}>Comparar</Text>
      <Text style={styles.subtitle}>Elige dos análisis guardados para verlos lado a lado. También sirve para ver la evolución de una misma cuenta.</Text>

      <View style={styles.row}>
        <SlotCard label="Cuenta A" result={data?.first ?? null} chosen={firstId !== null} onPress={() => setPicking('first')} />
        <SlotCard label="Cuenta B" result={data?.second ?? null} chosen={secondId !== null} onPress={() => setPicking('second')} />
      </View>

      {loading && <ActivityIndicator color={theme.colors.primaryAccent} />}
      {error !== null && <Card><Text style={styles.body}>{error}</Text></Card>}

      {data !== null && (
        <>
          <Card>
            <Text style={styles.heading}>{verdictText(data.comparison.verdict, data.first, data.second)}</Text>
            {data.comparison.commonSignalCount > 0 ? (
              <Text style={styles.note}>
                Comparación sobre {data.comparison.commonSignalCount} señal(es) disponibles en ambas cuentas · puntaje A {data.comparison.commonFirstScore} · B {data.comparison.commonSecondScore}.
              </Text>
            ) : (
              <Text style={styles.note}>Ninguna señal está disponible en ambas cuentas, así que no hay base para compararlas.</Text>
            )}
          </Card>

          {data.comparison.signals.map((item) => {
            const copy = SIGNAL_COPY[item.id];
            return (
              <Card key={item.id}>
                <View style={styles.signalHeader}>
                  <Text style={styles.signalName}>{copy.label}</Text>
                  <Text style={styles.signalVerdict}>{signalVerdictText(item.verdict)}</Text>
                </View>
                <View style={styles.row}>
                  <SignalSide title="A" signal={item.first} format={copy.format} best={item.verdict === 'first'} />
                  <SignalSide title="B" signal={item.second} format={copy.format} best={item.verdict === 'second'} />
                </View>
              </Card>
            );
          })}
          <Text style={styles.footer}>Es una comparación de estimaciones basada en señales públicas, no un veredicto sobre las personas.</Text>
        </>
      )}

      <HistoryPickerSheet
        visible={picking !== null}
        title={picking === 'second' ? 'Elige la cuenta B' : 'Elige la cuenta A'}
        onClose={() => setPicking(null)}
        onSelect={select}
      />
    </Screen>
  );
}

function verdictText(verdict: ComparisonVerdict, first: AnalysisResult, second: AnalysisResult): string {
  if (verdict === 'first') return `${displayName(first)} muestra señales más favorables.`;
  if (verdict === 'second') return `${displayName(second)} muestra señales más favorables.`;
  if (verdict === 'tie') return 'Las dos cuentas tienen señales parejas.';
  return 'No hay suficientes señales en común para decidir.';
}

function signalVerdictText(verdict: ComparisonVerdict): string {
  if (verdict === 'first') return 'Mejor: A';
  if (verdict === 'second') return 'Mejor: B';
  if (verdict === 'tie') return 'Parejas';
  return 'Sin datos de ambas';
}

function SlotCard({ label, result, chosen, onPress }: { label: string; result: AnalysisResult | null; chosen: boolean; onPress: () => void }) {
  return (
    <Card style={styles.slot}>
      <Text style={styles.slotLabel}>{label}</Text>
      {result !== null ? (
        <>
          <Text style={styles.slotName} numberOfLines={1}>{result.profile.username.handle}</Text>
          <Text style={styles.slotDate}>{shortDate(result.analyzedAt)}</Text>
          <Text style={[styles.slotScore, { color: levelColors[result.level].foreground }]}>{result.score.value}</Text>
          <Chip label={LEVEL_TEXT[result.level]} foreground={levelColors[result.level].foreground} background={levelColors[result.level].background} />
        </>
      ) : (
        <Text style={styles.slotEmpty}>{chosen ? 'Cargando…' : 'Sin elegir'}</Text>
      )}
      <Button label={chosen ? 'Cambiar' : 'Elegir'} variant="secondary" small onPress={onPress} />
    </Card>
  );
}

function SignalSide({ title, signal, format, best }: { title: string; signal: Signal | undefined; format: (raw: number) => string; best: boolean }) {
  const status = signal?.status ?? null;
  return (
    <View style={styles.side}>
      <Text style={styles.sideTitle}>Cuenta {title}</Text>
      <Text style={styles.sideValue}>{signal?.rawValue == null ? '—' : format(signal.rawValue)}</Text>
      {status === null ? (
        <Chip label="Sin datos" foreground={theme.colors.textSecondary} background={theme.colors.surfaceElevated} />
      ) : (
        <Chip label={STATUS_TEXT[status]} foreground={statusColors[status].foreground} background={statusColors[status].background} />
      )}
      {best && <Chip label="Mejor" foreground={theme.colors.good} background={theme.colors.goodSurface} />}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h1, color: theme.colors.textPrimary },
  subtitle: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  body: { ...theme.typography.body, color: theme.colors.textPrimary },
  heading: { ...theme.typography.h2, color: theme.colors.textPrimary },
  note: { ...theme.typography.caption, color: theme.colors.textSecondary },
  footer: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center' },
  row: { flexDirection: 'row', gap: theme.layout.cardGap },
  slot: { flex: 1, alignItems: 'flex-start', gap: theme.spacing.xxs },
  slotLabel: { ...theme.typography.label, color: theme.colors.textSecondary },
  slotName: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontFamily: theme.fontFamily.semibold },
  slotDate: { ...theme.typography.caption, color: theme.colors.textSecondary },
  slotScore: { ...theme.typography.h1 },
  slotEmpty: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, minHeight: 56 },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalName: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontFamily: theme.fontFamily.semibold, flex: 1 },
  signalVerdict: { ...theme.typography.caption, color: theme.colors.textSecondary },
  side: { flex: 1, gap: theme.spacing.xxs, alignItems: 'flex-start' },
  sideTitle: { ...theme.typography.caption, color: theme.colors.textSecondary },
  sideValue: { ...theme.typography.metric, color: theme.colors.textPrimary },
});
