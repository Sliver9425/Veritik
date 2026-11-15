import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnalysisResult, CommentSample, Profile, Signal, Username, VideoStats } from './src/domain';
import { levelColors, statusColors, theme } from './src/presentation/theme';

// Pantalla temporal para comprobar que el tema y el dominio funcionan en Expo Go (datos de ejemplo).
function buildDemo(): AnalysisResult {
  const day = 24 * 60 * 60 * 1000;
  const videos = [0, 1, 2, 3].map((i) =>
    VideoStats.create({ id: String(i), url: `demo/${i}`, publishedAt: new Date(Date.now() - i * 2 * day), views: 10000, likes: 400, comments: 30, shares: 10 }),
  );
  const profile = Profile.create({
    username: Username.create('creadora.demo'), followers: 48200, following: 300, totalLikes: 900000,
    videoCount: 120, videos, commentSample: CommentSample.create(100, 34), fetchedAt: new Date(),
  });
  return AnalysisResult.create({
    id: 'demo', profile, analyzedAt: new Date(),
    signals: [
      Signal.create({ id: 'engagement', score: 80, rawValue: profile.averageEngagementRate }),
      Signal.create({ id: 'viewsToFollowers', score: 60 }),
      Signal.unavailable('commentQuality'),
      Signal.create({ id: 'followRatio', score: 90 }),
      Signal.create({ id: 'postingRegularity', score: 30 }),
    ],
  });
}

const STATUS_TEXT = { good: 'Bien', warning: 'Atención', risk: 'Riesgo' } as const;
const LEVEL_TEXT = { high: 'Autenticidad alta', medium: 'Autenticidad media', low: 'Autenticidad baja' } as const;

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

  const result = buildDemo();
  const level = levelColors[result.level];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <StatusBar style="light" />
      <Text style={styles.brand}>Veritik</Text>
      <Text style={styles.handle}>{result.profile.username.handle} · datos de ejemplo</Text>
      <Text style={styles.score}>{result.score.value}</Text>
      <Text style={[styles.level, { color: level.foreground, backgroundColor: level.background }]}>{LEVEL_TEXT[result.level]}</Text>
      {result.signals.map((s) => {
        const status = s.status;
        return (
          <View key={s.id} style={styles.row}>
            <Text style={styles.rowLabel}>{s.id}</Text>
            <Text style={[styles.rowStatus, { color: status ? statusColors[status].foreground : theme.colors.textSecondary }]}>
              {status ? STATUS_TEXT[status] : 'Sin datos'}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, paddingTop: 72, gap: theme.spacing.sm },
  brand: { ...theme.typography.h2, color: theme.colors.primaryAccent },
  handle: { ...theme.typography.body, color: theme.colors.textSecondary },
  score: { ...theme.typography.display, color: theme.colors.textPrimary, textAlign: 'center', marginTop: theme.spacing.xl },
  level: { ...theme.typography.label, alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 14, borderRadius: theme.radius.pill, overflow: 'hidden', marginBottom: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: theme.spacing.md },
  rowLabel: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
  rowStatus: { ...theme.typography.bodySmall, fontFamily: theme.fontFamily.semibold },
});
