import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { TabNavigator } from './TabNavigator';
import { navigationTheme } from './navigationTheme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Primera vez:  Onboarding → Tabs.   Flujo principal:  Tabs(Inicio) → Analysis → Result → Detail
 * Analysis se REEMPLAZA por Result (no queda en la pila): al volver desde el resultado se regresa a las pestañas.
 */
export function RootNavigator({ initialRoute }: { initialRoute: 'Onboarding' | 'Tabs' }) {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
