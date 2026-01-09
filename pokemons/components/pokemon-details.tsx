import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PokemonDetailsResponse } from "@/apis/pokemons-api";
import { Keys, useStore } from "@/hooks/use-storage";
import { Image } from "expo-image";

export type PokemonDetailsProps = {
  details: PokemonDetailsResponse;
  onChangeFavorite?: (wasFavorite: boolean) => void;
};

export function PokemonDetails({
  details,
  onChangeFavorite,
}: PokemonDetailsProps) {
  const storage = useStore<string>(Keys.FavoritePokemon);

  const isFavorite = storage.item === details.name;

  async function makePokemonFavorite() {
    await storage.save(details.name);
    onChangeFavorite && onChangeFavorite(false);
  }

  async function unlikePokemon() {
    await storage.remove();
    onChangeFavorite && onChangeFavorite(true);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.nameWrapper}>
        <Text style={styles.name}>{details.name}</Text>
        <TouchableOpacity
          activeOpacity={0.3}
          style={styles.button}
          onPress={isFavorite ? unlikePokemon : makePokemonFavorite}
        >
          <Text style={styles.buttonText}>
            {isFavorite ? "Unlike" : "Make Favorite"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageWrapper}>
        <Image source={details.sprites.front_default} style={styles.image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
    gap: 8,
  },
  nameWrapper: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 320,
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
  button: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonText: {
    width: "100%",
    textAlign: "center",
    color: "#f1f1f1",
    fontSize: 16,
    fontWeight: "medium",
  },
});
