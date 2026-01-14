import {
  getPokemonDetailsById,
  PokemonDetailsResponse,
} from "@/apis/pokemons-api";
import { FaceDetectionCamera } from "@/components/face-detection-camera";
import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { Keys, useStore } from "@/hooks/use-storage";
import { useEffect, useState } from "react";
import {} from "react-native-vision-camera";

export default function CameraView() {
  const { item, get } = useStore<string>(Keys.FavoritePokemon);
  const [pokemon, setPokemon] = useState<PokemonDetailsResponse | null>(null);

  useNavigationEvent("focus", async () => await get());

  useEffect(() => {
    if (!item) {
      return;
    }
    getPokemonDetailsById(item).then(({ data }) => data && setPokemon(data));
  }, [item]);

  return (
    <FaceDetectionCamera
      imageUrl={pokemon?.sprites.front_default ?? undefined}
    />
  );
}
