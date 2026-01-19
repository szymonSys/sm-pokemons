import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPokemonsWithDetails,
  PokemonWithDetails,
} from "@/apis/pokemons-api";

export type UsePokemonsResourcesOptions = {
  autoLoad?: boolean;
  bufferSize?: number;
  bufferSizePerSide?: number;
  initialOffset?: number;
};

export enum LoadingDirection {
  Previous,
  Current,
  Next,
}

export function usePokemonsWithBuffer({
  autoLoad = true,
  initialOffset = 0,
  bufferSize = 10,
  bufferSizePerSide = 1,
}: UsePokemonsResourcesOptions = {}) {
  const offsetRef = useRef(initialOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialOffset);
  const [pokemons, setPokemons] = useState<PokemonWithDetails[]>([]);
  const [nextExists, setNextExists] = useState(false);

  async function loadPokemonsWithDetails(
    loadingDirection: LoadingDirection = LoadingDirection.Current
  ) {
    setIsLoading(true);
    switch (loadingDirection) {
      case LoadingDirection.Previous:
        if (offsetRef.current - bufferSize >= 0)
          offsetRef.current -= bufferSize;
      case LoadingDirection.Next:
        offsetRef.current += bufferSize;
    }
    const { data, next } = await getPokemonsWithDetails({
      offset: offsetRef.current,
      limit: bufferSize,
    });
    setNextExists(!!next);
    setPokemons((currentPokemons) => [...currentPokemons, ...data]);
    setIsLoading(false);
  }

  async function setNext(onSet?: (index: number) => unknown) {
    if (currentIndex + 1 >= pokemons.length) {
      if (!nextExists) {
        return;
      }
      await loadPokemonsWithDetails(LoadingDirection.Next);
    }
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    onSet?.(newIndex);
  }

  async function setPrevious(onSet?: (index: number) => unknown) {
    if (currentIndex <= 0) {
      return;
    }
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    onSet?.(newIndex);
  }

  useEffect(() => {
    autoLoad && loadPokemonsWithDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev: PokemonWithDetails | undefined = pokemons[currentIndex - 1];
  const current: PokemonWithDetails | undefined = pokemons[currentIndex];
  const next: PokemonWithDetails | undefined = pokemons[currentIndex + 1];

  const pokemonsWindow = useMemo(() => {
    const dataLastIndex = pokemons.length - 1;
    const bufferLeft = currentIndex - bufferSizePerSide;
    const bufferRight = currentIndex + bufferSizePerSide;
    const startIndex = bufferLeft <= 0 ? 0 : bufferLeft;
    const endIndex = bufferRight >= dataLastIndex ? dataLastIndex : bufferRight;
    console.log({
      startIndex,
      endIndex,
      currentIndex,
      // pokemons: pokemons.map((item, index) => ({ item: item.url, index })),
    });
    const window = pokemons.slice(startIndex, endIndex + 1);
    const leftWindow = pokemons.slice(startIndex, currentIndex);
    const rightWindow = pokemons.slice(currentIndex + 1, endIndex + 1);
    const current = pokemons[currentIndex];
    return {
      leftWindow,
      rightWindow,
      current,
      window,
      widnowCurrentIndex: leftWindow.length,
    };
  }, [pokemons, currentIndex, bufferSizePerSide]);

  return {
    pokemonsWindow,
    currentIndex,
    currentPokemon: pokemons[currentIndex],
    pokemonsAreLoading: isLoading,
    pokemons,
    setPrevious,
    setNext,
    prev,
    current,
    next,
    hasPrev: !!prev,
    hasNext: !!next,
  };
}
