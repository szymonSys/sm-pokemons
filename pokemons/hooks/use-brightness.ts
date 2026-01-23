import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { BrightnessModule } from 'react-native-brightness';

export function useBrightness(): [
  brightness: number | null,
  changeBrightness: (brightness: number) => number,
] {
  const [brightness, setBrightness] = useState<number | null>(null);
  useEffect(() => {
    const currentBrightness = BrightnessModule.getBrightness();
    setBrightness(currentBrightness);
  }, []);

  function changeBrightness(brightness: number) {
    const newBrightness = BrightnessModule.setBrightness(brightness);
    setBrightness(newBrightness);
    return newBrightness;
  }
  return [brightness, changeBrightness];
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

export function useBrightnessListener() {
  const [brightness, setBrightness] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const refresh = useCallback(() => {
    try {
      const currentBrightness = BrightnessModule.getBrightness();
      setBrightness(currentBrightness);
    } catch (error) {
      console.error('Failed to get brightness:', error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      refresh();
      return;
    }

    const subscription = BrightnessModule.addEventListener((event) => {
      setBrightness(event.brightness);
    });
    setIsListening(true);

    return () => {
      subscription.remove();
      setIsListening(false);
    };
  }, [refresh]);

  return {
    brightness,
    isListening,
    refresh,
  };
}

export function useBrightnessCallback(callback: (brightness: number) => void) {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      callback(BrightnessModule.getBrightness());
      return;
    }

    const subscription = BrightnessModule.addEventListener((event) => {
      callback(event.brightness);
    });
    return () => {
      subscription.remove();
    };
  }, [callback]);
}
