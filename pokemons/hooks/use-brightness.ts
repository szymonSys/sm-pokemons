import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import { BrightnessModule } from "@/specs/NativeBrightnessModule";

export function useBrightness(): [brightness: number | null, changeBrightness: (brightness: number) => Promise<number>] {
  const [brightness, setBrightness] = useState<number | null>(null);
  useEffect(() => {
    BrightnessModule.getBrightness().then((brightness) => {
      setBrightness(brightness);
    });
  }, []);

  async function changeBrightness(brightness: number) {
    const newBrightness = await BrightnessModule.setBrightness(brightness);
    setBrightness(newBrightness);
    return newBrightness;
  }
  return [brightness, changeBrightness];
}

export function useBrightnessPermission(): [permission: boolean | null, requestPermission: () => Promise<void>] {
  const [permission, setPermission] = useState<boolean | null>(null);
  useEffect(() => {
    BrightnessModule.hasWriteSettingsPermission().then((permission) => {
      setPermission(permission);
    });
  }, []);
  async function requestPermission() {
    const permission = await BrightnessModule.requestWriteSettingsPermission();
    setPermission(permission);
  }
  return [permission, requestPermission];
}

export function useBrightnessListener() {
  const [brightness, setBrightness] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const currentBrightness = await BrightnessModule.getBrightness();
      setBrightness(currentBrightness);
    } catch (error) {
      console.error("Failed to get brightness:", error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") {
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

export function useBrightnessCallback(
  callback: (brightness: number) => void
) {
  useEffect(() => {
    if (Platform.OS !== "android") {
      BrightnessModule.getBrightness().then(callback).catch(console.error);
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
