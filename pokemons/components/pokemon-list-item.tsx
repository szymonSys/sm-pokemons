import { View, Text, StyleSheet, Button } from "react-native";
import { Image } from "expo-image";
import { PokemonWithDetails } from "@/apis/pokemons-api";
import { useRouter } from "expo-router";
// import { Button } from "@react-navigation/elements";

type PokemonItemProps = {
  item: PokemonWithDetails;
};

export function PokemonListItem({ item }: PokemonItemProps) {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: item.details.sprites.front_default ?? "" }}
        style={styles.image}
      />
      <Button
        title={item.name}
        onPress={() =>
          router.push({
            pathname: "/[pokemonName]",
            params: { pokemonName: item.name },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 8,
    margin: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
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
    color: "#333333",
  },
  button: {
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
});
