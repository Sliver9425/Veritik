import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/molecules/BackHeader';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Chip } from '../components/atoms/Chip';
import { ScoreGauge } from '../components/molecules/ScoreGauge';
import { Screen } from '../components/atoms/Screen';
import { compactNumber, percent } from '../content/format';
import { LEVEL_TEXT, STATUS_TEXT, VERDICT_TEXT } from '../content/labels';
import { useAnalysisDetail } from '../hooks/useAnalysisDetail';
import type { RootScreenProps } from '../navigation/types';
import { levelColors, statusColors, theme } from '../theme';

export function ResultScreen({ navigation, route }: RootScreenProps<'Result'>) {
  const { analysisId } = route.params;
  const { result, error, loading } = useAnalysisDetail(analysisId);
  const goBack = () => navigation.goBack();

  if (loading) {
    return (
      <Screen scroll={false}>
        <BackHeader title="Resultado" onBack={goBack} />
        <ActivityIndicator color={theme.colors.primaryAccent} style={styles.loader} />
      </Screen>
    );
  }
  if (result === null) {
    return (
      <Screen scroll={false}>
        <BackHeader title="Resultado" onBack={goBack} />
        <Card><Text style={styles.body}>{error ?? 'No encontramos ese análisis.'}</Text></Card>
      </Screen>
    );
  }

  const level = levelColors[result.level];
  const handle = result.profile.username.handle;
  const engagement = result.getSignal('engagement')?.rawValue ?? null;
  const comments = result.getSignal('commentQuality');
  const commentStatus = comments?.status ?? null;

  const share = () =>
    Share.share({
      message: `Veritik: ${handle} tiene un puntaje de autenticidad de ${result.score.value}/100 (${LEVEL_TEXT[result.level]}). Es una estimación basada en señales públicas.`,
    });

  return (
    <Screen>
      <BackHeader title={handle} onBack={goBack} />

      <View style={styles.center}>
        <ScoreGauge score={result.score.value} color={level.foreground} />
      </View>
      <View style={styles.center}>
        <Chip label={LEVEL_TEXT[result.level]} foreground={level.foreground} background={level.background} />
      </View>
      <Text style={styles.verdict}>{VERDICT_TEXT[result.level]}</Text>

      <View style={styles.metrics}>
        <Metric label="Seguidores" value={compactNumber(result.profile.followers)} />
        <Metric label="Engagement" value={engagement === null ? '—' : percent(engagement)} />
        <Metric
          label="Comentarios"
          value={commentStatus === null ? 'Sin datos' : STATUS_TEXT[commentStatus]}
          color={commentStatus === null ? undefined : statusColors[commentStatus].foreground}
        />
      </View>

      {result.unavailableSignals.length > 0 && (
        <Text style={styles.note}>
          {result.unavailableSignals.length} señal(es) sin datos: el puntaje se calculó con las demás.
        </Text>
      )}

      <Button label="Ver detalle de señales" onPress={() => navigation.navigate('Detail', { analysisId })} />
      <View style={styles.row}>
        <Button label="Comparar" variant="secondary" small style={styles.flex} onPress={() => navigation.navigate('Tabs', { screen: 'Compare', params: { firstId: analysisId } })} />
        <Button label="Compartir" variant="secondary" small style={styles.flex} onPress={() => void share()} />
      </View>
    </Screen>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color !== undefined && { color }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: theme.spacing.xxl },
  body: { ...theme.typography.body, color: theme.colors.textPrimary },
  center: { alignItems: 'center', marginTop: theme.spacing.xs },
  verdict: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' },
  metrics: { flexDirection: 'row', gap: theme.layout.cardGap },
  metric: { flex: 1, padding: theme.spacing.sm },
  metricLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  metricValue: { ...theme.typography.metric, color: theme.colors.textPrimary },
  note: { ...theme.typography.label, color: theme.colors.textSecondary, textAlign: 'center' },
  row: { flexDirection: 'row', gap: theme.layout.cardGap },
  flex: { flex: 1 },
});
