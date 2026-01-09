import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import {
  getPokemonDetailsById,
  PokemonDetailsResponse,
} from "@/apis/pokemons-api";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { capitalizeFirstLetter } from "@/utils/string-utils";

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
  const router = useRouter();
  const [pokemonItem, setPokemonItem] = useState<PokemonDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleFetchPokemonDetails = useCallback(async () => {
    setLoading(true);
    const { data } = await getPokemonDetailsById(name);
    data && setPokemonItem(data);
    setLoading(false);
  }, [name]);

  const handleButtonPress = useCallback(
    (event: GestureResponderEvent) => {
      onButtonPress && pokemonItem && onButtonPress(pokemonItem, event);
    },
    [onButtonPress, pokemonItem]
  );

  useEffect(() => {
    handleFetchPokemonDetails();
  }, [handleFetchPokemonDetails]);

  if (!pokemonItem || loading) {
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
        <Image
          source={{ uri: pokemonItem.sprites.front_default ?? "" }}
          style={styles.image}
        />
        <Text style={styles.title}>{capitalizeFirstLetter(name)}</Text>
        {/* <IconSymbol name="arrow.up" size={24} color="#333333" /> */}
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
  image: {
    height: 160,
    width: 160,
    backgroundColor: "#c1f3ffff",
    borderRadius: "100%",
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "medium",
    color: "#007bff",
    marginLeft: 8,
  },
});
