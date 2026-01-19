import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useLayoutEffect, useRef } from "react";

export default function SwipeView() {
  const cardStartPosition = useSharedValue({ x: 0, y: 0 });
  const cardPosition = useSharedValue({ x: 0, y: 0 });
  const cardScale = useSharedValue(1);

  const cardRef = useRef<Animated.View>(null);

  const { width, height } = useWindowDimensions();

  useLayoutEffect(() => {
    cardRef.current?.measure((x, y, cardWidth, cardHeight, pageX, pageY) => {
      cardStartPosition.set({
        y: height / 2 - cardHeight / 2,
        x: width / 2 - cardWidth / 2,
      });
      cardPosition.set({
        y: height / 2 - cardHeight / 2,
        x: width / 2 - cardWidth / 2,
      });

      console.log({
        x,
        y,
        width,
        height,
        pageX,
        pageY,
      });
    });
  }, [width, height, cardPosition, cardStartPosition]);

  const dragGesture = Gesture.Pan()
    .onStart((e) => {
      cardScale.set(1.1);
    })
    .onUpdate((e) => {
      cardPosition.set({
        x: e.translationX + cardStartPosition.value.x,
        y: e.translationY + cardStartPosition.value.y,
      });
    })
    .onEnd((e) => {
      cardScale.set(1);
      cardPosition.set(cardStartPosition.value);
    });

  const cardAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(cardPosition.value.x),
        },
        { translateY: withSpring(cardPosition.value.y) },
        { scale: withSpring(cardScale.value) },
        {
          rotate: `${interpolate(
            cardPosition.value.x,
            [-1000, 0, 1000],
            [-90, 0, 90]
          )}deg`,
        },
      ],
    };
  });

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={dragGesture}>
        <Animated.View
          ref={cardRef}
          style={[styles.card, cardAnimatedStyles]}
        ></Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "80%",
    height: "80%",
    backgroundColor: "#222222",
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 32,
  },
  text: {
    color: "#f1f1f1",
  },
});
