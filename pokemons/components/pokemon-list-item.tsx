import {
  View,
  StyleSheet,
  Text,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { PokemonDetailsResponse } from "@/apis/pokemons-api";
import { memo, useCallback } from "react";
import { capitalizeFirstLetter } from "@/utils/string-utils";
import { usePokemon } from "@/hooks/pokemons/use-pokemon";

type PokemonItemProps = {
  name: string;
  onButtonPress?: (
    item: PokemonDetailsResponse,
    event: GestureResponderEvent
  ) => void;
};

export const PokemonListItem = memo(function PokemonListItem({
  name,
  onButtonPress,
}: PokemonItemProps) {
  const { pokemon, pokemonIsLoading } = usePokemon({ initialIdOrName: name });

  const handleButtonPress = useCallback(
    (event: GestureResponderEvent) => {
      onButtonPress && pokemon && onButtonPress(pokemon, event);
    },
    [onButtonPress, pokemon]
  );

  if (!pokemon || pokemonIsLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.image} />
        <Text style={styles.title}>{capitalizeFirstLetter(name)}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleButtonPress}>
      <View style={styles.wrapper}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: pokemon.sprites.front_default ?? "" }}
            style={styles.image}
          />
        </View>
        <Text style={styles.title}>{capitalizeFirstLetter(name)}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 12,
    margin: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageWrapper: {
    backgroundColor: "#c1f3ffff",
    borderRadius: "100%",
    marginRight: 8,
  },
  image: {
    height: 160,
    width: 160,
  },
  title: {
    fontSize: 28,
    fontWeight: "medium",
    color: "#007bff",
    marginLeft: 8,
  },
});
