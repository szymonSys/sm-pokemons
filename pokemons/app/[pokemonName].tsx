import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  getPokemonDetailsById,
  PokemonDetailsResponse,
} from "@/apis/pokemons-api";
import { PokemonDetails } from "@/components/pokemon-details";

export default function DetailsView() {
  const { pokemonName } = useLocalSearchParams<{ pokemonName: string }>();
  const [pokemonDetails, setPokemonDetails] =
    useState<PokemonDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchPokemonDetails = useCallback(async () => {
    setIsLoading(true);
    const result = await getPokemonDetailsById(pokemonName);
    setPokemonDetails(result.data || null);
    setIsLoading(false);
  }, [pokemonName]);

  useEffect(() => {
    handleFetchPokemonDetails();
  }, [handleFetchPokemonDetails]);

  return pokemonDetails ? <PokemonDetails details={pokemonDetails} /> : null;
}
