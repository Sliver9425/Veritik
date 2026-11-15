import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { container } from './src/presentation/composition';
import { RootNavigator } from './src/presentation/navigation';

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

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator initialRoute={initialRoute} />
    </>
  );
}
