import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { theme } from '../theme';
import { CompareScreen } from '../screens/CompareScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Compare: { active: 'git-compare', inactive: 'git-compare-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof TabParamList } }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryAccent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        // Etiqueta siempre debajo del ícono, como en el teléfono (en pantallas anchas la librería la pone al lado).
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: [
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
          // En la web la barra mide 49 px y corta las etiquetas; se le da el alto de la barra nativa.
          Platform.OS === 'web' && { height: 64, paddingBottom: theme.spacing.xs },
        ],
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: 12 },
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
          <Ionicons name={focused ? ICONS[route.name].active : ICONS[route.name].inactive} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Compare" component={CompareScreen} options={{ title: 'Comparar' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
