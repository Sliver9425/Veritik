import { StyleSheet, Text } from 'react-native';
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

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>

      <Card>
        <Text style={styles.heading}>Plan</Text>
        <Text style={styles.body}>{isPremium ? 'Premium: análisis ilimitados.' : 'Gratis: 3 análisis al mes.'}</Text>
        <Button label={isPremium ? 'Volver al plan gratis (prueba)' : 'Probar plan premium (prueba)'} variant="secondary" small onPress={togglePremium} />
      </Card>

      <Card>
        <Text style={styles.heading}>Datos de prueba</Text>
        <Text style={styles.body}>
          Origen de los perfiles: {container.dataSource === 'mock' ? 'ejemplos (sin backend)' : 'servidor de análisis'}.
        </Text>
        <Button label="Reiniciar historial y contador" variant="secondary" small onPress={() => void container.resetLocalData()} />
      </Card>

      <Card>
        <Text style={styles.heading}>Bienvenida</Text>
        <Button label="Ver la introducción otra vez" variant="secondary" small onPress={() => navigation.navigate('Onboarding')} />
      </Card>

      <Text style={styles.note}>Veritik analiza solo señales públicas y entrega estimaciones, no acusaciones.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h1, color: theme.colors.textPrimary },
  heading: { ...theme.typography.h2, color: theme.colors.textPrimary },
  body: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  note: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center' },
});
