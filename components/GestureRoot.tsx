import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GestureRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );
}
