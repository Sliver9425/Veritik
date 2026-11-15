import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Pestañas inferiores (máximo 4, como en el diseño). */
export type TabParamList = {
  Home: undefined;
  /** `firstId`: análisis que se coloca como primera cuenta (viene del botón "Comparar" del resultado). */
  Compare: { firstId?: string } | undefined;
  History: undefined;
  Profile: undefined;
};

/** Pila principal. Los parámetros son datos simples y serializables: el resultado se pide por `analysisId`. */
export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Analysis: { username: string };
  Result: { analysisId: string };
  Detail: { analysisId: string };
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

/** Para pantallas dentro de las pestañas que además navegan a la pila principal. */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
