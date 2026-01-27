import { NativeModule, requireNativeModule } from "expo";

import { GyroscopeModuleEvents, GyroscopeListener } from "./Gyroscope.types";
import { runOnUI } from "react-native-reanimated";

declare class GyroscopeModule extends NativeModule<GyroscopeModuleEvents> {
  isGyroscopeAvailable(): boolean;
  setUpdateInterval(intervalMs: number): void;
  startGyroscopeUpdates(): Promise<boolean>;
  stopGyroscopeUpdates(): void;
}

// This call loads the native module object from the JSI.
const GyroscopeImpl = requireNativeModule<GyroscopeModule>("Gyroscope");

export class Gyroscope {
  private static instance: Gyroscope;
  private gyroscopeImpl: GyroscopeModule;
  private listeners = new Map<GyroscopeListener, () => void>();
  private constructor(gyroscopeImpl: GyroscopeModule) {
    this.gyroscopeImpl = gyroscopeImpl;
  }

  static use(): Gyroscope {
    if (!Gyroscope.instance) {
      Gyroscope.instance = new Gyroscope(GyroscopeImpl);
    }
    return Gyroscope.instance;
  }

  public isAvailable(): boolean {
    return this.gyroscopeImpl.isGyroscopeAvailable();
  }

  public setInterval(intervalMs: number): this {
    this.gyroscopeImpl.setUpdateInterval(intervalMs);
    return this;
  }

  public subscribe(
    _listener: GyroscopeListener,
    options?: {
      intervalMs?: number;
    }
  ): () => void {
    if (options?.intervalMs !== undefined) {
      this.setInterval(options.intervalMs);
    }

    const listener = runOnUI(_listener);

    const subscription = this.gyroscopeImpl.addListener(
      "onGyroscopeUpdate",
      listener
    );

    this.gyroscopeImpl.startGyroscopeUpdates();

    const cleanup = () => {
      subscription.remove();
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.gyroscopeImpl.stopGyroscopeUpdates();
      }
    };

    this.listeners.set(listener, cleanup);

    return cleanup;
  }
}

export default GyroscopeImpl;
