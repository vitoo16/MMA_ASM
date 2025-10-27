import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

import GestureRoot from "@/components/GestureRoot";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "../contexts/AuthContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureRoot>
      <AuthProvider>
        <FavoritesProvider>
          <GluestackUIProvider mode="dark">
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="product/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="products"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </GluestackUIProvider>
          </FavoritesProvider>
      </AuthProvider>
    </GestureRoot>
  );
}
