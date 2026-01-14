import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { forwardRef, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import {
  useCameraDevice,
  useCameraPermission,
  Camera as CameraPreview,
  type CameraProps as VisionCameraProps,
  useLocationPermission,
  useFrameProcessor,
  runAsync,
} from "react-native-vision-camera";

import { useRunOnJS } from "react-native-worklets-core";
import {
  Face,
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type CameraProps = {
  isActive?: boolean;
} & Omit<VisionCameraProps, "device" | "isActive">;

type FaceProperties = Face["bounds"] &
  Pick<Face, "pitchAngle" | "yawAngle" | "rollAngle">;

export const Camera = forwardRef<CameraPreview, CameraProps>(function Camera(
  { isActive, ...visionCameraProps },
  ref
) {
  const [cameraIsActive, setCameraIsActive] = useState(false);
  const device = useCameraDevice("front");
  const faceDetectionOptions = useRef<FaceDetectionOptions>({}).current;
  const {
    hasPermission: hasLocationPermission,
    requestPermission: requestLocationPermission,
  } = useLocationPermission();
  const { hasPermission, requestPermission } = useCameraPermission();

  const faceArea = useSharedValue<FaceProperties>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rollAngle: 0,
    yawAngle: 0,
    pitchAngle: 0,
  });

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const handleDetectedFaces = useRunOnJS((faces: Face[]) => {
    const [face] = faces;
    if (face) {
      const { bounds, yawAngle, rollAngle, pitchAngle } = face;
      faceArea.set({ pitchAngle, yawAngle, rollAngle, ...bounds });
      console.log("yawAngle", face.yawAngle);
      console.log("pitchAngle", face.pitchAngle);
      console.log("rollAngle", face.rollAngle);
      console.log("-----------------------------------------------");
    } else {
      for (const prop in faceArea.value) {
        faceArea.value[prop as keyof FaceProperties] = 0;
      }
    }
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(faceArea.value.x) },
      { translateY: withSpring(faceArea.value.y) },
      { rotate: `${Math.round(faceArea.value.rollAngle)}deg` },
      { rotateY: `${Math.round(faceArea.value.yawAngle)}deg` },
      { rotateX: `${Math.round(faceArea.value.pitchAngle)}deg` },
    ],
    width: faceArea.value.width,
    height: faceArea.value.height,
  }));

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAsync(frame, () => {
        "worklet";
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
      });
    },
    [handleDetectedFaces]
  );

  // useEffect(() => {
  //   return () => {
  //     stopListeners();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraPreview
        ref={ref}
        enableLocation={hasLocationPermission}
        style={{ flex: 1 }}
        isActive={isActive ?? cameraIsActive}
        device={device}
        frameProcessor={frameProcessor}
        {...visionCameraProps}
      />
      <Animated.View style={[styles.faceFrame, animatedStyles]} />
    </View>
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
  faceFrame: {
    top: 0,
    left: 0,
    zIndex: 100,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "red",
    position: "absolute",
  },
});
