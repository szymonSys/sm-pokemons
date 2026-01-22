import type { TurboModule } from 'react-native';
import { TurboModuleRegistry, NativeEventEmitter, NativeModules, Platform } from 'react-native';

export interface Spec extends TurboModule {
  getBrightness(): Promise<number>;
  setBrightness(brightness: number): Promise<number>;
  hasWriteSettingsPermission(): Promise<boolean>;
  requestWriteSettingsPermission(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const NativeBrightnessModule = TurboModuleRegistry.getEnforcing<Spec>('NativeBrightnessModule');

export const BrightnessEvents = {
  BRIGHTNESS_CHANGE: 'onBrightnessChange',
} as const;

export interface BrightnessChangeEvent {
  brightness: number;
}

export type BrightnessEventCallback = (event: BrightnessChangeEvent) => void;

export interface BrightnessEventSubscription {
  remove: () => void;
}

const eventEmitter =
  Platform.OS === 'android' ? new NativeEventEmitter(NativeModules.NativeBrightnessModule) : null;

let listenerCount = 0;
const callbackRegistry = new Map<BrightnessEventCallback, () => void>();

export const BrightnessModule = {
  getBrightness: () => NativeBrightnessModule.getBrightness(),

  setBrightness: (brightness: number) => NativeBrightnessModule.setBrightness(brightness),

  hasWriteSettingsPermission: () => NativeBrightnessModule.hasWriteSettingsPermission(),

  requestWriteSettingsPermission: () => NativeBrightnessModule.requestWriteSettingsPermission(),

  addEventListener: (callback: BrightnessEventCallback): BrightnessEventSubscription => {
    if (Platform.OS !== 'android' || !eventEmitter) {
      console.warn('BrightnessModule.addEventListener is only supported on Android');
      return { remove: () => {} };
    }
    const nativeSubscription = eventEmitter.addListener(
      BrightnessEvents.BRIGHTNESS_CHANGE,
      callback,
    );

    if (listenerCount === 0) {
      NativeBrightnessModule.addListener(BrightnessEvents.BRIGHTNESS_CHANGE);
    }
    listenerCount++;

    const remove = () => {
      if (!callbackRegistry.has(callback)) {
        return;
      }

      nativeSubscription.remove();
      callbackRegistry.delete(callback);
      listenerCount--;

      if (listenerCount === 0) {
        NativeBrightnessModule.removeListeners(1);
      }
    };
    callbackRegistry.set(callback, remove);

    return { remove };
  },

  removeEventListener: (callback: BrightnessEventCallback): void => {
    const remove = callbackRegistry.get(callback);
    if (remove) {
      remove();
    }
  },
};

export default NativeBrightnessModule;
