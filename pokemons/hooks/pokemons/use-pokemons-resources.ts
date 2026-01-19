import {
  getPokemons,
  GetPokemonsRequestParams,
  PokemonResourceItem,
} from "@/apis/pokemons-api";
import { useEffect, useState } from "react";

export type UsePokemonsResourcesOptions = {
  autoLoad?: boolean;
} & Omit<GetPokemonsRequestParams, "offset">;

export function usePokemonsResources(
  options: UsePokemonsResourcesOptions = {}
) {
  const [pokemonResources, setPokemonResources] = useState<
    PokemonResourceItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const [urls, setUrls] = useState<{
    current?: string;
    next?: string;
    previous?: string;
  }>({});

  const loadPokemonsResources = async (
    localOptions: GetPokemonsRequestParams = {}
  ) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const response = await getPokemons({
      nextUrl: localOptions.nextUrl ?? urls.next,
      limit: localOptions.limit ?? options.limit ?? 20,
      offset: localOptions.offset ?? 0,
    });

    const resources = response.data?.results || [];

    setPokemonResources((prevPokemons) => [
      ...prevPokemons,
      ...(response.data?.results || []),
    ]);

    setUrls(() => ({
      current: response.url,
      prev: response.data?.previous ?? undefined,
      next: response.data?.next ?? undefined,
    }));

    setIsLoading(false);

    return resources;
  };

  useEffect(() => {
    options.autoLoad && loadPokemonsResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.autoLoad]);

  return {
    loadPokemonsResources,
    pokemonResources,
    pokemonsIsLoading: isLoading,
    pokemonResourcesUrl: urls,
  };
}
