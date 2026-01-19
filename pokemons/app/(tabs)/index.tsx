import { FlatList, View, StyleSheet } from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getPokemons,
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

export default function DetailsView() {
  const [pokemons, setPokemons] = useState<PokemonResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | undefined>(undefined);
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonDetailsResponse | null>(null);
  const modalRef = useRef<BottomSheetModal | null>(null);

  const handleFetchPokemons = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const response = await getPokemons({ nextUrl, limit: 20 });

    setPokemons((prevPokemons) => [
      ...prevPokemons,
      ...(response.data?.results || []),
    ]);
    setNextUrl(response.data?.next || undefined);

    setIsLoading(false);
  };

  useEffect(() => {
    handleFetchPokemons();
  }, []);

  const openModalWithPokemon = useCallback(
    (pokemon: PokemonDetailsResponse) => {
      setSelectedPokemon(pokemon);
      modalRef.current?.present();
    },
    []
  );

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
          data={pokemons}
          keyExtractor={(item) => item.url}
          onEndReachedThreshold={0.3}
          onEndReached={handleFetchPokemons}
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
