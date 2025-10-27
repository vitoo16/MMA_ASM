import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

export const useFadeIn = (duration: number = 300) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

export const useSlideIn = (
  direction: "left" | "right" | "up" | "down" = "up",
  distance: number = 20
) => {
  const translateX = useSharedValue(
    direction === "left" ? -distance : direction === "right" ? distance : 0
  );
  const translateY = useSharedValue(
    direction === "up" ? distance : direction === "down" ? -distance : 0
  );
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

export const useScaleIn = (duration: number = 300) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    opacity.value = withTiming(1, { duration });
  }, [duration, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

export { Animated };
