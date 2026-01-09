import { FlatList, View } from "react-native";
import { useState, useCallback, useEffect } from "react";
import {
  getPokemonsWithDetails,
  PokemonWithDetails,
} from "@/apis/pokemons-api";
import { PokemonListItem } from "@/components/pokemon-list-item";
export default function DetailsView() {
  const [pokemons, setPokemons] = useState<PokemonWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | undefined>(undefined);
  const handleFetchPokemons = useCallback(async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const response = await getPokemonsWithDetails({ nextUrl, limit: 20 });
    console.log("response", response);

    setPokemons((prevPokemons) => [...prevPokemons, ...response.data]);
    setNextUrl(response.next || undefined);

    setIsLoading(false);
  }, [nextUrl, isLoading]);

  useEffect(() => {
    handleFetchPokemons();
  }, []);

  return (
    <View>
      <FlatList
        data={pokemons.map((pokemon) => pokemon)}
        keyExtractor={(item) => item.url}
        onEndReachedThreshold={0.3}
        onEndReached={handleFetchPokemons}
        renderItem={({ item }) => <PokemonListItem item={item} />}
      />
    </View>
  );
}
