import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from "react-native";
import {
  useCameraDevice,
  useCameraPermission,
  type Camera as VisionCamera,
  useLocationPermission,
  Frame,
} from "react-native-vision-camera";

import {
  Face,
  FrameFaceDetectionOptions,
  Camera as DetectorCamera,
} from "react-native-vision-camera-face-detector";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedReaction,
} from "react-native-reanimated";
import { throttleFactory } from "@/utils/common-utils";

export type CameraProps = {
  isActive?: boolean;
  imageUrl?: string;
};

type FaceProperties = Face["bounds"] &
  Pick<Face, "pitchAngle" | "yawAngle" | "rollAngle"> & { visible: boolean };

export const FaceDetectionCamera = forwardRef<VisionCamera, CameraProps>(
  function Camera({ isActive, imageUrl }, ref) {
    const [cameraIsActive, setCameraIsActive] = useState(false);
    const { width, height } = useWindowDimensions();

    const visionCameraRef = useRef<VisionCamera>(null);
    const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
      performanceMode: "fast",
      contourMode: "all",
      landmarkMode: "all",
      windowWidth: width,
      windowHeight: height,
      autoMode: true,
    }).current;

    const { hasPermission: hasLocationPermission } = useLocationPermission();
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice("front");

    const faceArea = useSharedValue<FaceProperties>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rollAngle: 0,
      yawAngle: 0,
      pitchAngle: 0,
      visible: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const logger = useCallback(
      throttleFactory((face: Face) => {
        console.log("Face bounds: ", face.bounds);
      }, 1000),
      []
    );

    useNavigationEvent("focus", () => setCameraIsActive(true));
    useNavigationEvent("blur", () => setCameraIsActive(false));

    const imageStyles = useAnimatedStyle(() => ({
      width: withSpring(faceArea.value.width),
      height: withSpring(faceArea.value.width),
    }));

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: withSpring(faceArea.value.x),
        },
        { translateY: withSpring(faceArea.value.y) },
        { rotate: withSpring(`${Math.round(faceArea.value.rollAngle)}deg`) },
        { rotateY: withSpring(`${Math.round(faceArea.value.yawAngle)}deg`) },
        { rotateX: withSpring(`${Math.round(faceArea.value.pitchAngle)}deg`) },
      ],
      width: withSpring(faceArea.value.width),
      height: withSpring(faceArea.value.height),
      display: faceArea.value.visible ? "flex" : "none",
    }));

    function handleFacesDetection(faces: Face[], frame: Frame) {
      const [face] = faces;
      if (face) {
        const { bounds, yawAngle, rollAngle, pitchAngle } = face;
        logger(face);
        faceArea.set({
          pitchAngle,
          yawAngle,
          rollAngle,
          visible: true,
          ...bounds,
        });
      } else {
        faceArea.value.visible = false;
        // for (const prop in faceArea.value) {
        //   faceArea.value[prop as keyof FaceProperties] = 0;
        // }
      }
    }

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
          <Text>Camera doesn&apos;t work</Text>
        </View>
      );
    }

    return (
      <View style={[StyleSheet.absoluteFill]}>
        <DetectorCamera
          ref={visionCameraRef}
          enableLocation={hasLocationPermission}
          style={{ flex: 1 }}
          isActive={isActive ?? cameraIsActive}
          device={device}
          faceDetectionCallback={handleFacesDetection}
          faceDetectionOptions={faceDetectionOptions}
        />
        <Animated.View style={[styles.faceFrame, animatedStyles]}>
          <Animated.Image source={{ uri: imageUrl }} style={imageStyles} />
        </Animated.View>
      </View>
    );
  }
);

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
  cameraWrapper: {},
  faceFrame: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    zIndex: 100,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "red",
    position: "absolute",
    borderRadius: 300,
  },
});
