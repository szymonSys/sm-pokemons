import { useCallback, useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  SharedValue,
  runOnJS,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type LoaderFunction<T, A extends unknown[]> = (
  ...args: A
) => Promise<readonly T[] | undefined>;

export type HookFunctionOptions<T, A extends unknown[]> = {
  currentIndex: number;
  load: LoaderFunction<T, A>;
  list: readonly T[];
};

export type ComputeCardTransformation = () => {
  transform: {
    translateY: number;
  }[];
};

export type ItemsWindowItem<T> = {
  item: T;
  index: number;
  offset: number;
  currentIndex: number;
  translateY: SharedValue<number>;
  computeStyles: ComputeCardTransformation;
};

export type SwipeGestureOptions = {
  setNext: IndexSetter;
  setPrevious: IndexSetter;
  hasNext: boolean;
  hasPrev: boolean;
} & SharedOptions;

export type HookFunction<T, A extends unknown[]> = (
  options: HookFunctionOptions<T, A>
) => unknown | Promise<unknown>;

export type IndexSetter = () => Promise<void>;

export type SwipeListOptions<T, A extends unknown[]> = {
  loader?: LoaderFunction<T, A>;
  beforeMoveToNext?: HookFunction<T, A>;
  beforeMoveToPrevious?: HookFunction<T, A>;
  onInit?: HookFunction<T, A>;
  initialIndex?: number;
  initialItems?: T[];
  loaderDeps?: unknown[];
  windowSize?: number;
} & SharedOptions;

export type SharedOptions = {
  itemHeight: number;
  itemSpacing: number;
  velocityThreshold: number;
  distanceThresholdFactor: number;
  scaleUpFactor: number;
};

export function useSwipeList<T, A extends unknown[]>(
  loader: LoaderFunction<T, A>,
  {
    beforeMoveToNext,
    beforeMoveToPrevious,
    onInit,
    initialIndex = 0,
    initialItems = [],
    loaderDeps = [loader],
    windowSize = 3,
    itemHeight,
    itemSpacing,
    velocityThreshold,
    distanceThresholdFactor,
    scaleUpFactor,
  }: SwipeListOptions<T, A>
) {
  const [list, setList] = useState<T[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback<LoaderFunction<T, A>>(async (...args: A) => {
    if (!loader) {
      return;
    }
    setIsLoading(true);
    try {
      const items = await loader(...args);
      if (!items) {
        return;
      }
      setList((prevItems) => [...prevItems, ...items]);
      return items;
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, loaderDeps);

  const moveToNext: IndexSetter = async () => {
    if (isLoading) {
      return;
    }
    await beforeMoveToNext?.({ currentIndex, load, list });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const moveToPrevious: IndexSetter = async () => {
    if (isLoading) {
      return;
    }
    await beforeMoveToPrevious?.({ currentIndex, load, list });
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  useEffect(() => {
    onInit?.({ currentIndex, load, list });
  }, []);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < list.length - 1;

  const { translateY, gesture } = useSwipeGesture({
    itemHeight,
    itemSpacing,
    setNext: moveToNext,
    setPrevious: moveToPrevious,
    hasNext,
    hasPrev,
    velocityThreshold,
    distanceThresholdFactor,
    scaleUpFactor,
  });

  const itemsWindow = useMemo<ItemsWindowItem<T>[]>(() => {
    const startIndex = Math.max(0, currentIndex - Math.floor(windowSize / 2));
    const endIndex = Math.min(list.length - 1, startIndex + windowSize);

    return list.slice(startIndex, endIndex).map((item, i) => {
      const index = startIndex + i;
      const multiplier = index >= currentIndex ? 1 : -1;
      const offset =
        (itemHeight + itemSpacing) *
        multiplier *
        Math.abs(index - currentIndex);

      const computeStyles: ComputeCardTransformation = () => {
        "worklet";
        return {
          transform: [
            {
              translateY: withSpring(offset + translateY.get()),
            },
          ],
        };
      };

      return {
        item,
        index,
        offset,
        currentIndex,
        translateY,
        computeStyles,
      };
    });
  }, [list, currentIndex, windowSize, itemHeight, itemSpacing, translateY]);

  return {
    itemsWindow,
    currentIndex,
    hasPrev,
    hasNext,
    isLoading,
    error,
    moveToNext,
    moveToPrevious,
    gesture,
  };
}

function useSwipeGesture({
  setNext,
  setPrevious,
  hasNext,
  hasPrev,
  velocityThreshold,
  distanceThresholdFactor,
  scaleUpFactor,
}: SwipeGestureOptions) {
  const { height } = useWindowDimensions();

  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const shouldScaleUp =
        (hasNext && e.translationY < 0) || (hasPrev && e.translationY > 0);
      const dragY = shouldScaleUp
        ? e.translationY * scaleUpFactor
        : e.translationY;
      translateY.set(dragY);
    })
    .onEnd((e) => {
      const velocityThresholdExceeded =
        Math.abs(e.velocityY) > velocityThreshold;

      const distanceThresholdExceeded =
        Math.abs(e.translationY) > height * distanceThresholdFactor;

      const canNotProceed = !(
        velocityThresholdExceeded || distanceThresholdExceeded
      );

      translateY.set(withSpring(0));

      if (canNotProceed) {
        return;
      }

      const shouldGoNext = hasNext && e.translationY < 0 && e.velocityY < 0;
      const shouldGoPrev = hasPrev && e.translationY > 0 && e.velocityY > 0;
      if (shouldGoNext) {
        runOnJS(setNext)();
      } else if (shouldGoPrev) {
        runOnJS(setPrevious)();
      }
    });

  return {
    translateY,
    gesture,
  };
}
