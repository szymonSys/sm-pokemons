import { CancelDebounceFn, debounceFactory } from '@/utils/common-utils';
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
  onChangeDeps?: unknown[];
};

export interface SliderController {
  setValue: (value: number) => void;
  getValue: () => number;
}

export const Slider = forwardRef<SliderController, SliderProps>(function Slider(
  {
    onChange: _onChange,
    initialValue,
    changeProgressivelyOnceAtMs: changeProgressivelyOnceAtMs,
    onChangeDeps = [],
  }: SliderProps,
  ref,
) {
  const onChange = useCallback((value: number) => {
    _onChange(value);
    // disable exhaustive deps warning because onChange is memoized with onChangeDeps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, onChangeDeps);

  const sharedValue = useSharedValue(initialValue);
  const sliderRef = useRef<View>(null);
  const thumbMarkRef = useRef<View>(null);
  const trackMarkRef = useRef<View>(null);
  const cancelProgressivelyChangeValueRef = useRef<CancelDebounceFn>(null);
  const sliderWidth = useSharedValue(0);
  const thumbMarkWidth = useSharedValue(0);
  const trackMarkHeight = useSharedValue(0);
  const shouldChangeValueProgressively = useSharedValue(changeProgressivelyOnceAtMs !== undefined);

  const progressivelyChangeValue = useMemo(() => {
    cancelProgressivelyChangeValueRef.current?.();
    // if (changeProgressivelyOnceAtMs === undefined || changeProgressivelyOnceAtMs < 1) {
    //   return onChange;
    // }
    const [debouncedUpdate, cancelUpdate] = debounceFactory((value: number): void => {
      onChange(value);
    }, changeProgressivelyOnceAtMs ?? 0);
    cancelProgressivelyChangeValueRef.current = cancelUpdate;
    return debouncedUpdate;
  }, [onChange, changeProgressivelyOnceAtMs]);

  const handleSlideEnd = useCallback(
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
      value = Math.ceil(value);
      sharedValue.set(value);
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
      const previousValue = sharedValue.get();
      const value = setNormalizedValue(e.x);
      if (previousValue === value) {
        return;
      }
      if (shouldChangeValueProgressively.get()) {
        runOnJS(progressivelyChangeValue)(value);
      }
    })
    .onEnd((e) => {
      runOnJS(handleSlideEnd)(sharedValue.get());
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
