import { isNotNullish, isNullish } from '@/utils/assertion-utils';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { BrightnessEventSubscription, BrightnessModule } from 'react-native-brightness';
import { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated';

export type BrightnessController = {
  get: () => number;
  set: (brightness: number) => number;
};

export function useBrightness(): readonly [
  brightness: number | null,
  changeBrightness: (brightness: number) => number,
] {
  const [brightness, setBrightness] = useState<number | null>(null);
  useEffect(() => {
    const currentBrightness = BrightnessModule.getBrightness();
    setBrightness(currentBrightness);
  }, []);

  const changeBrightness = useCallback((brightness: number) => {
    const newBrightness = BrightnessModule.setBrightness(brightness);
    setBrightness(newBrightness);
    return newBrightness;
  }, []);
  return [brightness, changeBrightness] as const;
}
export function useSharedBrightness(): BrightnessController {
  const brightness = useSharedValue<number>(BrightnessModule.getBrightness());
  return useMemo<BrightnessController>(
    () => ({
      get() {
        'worklet';
        brightness.set(BrightnessModule.getBrightness());
        return brightness.get();
      },
      set(newBrightness) {
        'worklet';
        brightness.set(BrightnessModule.setBrightness(newBrightness));
        return brightness.get();
      },
    }),
    [brightness],
  );
}

export function useStatelessBrightness(
  interpolateRange?: readonly [number, number],
): BrightnessController {
  const [from, to] = interpolateRange ?? [];
  return useMemo<BrightnessController>(
    () => ({
      get() {
        const brightnessValue = BrightnessModule.getBrightness();
        if (isNullish(from) || isNullish(to)) {
          return brightnessValue;
        }
        return interpolate(brightnessValue, [0, 1], [from, to], Extrapolation.CLAMP);
      },
      set(newBrightness) {
        if (isNotNullish(from) && isNotNullish(to)) {
          newBrightness = interpolate(newBrightness, [from, to], [0, 1], Extrapolation.CLAMP);
        }
        return BrightnessModule.setBrightness(newBrightness);
      },
    }),
    [from, to],
  );
}

export function useBrightnessPermission(): [
  permission: boolean | null,
  requestPermission: () => void,
] {
  const [permission, setPermission] = useState<boolean | null>(null);
  useEffect(() => {
    const hasPermission = BrightnessModule.hasWriteSettingsPermission();
    setPermission(hasPermission);
  }, []);
  function requestPermission() {
    const granted = BrightnessModule.requestWriteSettingsPermission();
    setPermission(granted);
  }
  return [permission, requestPermission];
}

export function useBrightnessCallback(
  callback: (brightness: number) => void,
  deps: unknown[] = [],
) {
  const subscriptionRef = useRef<BrightnessEventSubscription | null>(null);

  // disable exhaustive deps warning because callback is memoized with deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback((brightness: number) => callback(brightness), deps);

  const cleanup = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const startListening = useCallback(() => {
    cleanup();
    if (Platform.OS !== 'android') {
      memoizedCallback(BrightnessModule.getBrightness());
      return;
    }
    subscriptionRef.current = BrightnessModule.addEventListener((event) => {
      memoizedCallback(event.brightness);
    });
  }, [memoizedCallback, cleanup]);

  useEffect(() => {
    startListening();
    return () => {
      cleanup();
    };
  }, [cleanup, startListening]);

  return { refresh: startListening };
}
