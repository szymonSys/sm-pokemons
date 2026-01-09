import { Button, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  getPokemonDetailsById,
  PokemonDetailsResponse,
} from "@/apis/pokemons-api";
import { useStore, Keys } from "@/hooks/use-storage";

export default function DetailsView() {
  const { pokemonName } = useLocalSearchParams<{ pokemonName: string }>();
  const [pokemonDetails, setPokemonDetails] =
    useState<PokemonDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storage = useStore<string>(Keys.FavoritePokemon);

  const isFavorite = storage.item === pokemonName;

  const handleFetchPokemonDetails = useCallback(async () => {
    setIsLoading(true);
    const result = await getPokemonDetailsById(pokemonName);
    setPokemonDetails(result.data || null);
    setIsLoading(false);
  }, [pokemonName]);

  useEffect(() => {
    handleFetchPokemonDetails();
  }, [handleFetchPokemonDetails]);

  async function makePokemonFavorite() {
    await storage.save(pokemonName);
  }

  async function unlikePokemon() {
    await storage.remove();
  }

  return (
    <ScrollView>
      {pokemonDetails ? (
        <Image
          source={pokemonDetails.sprites.front_default}
          style={{ width: 200, height: 200 }}
        />
      ) : null}
      <Button
        disabled={isLoading || storage.loading}
        title={isFavorite ? "Unlike" : "Make Favourite"}
        onPress={isFavorite ? unlikePokemon : makePokemonFavorite}
      />
    </ScrollView>
  );
}
