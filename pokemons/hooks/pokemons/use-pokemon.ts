import {
  getPokemonDetailsById,
  PokemonDetailsResponse,
} from "@/apis/pokemons-api";
import { useCallback, useEffect, useState } from "react";

export type UsePokemonOptions = {
  initialIdOrName?: string;
};

export function usePokemon({ initialIdOrName }: UsePokemonOptions = {}) {
  const [pokemon, setPokemon] = useState<PokemonDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPokemon = useCallback(async (nameOrId: string) => {
    setIsLoading(true);
    const { data } = await getPokemonDetailsById(nameOrId);
    data && setPokemon(data);
    setIsLoading(false);
    return data;
  }, []);

  useEffect(() => {
    initialIdOrName && loadPokemon(initialIdOrName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdOrName]);

  return {
    loadPokemon,
    pokemon,
    pokemonIsLoading: isLoading,
  };
}
