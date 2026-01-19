import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen
              name="[pokemonName]"
              options={({ route }) => ({
                title: route.params?.pokemonName as string,
              })}
            />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
