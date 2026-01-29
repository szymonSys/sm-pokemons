import { CancelDebounceFn, debounceFactory } from '@/utils/common-utils';
import {
  RefObject,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  clamp,
  interpolate,
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type SliderProps = {
  initialValue: number;
  onChange: (value: number) => void;
  changeProgressivelyOnceAtMs?: number;
  progressivelyChangeEnabled?: boolean;
  onChangeDeps?: unknown[];
};

export interface SliderController {
  setValue: (value: number) => void;
  getValue: () => number;
}

const SLIDER_HEIGHT = 42;
const THUMB_MARK_SIZE = SLIDER_HEIGHT;
const TRACK_MARK_HEIGHT = SLIDER_HEIGHT * 0.2;

function normalizeValue(receivedValue: number, sliderWidth: number): number {
  'worklet';
  const value = interpolate(
    receivedValue,
    [0, sliderWidth - THUMB_MARK_SIZE],
    [0, 100],
    Extrapolation.CLAMP,
  );
  return Math.round(value);
}

export const Slider = forwardRef<SliderController, SliderProps>(function Slider(
  {
    onChange: _onChange,
    initialValue,
    changeProgressivelyOnceAtMs = 10,
    progressivelyChangeEnabled = true,
    onChangeDeps = [],
  }: SliderProps,
  ref,
) {
  const onChange = useCallback((value: number) => {
    _onChange(value);
    // disable exhaustive deps warning because onChange is memoized with onChangeDeps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, onChangeDeps);

  useImperativeHandle(ref, () => ({
    setValue: (value: number) => sharedValue.set(clamp(Math.round(value), 0, 100)),
    getValue: () => clamp(sharedValue.get(), 0, 100),
  }));

  const sharedValue = useSharedValue(initialValue);
  const sliderWidth = useSharedValue(0);
  const sliderRef = useAnimatedRef();
  const cancelProgressivelyChangeValueRef = useRef<CancelDebounceFn>(null);

  const progressivelyChangeValue = useMemo(() => {
    cancelProgressivelyChangeValueRef.current?.();

    const [debouncedUpdate, cancelUpdate] = debounceFactory(onChange, changeProgressivelyOnceAtMs);

    cancelProgressivelyChangeValueRef.current = cancelUpdate;

    return debouncedUpdate;
  }, [onChange, changeProgressivelyOnceAtMs]);

  const handleSlideEnd = (value: number): void => {
    cancelProgressivelyChangeValueRef.current?.();
    onChange(value);
  };

  useLayoutEffect(() => {
    runOnUI(() => {
      const dimensions = measure(sliderRef);
      if (dimensions) {
        sliderWidth.set(dimensions.width);
      }
    })();
  }, [sliderRef, sliderWidth]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const previousValue = sharedValue.get();
      const value = normalizeValue(e.x, sliderWidth.get());
      sharedValue.set(value);
      if (previousValue === value) {
        return;
      }
      if (progressivelyChangeEnabled) {
        runOnJS(progressivelyChangeValue)(sharedValue.get());
      }
    })
    .onEnd((_e) => {
      runOnJS(handleSlideEnd)(sharedValue.get());
    });

  const pressGesture = Gesture.Tap()
    .onStart((e) => {
      const value = normalizeValue(e.x, sliderWidth.get());
      sharedValue.set(value);
    })
    .onEnd((e) => {
      runOnJS(onChange)(sharedValue.get());
    });

  const sliderThumbAnimatedStyles = useAnimatedStyle(() => {
    const interpolatedValue = interpolate(
      sharedValue.get(),
      [0, 100],
      [0, sliderWidth.get() - THUMB_MARK_SIZE],
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
    const minValue = THUMB_MARK_SIZE / 2;
    const maxValue = sliderWidth.get() - minValue;
    const interpolatedValue = interpolate(sharedValue.get(), [0, 100], [minValue, maxValue]);
    return {
      width: withSpring(interpolatedValue, { duration: 20 }),
    };
  });

  const trackMarkStyles = {
    transform: [{ translateY: THUMB_MARK_SIZE / 2 - TRACK_MARK_HEIGHT / 2 }],
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(panGesture, pressGesture)}>
        <Animated.View ref={sliderRef} style={[styles.slider]}>
          <Animated.View style={[styles.trackMark, trackMarkStyles]} />
          <Animated.View style={[styles.sliderThumb, sliderThumbAnimatedStyles]} />
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
    height: SLIDER_HEIGHT,
    backgroundColor: 'transparent',
  },
  trackMark: {
    width: '100%',
    height: TRACK_MARK_HEIGHT,
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
    width: THUMB_MARK_SIZE,
    height: THUMB_MARK_SIZE,
    backgroundColor: '#007bff',
    borderRadius: 100,
    zIndex: 3,
  },
});
