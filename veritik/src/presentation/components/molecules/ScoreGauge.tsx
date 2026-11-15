import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreGaugeProps {
  /** Puntaje 0-100. */
  score: number;
  /** Color del arco (según el nivel). */
  color: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Medidor circular del puntaje. El arco se llena con Reanimated (en el hilo de UI) y el número cuenta hasta el
 * valor final con la misma curva. Si la persona tiene activado "reducir movimiento", se muestra el resultado sin animar.
 */
export function ScoreGauge({ score, color, size = theme.sizes.gaugeDiameter, strokeWidth = theme.sizes.gaugeStroke }: ScoreGaugeProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : theme.motion.duration.gauge;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.min(100, Math.max(0, score)) / 100;

  const progress = useSharedValue(0);
  const [shown, setShown] = useState(duration === 0 ? score : 0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });

    if (duration === 0) {
      setShown(score);
      return undefined;
    }
    // Contador numérico en JS con la misma curva (ease-out cúbica) que el arco.
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setShown(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value * target),
  }));

  const center = size / 2;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Puntaje de autenticidad: ${score} de 100`}
      accessibilityValue={{ min: 0, max: 100, now: score }}
    >
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={theme.colors.track} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.score}>{shown}</Text>
        <Text style={styles.outOf}>de 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  score: { ...theme.typography.display, color: theme.colors.textPrimary },
  outOf: { ...theme.typography.label, color: theme.colors.textSecondary },
});
