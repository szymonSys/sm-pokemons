import { useNavigation } from "expo-router";
import { useCallback, useEffect } from "react";

export type NavigationEventType = "focus" | "blur" | "beforeRemove" | "state";

export function useNavigationEvent(
  eventType: NavigationEventType,
  callback: () => unknown,
  deps: unknown[] = []
) {
  const navigation = useNavigation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const focusListener = async () => {
      await memoizedCallback();
    };
    navigation.addListener(eventType, focusListener);
    return () => {
      navigation.removeListener(eventType, focusListener);
    };
  }, [memoizedCallback, navigation, eventType]);
}
