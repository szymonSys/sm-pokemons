import { useNavigationEvent } from '@/hooks/use-navigation-event';
import { useStore, Keys } from '@/hooks/use-storage';
import { Redirect } from 'expo-router';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBrightness,
  useBrightnessCallback,
  useBrightnessListener,
  useBrightnessPermission,
} from '@/hooks/use-brightness';
import { Slider, SliderController } from '@/components/ui/slider';
import { useRef } from 'react';

export default function FavoriteView() {
  const {
    remove: removeFavorite,
    item: favoritePokemon,
    exists: favoriteExists,
    initialized: favoriteInitialized,
    get: getFavorite,
  } = useStore<string>(Keys.FavoritePokemon);

  useNavigationEvent('focus', getFavorite);

  const sliderControllerRef = useRef<SliderController>(null);

  const [_, changeBrightness] = useBrightness();
  const [hasWriteSettingsPermission, requestPermission] = useBrightnessPermission();
  const { brightness } = useBrightnessListener();

  useBrightnessCallback((brightness) => {
    console.log({ brightness });
    sliderControllerRef.current?.setValue(brightness * 100);
  });

  if (!favoriteInitialized) {
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
              onChange={(value) => {
                const normalizedValue = value / 100;
                changeBrightness(normalizedValue);
              }}
            />
          ) : null}
        </View>
        {favoriteExists ? <Button title="Unlike" onPress={removeFavorite} /> : null}
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
