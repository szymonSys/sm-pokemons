import { useNavigationEvent } from '@/hooks/use-navigation-event';
import { useStore, Keys } from '@/hooks/use-storage';
import { Redirect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBrightness,
  useBrightnessCallback,
  useBrightnessListener,
  useBrightnessPermission,
} from '@/hooks/use-brightness';
import { Slider, SliderController } from '@/components/ui/slider';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PokemonDetailsResponse, getPokemonDetailsById } from '@/apis/pokemons-api';
import { PokemonDetails } from '@/components/pokemon-details';

export default function FavoriteView() {
  const { item: favoritePokemon, exists: favoriteExists } = useStore<string>(Keys.FavoritePokemon);

  const [pokemon, setPokemon] = useState<PokemonDetailsResponse | null>(null);

  useEffect(() => {
    if (favoritePokemon) {
      getPokemonDetailsById(favoritePokemon).then(({ data }) => data && setPokemon(data));
    }
  }, [favoritePokemon]);

  const router = useRouter();

  const sliderControllerRef = useRef<SliderController>(null);

  const [_, changeBrightness] = useBrightness();
  const [hasWriteSettingsPermission, requestPermission] = useBrightnessPermission();
  const { brightness } = useBrightnessListener();

  useBrightnessCallback((brightness) => {
    console.log({ brightness });
  });

  const handleChangeBrightness = useCallback(
    (value: number) => {
      const normalizedValue = value / 100;
      changeBrightness(normalizedValue);
    },
    [changeBrightness],
  );

  if (!favoriteExists) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.wrapper}>
        {!hasWriteSettingsPermission && (
          <Button title="Request Permission" onPress={() => requestPermission()} />
        )}
        <View style={styles.sliderWrapper}>
          {hasWriteSettingsPermission && brightness !== null ? (
            <Slider
              ref={sliderControllerRef}
              initialValue={brightness * 100}
              changeProgressivelyOnceAtMs={0}
              onChange={handleChangeBrightness}
            />
          ) : null}
        </View>
        <View>
          {pokemon ? (
            <PokemonDetails
              details={pokemon}
              onChangeFavorite={() => {
                router.push('/');
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  sliderWrapper: {},
  text: {
    color: '#f1f1f1',
  },
});
