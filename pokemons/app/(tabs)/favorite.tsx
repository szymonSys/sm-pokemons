import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { useStore, Keys } from "@/hooks/use-storage";
import { Redirect } from "expo-router";
import { Button, ScrollView, StyleSheet, Text } from "react-native";

export default function FavoriteView() {
  const {
    remove: removeFavorite,
    item: favoritePokemon,
    exists: favoriteExists,
    initialized: favoriteInitialized,
    get: getFavorite,
  } = useStore<string>(Keys.FavoritePokemon);

  useNavigationEvent("focus", getFavorite);

  if (!favoriteInitialized) {
    return <Redirect href="/" />;
  }
  return (
    <ScrollView style={styles.wrapper}>
      <Text>Favorite Pokemon: {favoritePokemon || "None"}</Text>
      {favoriteExists ? (
        <Button title="Unlike" onPress={removeFavorite} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 32,
    padding: 16,
  },
});
