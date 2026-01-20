import {  useLayoutEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
export type SliderProps = {
  initialValue: number;
  onChange: (value: number) => void;
}
export function Slider({ onChange, initialValue}: SliderProps) {
  const sharedValue = useSharedValue(initialValue);
  const sliderRef = useRef<View>(null);
  const sliderWidth = useSharedValue(0);

  useLayoutEffect(() => {
    sliderRef.current?.measure((_, __, width ) => {
      sliderWidth.set(width);
    });
  }, [sliderRef, sliderWidth]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const value = interpolate(e.absoluteX, [0, sliderWidth.get()], [0, 100])
      sharedValue.set(Math.ceil(value))
    }).onEnd((e) => {
     runOnJS(onChange)(sharedValue.value);
    });

  const sliderThumbAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(sharedValue.value, [0, 100], [0, sliderWidth.get()]) - 80, }],
    };
  });

  const sliderTrackAnimatedStyles = useAnimatedStyle(() => {
    return {
      width: interpolate(sharedValue.value, [0, 100], [0, sliderWidth.get()]),
    };
  });

  return (
    <View style={styles.container}>
<GestureDetector gesture={panGesture}>
  <View ref={sliderRef} style={[styles.slider]}>
    <Animated.View style={[styles.sliderThumb, sliderThumbAnimatedStyles]} />
    <Animated.View style={[styles.sliderTrack, sliderTrackAnimatedStyles]} />
  </View>
</GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderTrack: {
    height: "100%",
    backgroundColor: "blue",
  },
  slider: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
  },
  sliderThumb: {
    position: "absolute",
    top: 0,
    left: 0,
width:80,
height:80,
    backgroundColor: "red",
    borderRadius: 10,
    zIndex: 100,
  },
});