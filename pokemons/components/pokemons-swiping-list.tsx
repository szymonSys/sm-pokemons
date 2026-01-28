import { GetPokemonsRequestParams, getPokemons } from "@/apis/pokemons-api";
import { useSwipeList } from "@/hooks/use-swipe-list";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { PokemonSwipeCard } from "./pokemon-swipe-card";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const CARD_HEIGHT = Dimensions.get("window").height * 0.8;
const CARD_SPACING = 64;
const LOAD_BUFFER_SIZE = 5;

export function PokemonsSwipingList() {
  const loadPokemons = useCallback(async (params: GetPokemonsRequestParams) => {
    const { data } = await getPokemons(params);
    return data?.results;
  }, []);

  const { itemsWindow, gesture, isLoading } = useSwipeList(loadPokemons, {
    itemSpacing: CARD_SPACING,
    itemHeight: CARD_HEIGHT,
    onInit: ({ load }) => load({ offset: 0, limit: 10 }),
    beforeMoveToNext: async ({ load, currentIndex, list }) => {
      const nextIndex = currentIndex + 1;
      const lastIndex = list.length - 1;
      if (nextIndex > lastIndex - LOAD_BUFFER_SIZE) {
        await load({ offset: list.length, limit: 10 });
      }
    },
  });

  const bufferCards = useMemo(() => {
    return itemsWindow.map(({ item, computeStyles }) => {
      return (
        <PokemonSwipeCard
          key={item.url}
          pokemon={item}
          computeStyles={computeStyles}
        />
      );
    });
  }, [itemsWindow]);
  return (
    <View style={styles.root}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardsContainer]}>
          {bufferCards}
        </Animated.View>
      </GestureDetector>
      {isLoading && <ActivityIndicator size="large" color="#000" />}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    flex: 1,
    gap: CARD_SPACING,
    position: "relative",
    width: "100%",
  },
  root: { flex: 1, paddingHorizontal: 16 },
});
