import { PokemonResourceItem } from "@/apis/pokemons-api";
import { usePokemon } from "@/hooks/pokemons/use-pokemon";
import { ComputeCardStyles } from "@/hooks/use-swipe-list";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Image } from "expo-image";

export type PokemonSwipeCardProps = {
  pokemon: PokemonResourceItem;
  computeStyles: ComputeCardStyles;
};

export function PokemonSwipeCard({
  pokemon,
  computeStyles,
}: PokemonSwipeCardProps) {
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
}

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
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
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
});
