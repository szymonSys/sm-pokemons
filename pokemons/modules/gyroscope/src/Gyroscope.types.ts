import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type GyroscopeListener = (params: GyroscopeUpdatePayload) => void;

export type GyroscopeModuleEvents = {
  onGyroscopeUpdate: GyroscopeListener;
};

export type Quaternion = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type Attitude = {
  roll: number;
  pitch: number;
  yaw: number;
};

export type GyroscopeUpdatePayload = {
  quaternion: Quaternion;
  attitude: Attitude;
  timestamp: number;
  error?: string;
};

export type GyroscopeViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
