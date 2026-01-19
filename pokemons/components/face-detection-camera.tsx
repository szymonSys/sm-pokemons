import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { forwardRef, useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Platform,
  ViewStyle,
  ImageProps,
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
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { throttleFactory } from "@/utils/common-utils";

export type CameraProps = {
  isActive?: boolean;
  imageUrl?: string;
};

export const FaceDetectionCamera = forwardRef<VisionCamera, CameraProps>(
  function Camera({ isActive, imageUrl }, ref) {
    const [cameraIsActive, setCameraIsActive] = useState(false);
    const faceAreaX = useSharedValue(0);
    const faceAreaY = useSharedValue(0);
    const faceAreaWidth = useSharedValue(0);
    const faceAreaHeight = useSharedValue(0);
    const faceRollAngle = useSharedValue(0);
    const faceYawAngle = useSharedValue(0);
    const facePitchAngle = useSharedValue(0);
    const faceOpacity = useSharedValue(0);

    const { width, height } = useWindowDimensions();

    const visionCameraRef = useRef<VisionCamera>(null);
    const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
      windowWidth: width,
      windowHeight: height,
      autoMode: true,
    }).current;

    const { hasPermission: hasLocationPermission } = useLocationPermission();
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice("front");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const logger = useCallback(
      throttleFactory((face: Face) => {
        console.log("Face bounds: ", face.bounds);
      }, 1000),
      []
    );

    useNavigationEvent("focus", () => setCameraIsActive(true));
    useNavigationEvent("blur", () => setCameraIsActive(false));

    const imageProps = useAnimatedProps<ImageProps>(() => ({
      width: faceAreaWidth.value,
      height: faceAreaHeight.value,
    }));

    const animatedStyles = useAnimatedStyle(() => {
      const isAndroid = Platform.OS === "android";
      const styles: ViewStyle = {
        transform: [
          {
            translateX: withSpring(faceAreaX.value),
          },
          { translateY: withSpring(faceAreaY.value) },
          { rotateZ: withSpring(`${Math.round(faceRollAngle.value)}deg`) },
          {
            rotateY: isAndroid
              ? withSpring(`${Math.round(faceYawAngle.value)}deg`)
              : "0deg",
          },
          {
            rotateX: isAndroid
              ? withSpring(`${Math.round(facePitchAngle.value)}deg`)
              : "0deg",
          },
        ],
        width: withSpring(faceAreaWidth.value),
        height: withSpring(faceAreaHeight.value),
        opacity: withSpring(faceOpacity.value),
      };

      return styles;
    });

    function handleFacesDetection(faces: Face[], frame: Frame) {
      const [face] = faces;
      if (face) {
        const {
          bounds: { height, width, x, y },
          yawAngle,
          rollAngle,
          pitchAngle,
        } = face;
        logger(face);
        faceAreaHeight.set(height);
        faceAreaWidth.set(width);
        faceAreaX.set(x);
        faceAreaY.set(y);
        faceRollAngle.set(rollAngle);
        faceYawAngle.set(yawAngle);
        facePitchAngle.set(pitchAngle);
        faceOpacity.set(1);
      } else {
        faceOpacity.set(0);
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
          <Animated.Image
            source={{ uri: imageUrl }}
            animatedProps={imageProps}
          />
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
    borderRadius: 1000,
  },
});
