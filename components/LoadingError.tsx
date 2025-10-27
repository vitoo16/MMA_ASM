import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";

export const LoadingComponent = ({
  message = "Loading...",
}: {
  message?: string;
}) => (
  <View className="flex-1 justify-center items-center py-10">
    <ActivityIndicator size="large" color="#333" />
    <Text className="text-gray-600 mt-2">{message}</Text>
  </View>
);

export const ErrorComponent = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) => (
  <View className="flex-1 justify-center items-center py-10">
    <Text className="text-red-500 text-center mb-4">Error: {error}</Text>
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        className="bg-gray-800 px-4 py-2 rounded-full"
      >
        <Text className="text-white">Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);
