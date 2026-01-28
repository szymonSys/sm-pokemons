import { FlatList, View, StyleSheet } from "react-native";
import { useState, useRef, useCallback } from "react";
import {
  PokemonDetailsResponse,
  PokemonResourceItem,
} from "@/apis/pokemons-api";
import { PokemonListItem } from "@/components/pokemon-list-item";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { PokemonDetails } from "@/components/pokemon-details";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePokemonsResources } from "@/hooks/pokemons/use-pokemons-resources";

export default function DetailsView() {
  const { loadPokemonsResources, pokemonResources } = usePokemonsResources({
    autoLoad: true,
  });
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonDetailsResponse | null>(null);
  const modalRef = useRef<BottomSheetModal | null>(null);

  const openModalWithPokemon = useCallback(
    (pokemon: PokemonDetailsResponse) => {
      setSelectedPokemon(pokemon);
      modalRef.current?.present();
    },
    []
  );

  const handleLoadPokemons = useCallback(async () => {
    await loadPokemonsResources();
  }, [loadPokemonsResources]);

  const renderItem = useCallback(
    ({ item }: { item: PokemonResourceItem }) => {
      return (
        <PokemonListItem
          name={item.name}
          onButtonPress={openModalWithPokemon}
        />
      );
    },
    [openModalWithPokemon]
  );

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <View style={styles.container}>
        <BottomSheetModal
          ref={modalRef}
          style={styles.bottomSheet}
          index={1}
          snapPoints={["33%"]}
          enablePanDownToClose={true}
          enableDismissOnClose={true}
          backdropComponent={BottomSheetBackdrop}
        >
          <BottomSheetView>
            {selectedPokemon ? (
              <PokemonDetails
                details={selectedPokemon}
                onChangeFavorite={() => modalRef.current?.dismiss()}
              />
            ) : null}
          </BottomSheetView>
        </BottomSheetModal>
        <FlatList
          data={pokemonResources}
          keyExtractor={(item) => item.url}
          onEndReachedThreshold={0.3}
          onEndReached={handleLoadPokemons}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  bottomSheet: {
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
