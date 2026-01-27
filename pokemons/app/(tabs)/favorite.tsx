import { useNavigationEvent } from "@/hooks/use-navigation-event";
import { useStore, Keys } from "@/hooks/use-storage";
import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GyroscopeUpdatePayload, Quaternion } from "@/modules/gyroscope";
import { useCallback } from "react";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { throttleFactory } from "@/utils/common-utils";
import { useGyroscope } from "@/hooks/use-gyroscope";

const quaternionLogger = throttleFactory(
  (quaternion: { x: number; y: number; z: number; w: number }) => {
    console.log("x: ", quaternion.x.toFixed(2) + " rad");
    console.log("y: ", quaternion.y.toFixed(2) + " rad");
    console.log("z: ", quaternion.z.toFixed(2) + " rad");
    console.log("w: ", quaternion.w.toFixed(2) + " rad");
    console.log("--------------------------------");
  },
  1000
);

const degreesLogger = throttleFactory(
  (degrees: { x: number; y: number; z: number }) => {
    console.log("x: ", degrees.x.toFixed(2) + " deg");
    console.log("y: ", degrees.y.toFixed(2) + " deg");
    console.log("z: ", degrees.z.toFixed(2) + " deg");
    console.log("--------------------------------");
  },
  1000
);

export default function FavoriteView() {
  const { initialized: favoriteInitialized, get: getFavorite } =
    useStore<string>(Keys.FavoritePokemon);

  const quaternion = useSharedValue<Quaternion>({ x: 0, y: 0, z: 0, w: 0 });
  const previousYaw = useSharedValue(0);
  const unwrappedYaw = useSharedValue(0);

  const angles = useDerivedValue(() => {
    const { x, y, z, w } = quaternion.get();

    const unwrapAngle = (
      raw: number,
      prev: number,
      unwrapped: number
    ): number => {
      "worklet";
      let delta = raw - prev;
      if (delta > Math.PI) {
        delta -= 2 * Math.PI;
      } else if (delta < -Math.PI) {
        delta += 2 * Math.PI;
      }
      return unwrapped + delta;
    };

    // Convert quaternion to euler angles
    // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
    const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
    const pitch = Math.asin(2 * (w * y - z * x));
    const rawYaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    const yaw = unwrapAngle(rawYaw, previousYaw.get(), unwrappedYaw.get());

    // Store current values for next frame
    previousYaw.set(rawYaw);
    unwrappedYaw.set(yaw);

    return { roll, pitch, yaw };
  });

  const colors = useDerivedValue(() => {
    const { roll, pitch, yaw } = angles.get();
    const red = interpolate(roll, [-Math.PI, Math.PI], [0, 255]);
    const green = interpolate(pitch, [-Math.PI, Math.PI], [0, 255]);
    const blue = interpolate(yaw, [-Math.PI, Math.PI], [0, 255]);
    return { red, green, blue };
  });

  const lastUpdateTimestamp = useSharedValue<number | null>(null);

  useNavigationEvent("focus", getFavorite);

  const updateValues = useCallback(
    (event: GyroscopeUpdatePayload) => {
      "worklet";
      lastUpdateTimestamp.set(event.timestamp);
      quaternion.set(event.quaternion);
      runOnJS(quaternionLogger)(event.quaternion);
    },
    [lastUpdateTimestamp, quaternion]
  );

  useGyroscope(updateValues, { intervalMs: 10 });

  const animatedCard = useAnimatedStyle(() => {
    const { roll, pitch, yaw } = angles.get();

    const xDegrees = -toDegrees(roll);
    const yDegrees = -toDegrees(pitch);
    const zDegrees = toDegrees(yaw);

    runOnJS(degreesLogger)({ x: xDegrees, y: yDegrees, z: zDegrees });

    const { red, green, blue } = colors.get();

    function toDegrees(radians: number) {
      return radians * (180 / Math.PI);
    }

    return {
      borderBottomColor: withSpring(`rgb(${red}, ${green}, ${blue})`),
      transform: [
        {
          rotateX: withSpring(`${xDegrees}deg`),
        },
        {
          rotateY: withSpring(`${yDegrees}deg`),
        },
        {
          rotateZ: withSpring(`${zDegrees}deg`),
        },
      ],
    };
  });

  if (!favoriteInitialized) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <View style={styles.wrapper}>
        <Animated.View style={[styles.card, animatedCard]}></Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 0,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 320,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    backgroundColor: "transparent",
  },
  text: {
    color: "#f1f1f1",
  },
});
