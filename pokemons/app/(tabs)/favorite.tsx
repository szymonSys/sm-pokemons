import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { useStore, Keys } from "@/hooks/use-storage";
import { Redirect } from "expo-router";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBrightness, useBrightnessCallback, useBrightnessListener, useBrightnessPermission } from "@/hooks/use-brightness";
import { Slider } from "@/components/ui/slider";

export default function FavoriteView() {
  const {
    remove: removeFavorite,
    item: favoritePokemon,
    exists: favoriteExists,
    initialized: favoriteInitialized,
    get: getFavorite,
  } = useStore<string>(Keys.FavoritePokemon);


  useNavigationEvent("focus", getFavorite);

  const [_, changeBrightness] = useBrightness()
  const [hasWriteSettingsPermission, requestPermission] = useBrightnessPermission()
const {brightness} = useBrightnessListener()
 useBrightnessCallback((brightness) => {
    console.log({brightness})
  })

  if (!favoriteInitialized) {
    return <Redirect href="/" />;
  }
  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.wrapper}>
        {!hasWriteSettingsPermission && <Button title="Request Permission" onPress={() => requestPermission()} />}
  {hasWriteSettingsPermission && brightness && <Slider initialValue={brightness * 100} onChange={(value) => {
    const normalizedValue = value / 100
    changeBrightness(normalizedValue)
  }} />}
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
