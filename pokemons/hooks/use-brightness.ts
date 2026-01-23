import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { BrightnessEventSubscription, BrightnessModule } from 'react-native-brightness';

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
