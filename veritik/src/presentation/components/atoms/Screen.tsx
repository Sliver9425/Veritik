import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
}

/** Contenedor base de pantalla: fondo, márgenes laterales de 24 px y respeto de la zona segura superior. */
export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = {
    paddingTop: insets.top + theme.spacing.md,
    paddingHorizontal: theme.layout.screenPaddingHorizontal,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  };

  if (scroll) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.root, content]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
});
