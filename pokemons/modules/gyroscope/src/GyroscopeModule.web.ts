import { registerWebModule, NativeModule } from "expo";

import { GyroscopeUpdatePayload } from "./Gyroscope.types";

type GyroscopeModuleEvents = {
  onGyroscopeUpdate: (params: GyroscopeUpdatePayload) => void;
};

class GyroscopeModule extends NativeModule<GyroscopeModuleEvents> {
  // Stub: Check if gyroscope is available (not implemented for web yet)
  isGyroscopeAvailable(): boolean {
    return false;
  }

  // Stub: Set update interval (not implemented for web yet)
  setUpdateInterval(_intervalMs: number): void {
    // No-op for web
  }

  // Stub: Start gyroscope updates (not implemented for web yet)
  async startGyroscopeUpdates(): Promise<boolean> {
    return false;
  }

  // Stub: Stop gyroscope updates (not implemented for web yet)
  stopGyroscopeUpdates(): void {
    // No-op for web
  }
}

export default registerWebModule(GyroscopeModule, "GyroscopeModule");
