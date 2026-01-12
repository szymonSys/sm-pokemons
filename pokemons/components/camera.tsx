import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { forwardRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import {
  useCameraDevice,
  useCameraPermission,
  Camera as CameraPreview,
  type CameraProps as VisionCameraProps,
  useLocationPermission,
  useFrameProcessor,
} from "react-native-vision-camera";

import { labelImage } from "vision-camera-image-labeler";

export type CameraProps = {
  isActive?: boolean;
} & Omit<VisionCameraProps, "device" | "isActive">;

export const Camera = forwardRef<CameraPreview, CameraProps>(function Camera(
  { isActive, ...visionCameraProps },
  ref
) {
  const [cameraIsActive, setCameraIsActive] = useState(false);
  const device = useCameraDevice("front");
  const {
    hasPermission: hasLocationPermission,
    requestPermission: requestLocationPermission,
  } = useLocationPermission();
  const { hasPermission, requestPermission } = useCameraPermission();

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    console.log(`You're looking at a ${frame.timestamp}.`);
  }, []);

  useNavigationEvent("focus", () => setCameraIsActive(true));
  useNavigationEvent("blur", () => setCameraIsActive(false));

  if (!hasPermission) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.wrapper]}>
        <TouchableOpacity
          activeOpacity={0.3}
          style={styles.permissionButton}
          onPress={async () => {
            await requestPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Use camera</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (device == null) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.wrapper]}>
        <Text>Doesn&apos;t work</Text>
      </View>
    );
  }

  console.log(device);

  return (
    <CameraPreview
      ref={ref}
      enableLocation={hasLocationPermission}
      style={StyleSheet.absoluteFill}
      isActive={isActive ?? cameraIsActive}
      device={device}
      frameProcessor={frameProcessor}
      {...visionCameraProps}
    />
  );
});

const styles = StyleSheet.create({
  permissionButton: {
    backgroundColor: "#3bee2eff",
    padding: 8,
    margin: 8,
    width: "100%",
  },
  permissionButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#f1f1f1",
    fontWeight: "normal",
  },
  wrapper: {
    marginTop: 64,
  },
});
