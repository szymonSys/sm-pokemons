import { SharedValue } from "react-native-reanimated";

export type LoaderFunction<T, A extends unknown[]> = (
  ...args: A
) => Promise<readonly T[] | undefined>;

export type HookFunctionOptions<T, A extends unknown[]> = {
  currentIndex: number;
  load: LoaderFunction<T, A>;
  list: readonly T[];
};

export type ComputeCardStyles = () => {
  height: number;
  position: "absolute";
  top: number;
  left: number;
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
  computeStyles: ComputeCardStyles;
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
  loaderDeps?: unknown[];
  windowSize?: number;
  loadBufferSize?: number;
} & Partial<SharedOptions>;

export type SharedOptions = {
  itemHeight: number;
  itemSpacing: number;
  velocityThreshold: number;
  distanceThresholdFactor: number;
  scaleUpFactor: number;
};
