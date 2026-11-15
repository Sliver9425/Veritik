import { StyleSheet, Text } from 'react-native';
import { Card } from '../components/atoms/Card';
import { Screen } from '../components/atoms/Screen';
import { theme } from '../theme';

export function PlaceholderScreen({ title, message }: { title: string; message: string }) {
  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <Card>
        <Text style={styles.message}>{message}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h1, color: theme.colors.textPrimary },
  message: { ...theme.typography.body, color: theme.colors.textSecondary },
});
