import { Button, StyleSheet, useWindowDimensions, Text } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePokemonsWithBuffer } from "@/hooks/pokemons/use-pokemons-with-buffer";
import { useRunOnJS } from "react-native-worklets-core";
import { Card } from "@/components/ui/card";

export default function SwipeView() {
  const {
    pokemonsWindow,
    currentIndex: index,
    setNext,
    setPrevious,
    prev,
    current,
    next,
    hasPrev,
    hasNext,
  } = usePokemonsWithBuffer();

  const cardStartPosition = useSharedValue({ x: 0, y: 0 });
  const cardPosition = useSharedValue({ x: 0, y: 0 });
  const cardScale = useSharedValue(1);
  const hasNextShared = useSharedValue(hasNext);
  const hasPrevShared = useSharedValue(hasPrev);
  const { width, height } = useWindowDimensions();

  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      let dragY = e.translationY;

      if (!hasPrevShared.value && dragY > 0) dragY *= 0.25;
      if (!hasNextShared.value && dragY < 0) dragY *= 0.25;

      translateY.value = dragY;
    })
    .onEnd((e) => {
      const dragY = translateY.value;
      const velocityY = e.velocityY;

      const distanceThreshold = height * 0.2;
      const velocityThreshold = 900;

      const shouldGoNext =
        hasNextShared.value &&
        (dragY < -distanceThreshold || velocityY < -velocityThreshold);
      const shouldGoPrev =
        hasPrevShared.value &&
        (dragY > distanceThreshold || velocityY > velocityThreshold);

      if (shouldGoNext) {
        translateY.value = withSpring(-height, undefined, (finished) => {
          if (finished) {
            translateY.value = 0;
            runOnJS(setNext)();
          }
        });
        return;
      }

      if (shouldGoPrev) {
        translateY.value = withSpring(height, undefined, (finished) => {
          if (finished) {
            translateY.value = 0;
            runOnJS(setPrevious)();
          }
        });
        return;
      }

      translateY.value = withSpring(0);
    });

  // Each card has a base position and follows translateY
  const prevStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -height + translateY.value }],
  }));

  const currStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height + translateY.value }],
  }));

  const cardRef = useRef<Animated.View | null>(null);

  const cardMesurementsRef = useRef({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  useLayoutEffect(() => {
    cardRef.current?.measure((x, y, cardWidth, cardHeight) => {
      cardStartPosition.set({
        y: height / 2 - cardHeight / 2,
        x: width / 2 - cardWidth / 2,
      });
      cardPosition.set({
        y: height / 2 - cardHeight / 2,
        x: width / 2 - cardWidth / 2,
      });

      cardMesurementsRef.current = {
        width: cardWidth,
        height: cardHeight,
        x,
        y,
      };
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

  useEffect(() => {
    console.log(
      JSON.stringify(
        {
          left: pokemonsWindow.leftWindow.map((item) => item.url),
          right: pokemonsWindow.rightWindow.map((item) => item.url),
          current: pokemonsWindow.current?.url,
          window: pokemonsWindow.window.map((item) => item.url),
          currentWindowIndex: pokemonsWindow.widnowCurrentIndex,
          index,
        },
        null,
        2
      )
    );
  }, [index, pokemonsWindow]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {prev && (
        <Animated.View style={[styles.card, prevStyle]}>
          <Text>{prev.name}</Text>
        </Animated.View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View ref={cardRef} style={[styles.card, currStyle]}>
          <Text>{current?.name}</Text>
        </Animated.View>
      </GestureDetector>
      {next && (
        <Animated.View style={[styles.card, nextStyle]}>
          <Text>{next.name}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  stage: { flex: 1, overflow: "hidden" },
  card: {
    width: "80%",
    height: "80%",
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 20,
  },
  text: {
    color: "#f1f1f1",
  },
});
