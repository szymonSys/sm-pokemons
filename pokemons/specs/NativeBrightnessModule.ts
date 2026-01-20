import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBrightness(): Promise<number>;
  setBrightness(brightness: number): Promise<number>;
  hasWriteSettingsPermission(): Promise<boolean>;
  requestWriteSettingsPermission(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeBrightnessModule');
