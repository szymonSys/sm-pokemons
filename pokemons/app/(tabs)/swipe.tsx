import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PokemonsSwipingList } from "@/components/pokemons-swiping-list";

export default function SwipeView() {
  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <PokemonsSwipingList />
    </SafeAreaView>
  );
}
