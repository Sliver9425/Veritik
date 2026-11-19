import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Bottom sheet modal: el fondo se oscurece y el panel sube desde abajo (Reanimated).
 * Se cierra con el fondo, con el botón atrás de Android o con el botón que ponga quien lo use.
 * Al cerrar se espera a que termine la animación antes de desmontar el Modal.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : theme.motion.duration.sheet;

  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
      return undefined;
    }
    progress.value = withTiming(0, { duration, easing: Easing.in(Easing.cubic) });
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [visible, duration, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * height }] }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.xl }, sheetStyle]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.overlay },
  fill: { flex: 1 },
  sheet: {
    // En la web el Modal cubre toda la ventana: el panel se alinea con el marco centrado de App.tsx.
    ...(Platform.OS === 'web' && { width: '100%', maxWidth: theme.layout.webMaxWidth, alignSelf: 'center' }),
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenPaddingHorizontal,
    gap: theme.spacing.sm,
  },
  handle: {
    alignSelf: 'center', width: theme.sizes.sheetHandleWidth, height: theme.sizes.sheetHandleHeight,
    borderRadius: 3, backgroundColor: theme.colors.handle,
  },
  title: { ...theme.typography.h2, color: theme.colors.textPrimary, marginTop: theme.spacing.xs },
});
