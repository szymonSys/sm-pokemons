import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPokemonsWithDetails,
  PokemonWithDetails,
} from "@/apis/pokemons-api";

export type UsePokemonsResourcesOptions = {
  autoLoad?: boolean;
  bufferSize?: number;
  windowSizePerSide?: number;
  initialOffset?: number;
  preloadSize?: number;
};

export enum LoadingDirection {
  Previous,
  Current,
  Next,
}

export type UsePokemonsWithBufferResult = {
  leftWindow: PokemonWithDetails[];
  rightWindow: PokemonWithDetails[];
  current: PokemonWithDetails;
  buffer: PokemonWithDetails[];
  bufferCurrentIndex: number;
  currentIndex: number;
  currentPokemon: PokemonWithDetails | undefined;
  pokemonsAreLoading: boolean;
  pokemons: PokemonWithDetails[];
  setPrevious: (onSet?: (index: number) => unknown) => Promise<void>;
  setNext: (onSet?: (index: number) => unknown) => Promise<void>;
  hasPrev: boolean;
  hasNext: boolean;
  prevPokemon: PokemonWithDetails | undefined;
  nextPokemon: PokemonWithDetails | undefined;
};

export function usePokemonsWithBuffer({
  autoLoad = true,
  initialOffset = 0,
  bufferSize = 10,
  windowSizePerSide = 1,
  preloadSize = 3,
}: UsePokemonsResourcesOptions = {}): UsePokemonsWithBufferResult {
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
    if (currentIndex + preloadSize >= pokemons.length) {
      if (!nextExists) {
        return;
      }
      !isLoading && (await loadPokemonsWithDetails(LoadingDirection.Next));
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
    return () => {
      setPokemons([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pokemonsWindow = useMemo(() => {
    const dataLastIndex = pokemons.length - 1;
    const bufferLeft = currentIndex - windowSizePerSide;
    const bufferRight = currentIndex + windowSizePerSide;
    const startIndex = bufferLeft <= 0 ? 0 : bufferLeft;
    const endIndex = bufferRight >= dataLastIndex ? dataLastIndex : bufferRight;
    const leftWindow = pokemons.slice(startIndex, currentIndex);
    const rightWindow = pokemons.slice(currentIndex + 1, endIndex + 1);
    const current = pokemons[currentIndex];
    const currentArr = current ? [current] : [];
    return {
      leftWindow,
      rightWindow,
      current,
      buffer: [...leftWindow, ...currentArr, ...rightWindow],
      bufferCurrentIndex: leftWindow.length,
    };
  }, [pokemons, currentIndex, windowSizePerSide]);

  return {
    ...pokemonsWindow,
    currentIndex,
    currentPokemon: pokemons[currentIndex],
    pokemonsAreLoading: isLoading,
    pokemons,
    setPrevious,
    setNext,
    hasPrev: pokemonsWindow.leftWindow.length > 0,
    hasNext: pokemonsWindow.rightWindow.length > 0,
    prevPokemon:
      pokemonsWindow.leftWindow[pokemonsWindow.leftWindow.length - 1],
    nextPokemon: pokemonsWindow.rightWindow[0],
  };
}
