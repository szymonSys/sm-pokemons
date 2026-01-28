import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import { SwipeGestureOptions } from "../use-swipe-list";

export function useSwipeGesture({
  setNext,
  setPrevious,
  hasNext,
  hasPrev,
  velocityThreshold,
  distanceThresholdFactor,
  scaleUpFactor,
}: SwipeGestureOptions) {
  const { height } = useWindowDimensions();

  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const shouldScaleUp =
        (hasNext && e.translationY < 0) || (hasPrev && e.translationY > 0);
      const dragY = shouldScaleUp
        ? e.translationY * scaleUpFactor
        : e.translationY;
      translateY.set(dragY);
    })
    .onEnd((e) => {
      const velocityThresholdExceeded =
        Math.abs(e.velocityY) > velocityThreshold;

      const distanceThresholdExceeded =
        Math.abs(e.translationY) > height * distanceThresholdFactor;

      const cannotProceed = !(
        velocityThresholdExceeded || distanceThresholdExceeded
      );

      if (cannotProceed) {
        translateY.set(withSpring(0));
        return;
      }

      const shouldGoNext = hasNext && e.translationY < 0 && e.velocityY < 0;
      const shouldGoPrev = hasPrev && e.translationY > 0 && e.velocityY > 0;
      if (shouldGoNext) {
        runOnJS(setNext)();
      } else if (shouldGoPrev) {
        runOnJS(setPrevious)();
      }
      translateY.set(0);
    });

  return {
    translateY,
    gesture,
  };
}
