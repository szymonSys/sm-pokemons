import { useNavigationEvent } from '@/hooks/use-navigation-event';
import { useStore, Keys } from '@/hooks/use-storage';
import { Redirect, useRouter } from 'expo-router';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBrightnessCallback,
  useBrightnessPermission,
  useStatelessBrightness,
} from '@/hooks/use-brightness';
import { Slider, SliderController } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
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

  const brightness = useStatelessBrightness([0, 100]);
  const [hasWriteSettingsPermission, requestPermission] = useBrightnessPermission();

  const { refresh } = useBrightnessCallback((newBrightness) => {
    console.log({ newBrightness });
  });

  useNavigationEvent('focus', refresh);

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
              initialValue={brightness.get()}
              changeProgressivelyOnceAtMs={0}
              onChange={brightness.set}
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
