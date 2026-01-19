import { useLocalSearchParams } from "expo-router";
import { PokemonDetails } from "@/components/pokemon-details";
import { usePokemon } from "@/hooks/pokemons/use-pokemon";

export default function DetailsView() {
  const { pokemonName } = useLocalSearchParams<{ pokemonName: string }>();
  const { pokemon } = usePokemon({ initialIdOrName: pokemonName });

  return pokemon ? <PokemonDetails details={pokemon} /> : null;
}
