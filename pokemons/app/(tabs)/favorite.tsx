import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { useStore, Keys } from "@/hooks/use-storage";
import { Redirect } from "expo-router";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrightnessModule from "@/specs/NativeBrightnessModule";
import { useEffect, useState } from "react";

export default function FavoriteView() {
  const {
    remove: removeFavorite,
    item: favoritePokemon,
    exists: favoriteExists,
    initialized: favoriteInitialized,
    get: getFavorite,
  } = useStore<string>(Keys.FavoritePokemon);

  useNavigationEvent("focus", getFavorite);
  const [hasWriteSettingsPermission, setHasWriteSettingsPermission] = useState<boolean|null>(null);
  useEffect(() => {
    BrightnessModule.hasWriteSettingsPermission().then((permission) => {
      setHasWriteSettingsPermission(permission);
    });
  },[])



  if (!favoriteInitialized) {
    return <Redirect href="/" />;
  }
  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.wrapper}>
        {!hasWriteSettingsPermission && <Button title="Request Permission" onPress={() => BrightnessModule.requestWriteSettingsPermission().then((permission) => {
          setHasWriteSettingsPermission(permission);
        })} />}
{hasWriteSettingsPermission && <Button title="Set Brightness" onPress={() => BrightnessModule.setBrightness(0.95).then((val) => {
          console.log("Brightness set ", val);
          return Promise.resolve();
        }).then(()=>BrightnessModule.getBrightness()).then((brightness)=>{
          console.log("Brightness", brightness);
        })} />}
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
