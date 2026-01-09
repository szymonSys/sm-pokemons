import { StorageKeys } from "@/constants/store-keys";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

export { StorageKeys as Keys } from "@/constants/store-keys";

export interface Storage<T> {
  save: (value: T) => Promise<void>;
  get: () => Promise<T | null>;
  remove: () => Promise<void>;
  item: T | null;
  exists: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export function useStore<T>(
  key: StorageKeys,
  { autoLoad = true }: { autoLoad?: boolean } = {}
): Storage<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<T | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const save = useCallback(
    async (value: T): Promise<void> => {
      setLoading(true);
      try {
        const item = JSON.stringify(value);
        await SecureStore.setItemAsync(key, item);
        setItem(value);
      } catch (error) {
        console.error("Error saving item to storage:", error);
        setError("Error saving item to storage");
      }
      setLoading(false);
    },
    [key]
  );

  const get = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    const item = await SecureStore.getItemAsync(key);
    setLoading(false);
    if (item) {
      try {
        const parsedItem = JSON.parse(item) as T;
        setItem(parsedItem);
        return parsedItem;
      } catch (error) {
        console.error("Error parsing stored item:", error);
        setError("Error parsing stored item");
        setItem(null);
        return null;
      }
    }
    setItem(null);
    return null;
  }, [key]);

  const remove = useCallback(async (): Promise<void> => {
    setLoading(true);
    await SecureStore.deleteItemAsync(key);
    setItem(null);
    setLoading(false);
  }, [key]);

  useEffect(() => {
    if (autoLoad) {
      get().then(() => setInitialized(true));
    }
    setInitialized(true);
  }, [get, autoLoad]);

  return {
    save,
    get,
    remove,
    loading,
    error,
    item,
    exists: item !== null,
    initialized,
  };
}
