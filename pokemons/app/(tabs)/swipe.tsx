import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector } from "react-native-gesture-handler";
import { PropsWithChildren, useCallback, useMemo } from "react";
import {
  GetPokemonsRequestParams,
  PokemonResourceItem,
  getPokemons,
} from "@/apis/pokemons-api";
import {
  ComputeCardTransformation,
  useSwipeList,
} from "@/hooks/use-swipe-list";
import { usePokemon } from "@/hooks/pokemons/use-pokemon";

const SCALE_UP_FACTOR = 0.25;
const VELOCITY_THRESHOLD = 1200;
const DISTANCE_THRESHOLD_FACTOR = 0.5;

const CARD_HEIGHT = Dimensions.get("window").height * 0.8;
const CARD_SPACING = 16;

export default function SwipeView() {
  const loadPokemons = useCallback(async (params: GetPokemonsRequestParams) => {
    const { data } = await getPokemons(params);
    return data?.results;
  }, []);

  const { itemsWindow, gesture } = useSwipeList(loadPokemons, {
    itemHeight: CARD_HEIGHT,
    itemSpacing: CARD_SPACING,
    velocityThreshold: VELOCITY_THRESHOLD,
    distanceThresholdFactor: DISTANCE_THRESHOLD_FACTOR,
    scaleUpFactor: SCALE_UP_FACTOR,
    onInit: ({ load }) => load({ offset: 0, limit: 10 }),
    beforeMoveToNext: async ({ load, currentIndex, list }) => {
      const nextIndex = currentIndex + 1;
      const lastIndex = list.length - 1;
      if (nextIndex > lastIndex - 1) {
        await load({ offset: list.length, limit: 10 });
      }
    },
  });

  const bufferCards = useMemo(() => {
    return itemsWindow.map(({ item, computeStyles }) => {
      return (
        <AnimatedCard
          key={item.url}
          pokemon={item}
          computeStyles={computeStyles}
        />
      );
    });
  }, [itemsWindow]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardsContainer]}>
          {bufferCards}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const AnimatedCard = ({
  pokemon,
  computeStyles,
}: PropsWithChildren<{
  pokemon: PokemonResourceItem;
  computeStyles: ComputeCardTransformation;
}>) => {
  const animatedStyle = useAnimatedStyle(computeStyles);
  const { pokemon: details } = usePokemon({ initialIdOrName: pokemon.name });
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.imageWrapper}>
        {details ? (
          <Image
            source={{ uri: details.sprites.front_default ?? undefined }}
            style={styles.image}
          />
        ) : (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
      </View>
      <Text style={styles.name}>{pokemon.name}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 320,
  },
  loader: {
    width: 320,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
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
