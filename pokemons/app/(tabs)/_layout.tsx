import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pokemons",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Swipe",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="looks" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="favorite" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="camera" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
