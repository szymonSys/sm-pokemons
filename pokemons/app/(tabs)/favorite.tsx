import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { useStore, Keys } from "@/hooks/use-storage";
import { Redirect } from "expo-router";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.wrapper}>
        <Text style={styles.text}>
          Favorite Pokemon: {favoritePokemon || "None"}
        </Text>
        {favoriteExists ? (
          <Button title="Unlike" onPress={removeFavorite} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  text: {
    color: "#f1f1f1",
  },
});
