import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { container } from './src/presentation/composition';
import { RootNavigator } from './src/presentation/navigation';
import { theme } from './src/presentation/theme';

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Tabs' | null>(null);

  // La primera vez se muestra la bienvenida; después se entra directo a las pestañas.
  useEffect(() => {
    container.checkOnboarding
      .execute()
      .then((done) => setInitialRoute(done ? 'Tabs' : 'Onboarding'))
      .catch(() => setInitialRoute('Tabs'));
  }, []);

  if (!fontsLoaded || initialRoute === null) return null;

  const app = (
    <>
      <StatusBar style="light" />
      <RootNavigator initialRoute={initialRoute} />
    </>
  );

  // En la web la app no se estira: ocupa como máximo el ancho de un teléfono, centrada.
  if (Platform.OS !== 'web') return app;

  return (
    <View style={styles.webBackdrop}>
      <View style={styles.webFrame}>{app}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackdrop: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.background },
  webFrame: {
    flex: 1, width: '100%', maxWidth: theme.layout.webMaxWidth,
    borderLeftWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border, overflow: 'hidden',
  },
});
