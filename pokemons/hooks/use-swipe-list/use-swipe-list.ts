import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import { withSpring } from "react-native-reanimated";
import { useSwipeGesture } from "./_use-swipe-list-gesture";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useLatest } from "@/hooks/use-latest";
import {
  ComputeCardStyles,
  IndexSetter,
  ItemsWindowItem,
  LoaderFunction,
  SwipeListOptions,
} from "./use-swipe-list.types";

const DEFAULT_ITEM_HEIGHT = Dimensions.get("window").height * 0.8;
const DEFAULT_ITEM_SPACING = 32;
const DEFAULT_VELOCITY_THRESHOLD = 1200;
const DEFAULT_DISTANCE_THRESHOLD_FACTOR = 0.5;
const DEFAULT_SCALE_UP_FACTOR = 0.25;
const DEFAULT_WINDOW_SIZE = 3;

export function useSwipeList<T, A extends unknown[]>(
  loader: LoaderFunction<T, A>,
  {
    beforeMoveToNext,
    beforeMoveToPrevious,
    onInit,
    loaderDeps = [loader],
    windowSize = DEFAULT_WINDOW_SIZE,
    itemHeight = DEFAULT_ITEM_HEIGHT,
    itemSpacing = DEFAULT_ITEM_SPACING,
    velocityThreshold = DEFAULT_VELOCITY_THRESHOLD,
    distanceThresholdFactor = DEFAULT_DISTANCE_THRESHOLD_FACTOR,
    scaleUpFactor = DEFAULT_SCALE_UP_FACTOR,
  }: SwipeListOptions<T, A>
) {
  const [list, setList] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const currentIndexRef = useLatest(currentIndex);
  const listRef = useLatest(list);
  const isMountedRef = useIsMounted();

  const load = useCallback<LoaderFunction<T, A>>(async (...args: A) => {
    if (!loader) {
      return;
    }
    setIsLoading(true);
    try {
      const items = await loader(...args);
      if (!isMountedRef.current || !items) {
        return;
      }
      setList((prevItems) => [...prevItems, ...items]);
      setError(null);
      return items;
    } catch (error) {
      if (isMountedRef.current) {
        setError(error as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, loaderDeps);

  const moveToNext: IndexSetter = async () => {
    if (isLoading) {
      return;
    }
    await beforeMoveToNext?.({
      currentIndex: currentIndexRef.current,
      load,
      list: listRef.current,
    });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const moveToPrevious: IndexSetter = async () => {
    if (isLoading) {
      return;
    }
    await beforeMoveToPrevious?.({
      currentIndex: currentIndexRef.current,
      load,
      list: listRef.current,
    });
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

  const createWindowItem = useCallback(
    (item: T, itemIndex: number, startIndex: number, currentIndex: number) => {
      const index = startIndex + itemIndex;
      const multiplier = index >= currentIndex ? 1 : -1;
      const offset =
        (itemHeight + itemSpacing) *
        multiplier *
        Math.abs(index - currentIndex);

      const computeStyles: ComputeCardStyles = () => {
        "worklet";
        return {
          height: itemHeight,
          position: "absolute",
          top: 0,
          left: 0,
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
    },
    [itemHeight, itemSpacing, translateY]
  );

  const itemsWindow = useMemo<ItemsWindowItem<T>[]>(() => {
    const startIndex = Math.max(0, currentIndex - Math.floor(windowSize / 2));
    const endIndex = Math.min(list.length, startIndex + windowSize);
    return list
      .slice(startIndex, endIndex)
      .map((item, i) => createWindowItem(item, i, startIndex, currentIndex));
  }, [currentIndex, windowSize, list, createWindowItem]);

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
