import { DebounceResult, debounceFactory } from '@/utils/common-utils';
import { RefObject, forwardRef, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type SliderProps = {
  initialValue: number;
  onChange: (value: number) => void;
  changeProgressivelyOnceAtMs?: number;
};

export interface SliderController {
  setValue: (value: number) => void;
  getValue: () => number;
}

export const Slider = forwardRef<SliderController, SliderProps>(function Slider(
  { onChange, initialValue, changeProgressivelyOnceAtMs: changeProgressivelyOnceAtMs }: SliderProps,
  ref,
) {
  const sharedValue = useSharedValue(initialValue);
  const sliderRef = useRef<View>(null);
  const thumbMarkRef = useRef<View>(null);
  const trackMarkRef = useRef<View>(null);
  const cancelProgressivelyChangeValueRef = useRef<DebounceResult<void>[1]>(null);
  const sliderWidth = useSharedValue(0);
  const thumbMarkWidth = useSharedValue(0);
  const trackMarkHeight = useSharedValue(0);
  const shouldChangeValueProgressively = useSharedValue(changeProgressivelyOnceAtMs !== undefined);

  const progressivelyChangeValue = useMemo(
    () =>
      debounceFactory((value: number): void => {
        onChange(value);
      }, changeProgressivelyOnceAtMs),
    [onChange, changeProgressivelyOnceAtMs],
  );

  const handleProgressivelyChangeValue = useCallback(
    (value: number): void => {
      const [_, cancel] = progressivelyChangeValue(value);
      cancelProgressivelyChangeValueRef.current = cancel;
    },
    [progressivelyChangeValue],
  );

  const handleOnSlideEnd = useCallback(
    (value: number): void => {
      cancelProgressivelyChangeValueRef.current?.();
      onChange(value);
    },
    [onChange],
  );

  const setNormalizedValue = useCallback(
    (x: number): number => {
      'worklet';
      let value = interpolate(
        x,
        [thumbMarkWidth.get(), sliderWidth.get() - thumbMarkWidth.get()],
        [0, 100],
      );
      if (value < 0) {
        value = 0;
      }
      if (value > 100) {
        value = 100;
      }
      sharedValue.set(Math.ceil(value));
      return value;
    },
    [sharedValue, sliderWidth, thumbMarkWidth],
  );

  useLayoutEffect(() => {
    if (ref) {
      (ref as RefObject<SliderController>).current = {
        setValue: (value: number) => {
          if (value < 0) {
            value = 0;
          }
          if (value > 100) {
            value = 100;
          }
          sharedValue.set(value);
        },
        getValue: () => Math.ceil(sharedValue.get()),
      };
    }
    sliderRef.current?.measure((_, __, width) => {
      sliderWidth.set(width);
    });
    thumbMarkRef.current?.measure((_, __, width) => {
      thumbMarkWidth.set(width);
    });
    trackMarkRef.current?.measure((_, __, width, height) => {
      trackMarkHeight.set(height);
    });
  }, [
    sliderRef,
    sliderWidth,
    thumbMarkRef,
    thumbMarkWidth,
    sharedValue,
    ref,
    trackMarkRef,
    trackMarkHeight,
  ]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const value = setNormalizedValue(e.x);
      if (shouldChangeValueProgressively.get()) {
        runOnJS(handleProgressivelyChangeValue)(value);
      }
    })
    .onEnd((e) => {
      runOnJS(handleOnSlideEnd)(sharedValue.get());
    });

  const pressGesture = Gesture.Tap()
    .onStart((e) => {
      setNormalizedValue(e.x);
    })
    .onEnd((e) => {
      runOnJS(onChange)(sharedValue.get());
    });

  const sliderThumbAnimatedStyles = useAnimatedStyle(() => {
    const interpolatedValue = interpolate(
      sharedValue.get(),
      [0, 100],
      [0, sliderWidth.get() - thumbMarkWidth.get()],
    );
    return {
      transform: [
        {
          translateX: withSpring(interpolatedValue, { duration: 20 }),
        },
      ],
    };
  });

  const sliderTrackAnimatedStyles = useAnimatedStyle(() => {
    const interpolatedValue = interpolate(
      sharedValue.get(),
      [0, 100],
      [thumbMarkWidth.get() / 2, sliderWidth.get() - thumbMarkWidth.get() / 2],
    );
    return {
      width: withSpring(interpolatedValue, { duration: 20 }),
    };
  });

  const trackMarkAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: thumbMarkWidth.get() / 2 - trackMarkHeight.get() / 2 }],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(panGesture, pressGesture)}>
        <Animated.View ref={sliderRef} style={[styles.slider]}>
          <Animated.View ref={trackMarkRef} style={[styles.trackMark, trackMarkAnimatedStyles]} />
          <Animated.View
            ref={thumbMarkRef}
            style={[styles.sliderThumb, sliderThumbAnimatedStyles]}
          />
          <Animated.View style={[styles.sliderTrack, sliderTrackAnimatedStyles]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sliderTrack: {
    height: '100%',
    backgroundColor: '#008bff',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    zIndex: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  slider: {
    position: 'relative',
    width: '100%',
    height: 42,
    backgroundColor: 'transparent',
  },
  trackMark: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    borderRadius: 100,
  },
  sliderThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 42,
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 100,
    zIndex: 3,
  },
});
