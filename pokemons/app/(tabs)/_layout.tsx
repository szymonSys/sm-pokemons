import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Keys, useStore } from '@/hooks/use-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { exists: favoriteExists, item } = useStore<string>(Keys.FavoritePokemon);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokemons',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="looks" color={color} />,
        }}
      />
      <Tabs.Protected guard={favoriteExists}>
        <Tabs.Screen
          name="favorite"
          options={{
            title: 'Favorite',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="favorite" color={color} />,
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera" color={color} />,
        }}
      />
    </Tabs>
  );
}
