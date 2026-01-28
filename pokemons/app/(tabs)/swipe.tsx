import {
  Button,
  StyleSheet,
  useWindowDimensions,
  Text,
  StyleProp,
  ViewStyle,
  View,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  createAnimatedComponent,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  PropsWithChildren,
  RefObject,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { usePokemonsWithBuffer } from "@/hooks/pokemons/use-pokemons-with-buffer";
import { useRunOnJS } from "react-native-worklets-core";
import { Card } from "@/components/ui/card";
import { PokemonWithDetails } from "@/apis/pokemons-api";
import { PokemonDetails } from "@/components/pokemon-details";

const SCALE_UP_FACTOR = 0.25;
const VELOCITY_THRESHOLD = 1200;
const DISTANCE_THRESHOLD_FACTOR = 0.5;

const CARD_HEIGHT = 700;
const CARD_SPACING = 16;

export default function SwipeView() {
  const {
    leftWindow: prevPokemons,
    rightWindow: nextPokemons,
    current: currentPokemon,
    setNext,
    setPrevious,
    pokemons,
    prevPokemon,
    nextPokemon,
    hasPrev,
    hasNext,
    buffer,
    bufferCurrentIndex,
    currentIndex,
  } = usePokemonsWithBuffer();

  const cardStartPosition = useSharedValue({ x: 0, y: 0 });
  const cardStartY = useSharedValue(0);
  const cardHeightShared = useSharedValue(0);
  const cardWidthShared = useSharedValue(0);
  const { width, height } = useWindowDimensions();

  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      cardStartY.set(translateY.get());
    })
    .onUpdate((e) => {
      const shouldScaleUp =
        (hasNext && e.translationY < 0) || (hasPrev && e.translationY > 0);
      const dragY = shouldScaleUp
        ? e.translationY * SCALE_UP_FACTOR
        : e.translationY;
      translateY.set(dragY);
    })
    .onEnd((e) => {
      const dragY = translateY.get();
      const velocityY = e.velocityY;
      const velocityTresholdExceeded = Math.abs(velocityY) > VELOCITY_THRESHOLD;
      const distanceTresholdExceeded =
        Math.abs(dragY) > height * DISTANCE_THRESHOLD_FACTOR;
      if (velocityTresholdExceeded || distanceTresholdExceeded) {
        const shouldGoNext = hasNext && e.translationY < 0 && velocityY < 0;
        const shouldGoPrev = hasPrev && e.translationY > 0 && velocityY > 0;
        console.log({ shouldGoNext, shouldGoPrev, hasPrev, dragY, velocityY });
        if (shouldGoNext) {
          runOnJS(setNext)();
          translateY.set(withSpring(0));
          // const offset = -(CARD_HEIGHT + CARD_SPACING) * (currentIndex + 1);
          // console.log("shouldGoNext", offset);
          // translateY.value = withSpring(offset, undefined, (finished) => {
          //   if (finished) {
          //     runOnJS(setNext)();
          //   }
          // });
        } else if (shouldGoPrev) {
          runOnJS(setPrevious)();
          translateY.set(withSpring(0));
        } else {
          translateY.set(withSpring(0));
          // translateY.set(withSpring(cardStartY.get()));
        }
        return;
      }
      translateY.set(withSpring(0));
      // translateY.set(withSpring(cardStartY.get()));
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  const cardRef = useRef<Animated.View | null>(null);

  const bufferCards = useMemo(() => {
    const startIndex = Math.max(0, currentIndex - 2);
    const endIndex = Math.min(pokemons.length - 1, startIndex + 5);
    return pokemons.slice(startIndex, endIndex).map((p, index) => {
      return (
        <AnimatedCard
          key={p.url}
          details={p}
          index={startIndex + index}
          currentIndex={currentIndex}
          translateY={translateY}
        />
      );
    });
  }, [pokemons, currentIndex, translateY]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.cardsContainer,
            // containerStyle,
            { backgroundColor: "red" },
          ]}
        >
          {/* {prevPokemon && (
            <AnimatedCard details={prevPokemon} style={prevCardStyle} />
          )}
          {currentPokemon && (
            <AnimatedCard
              ref={cardRef}
              details={currentPokemon}
              style={currentCardStyle}
            />
          )}
          {nextPokemon && (
            <AnimatedCard details={nextPokemon} style={nextCardStyle} />
          )} */}
          {bufferCards}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const AnimatedCard = ({
  details,
  style,
  ref,
  index,
  currentIndex,
  translateY,
}: PropsWithChildren<{
  details: PokemonWithDetails;
  style?: StyleProp<ViewStyle>;
  ref?: RefObject<Animated.View | null>;
  index: number;
  currentIndex: number;
  translateY: SharedValue<number>;
}>) => {
  const multiplier = index >= currentIndex ? 1 : -1;
  const offset =
    (CARD_HEIGHT + CARD_SPACING) * multiplier * Math.abs(index - currentIndex);
  console.log(details.name, index, offset);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(offset + translateY.get()),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.card, style, animatedStyle]} ref={ref}>
      <View style={styles.imageWrapper}>
        <Image
          source={details.details.sprites.front_default}
          style={styles.image}
        />
      </View>
      <Text style={styles.name}>{details.name}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 320,
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    gap: CARD_SPACING,
  },
  imageWrapper: {
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  name: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 8,
  },
  root: { flex: 1, backgroundColor: "#000" },
  stage: { flex: 1, overflow: "hidden" },
  card: {
    width: "80%",
    height: CARD_HEIGHT,
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
