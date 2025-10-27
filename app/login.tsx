import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthGuard } from "../components/AuthGuard";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setSigningIn(true);
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
        Alert.alert(
          "Success",
          "Account created successfully! Please check your email for verification.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        await signInWithEmail(email.trim(), password);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      Alert.alert(
        "Authentication Error",
        error.message || "Failed to authenticate. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-8 justify-center py-12">
              {/* Header */}
              <View className="mb-12">
                <Text className="text-3xl font-bold text-gray-900 mb-3">
                  {isSignUp ? "Sign Up" : "Welcome Back"}
                </Text>
                <Text className="text-gray-500 text-base leading-5">
                  {isSignUp
                    ? "Ready to hit the road."
                    : "Ready to hit the road."}
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-5">
                <TextInput
                  className="text-gray-900 text-base py-3 border-b border-gray-300"
                  placeholder="Email Phone Number"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!signingIn}
                />
              </View>

              {/* Password Input */}
              <View className="mb-2">
                <View className="flex-row items-center border-b border-gray-300 py-3">
                  <TextInput
                    className="flex-1 text-gray-900 text-base"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!signingIn}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input (Sign Up only) */}
              {isSignUp && (
                <View className="mb-2">
                  <View className="flex-row items-center border-b border-gray-300 py-3">
                    <TextInput
                      className="flex-1 text-gray-900 text-base"
                      placeholder="Confirm Password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!signingIn}
                    />
                  </View>
                </View>
              )}

              {/* Forgot Password / Remember Me */}
              {!isSignUp && (
                <View className="flex-row justify-between items-center mt-3 mb-8">
                  <View className="flex-row items-center">
                    <View className="w-5 h-5 border border-gray-400 rounded mr-2" />
                    <Text className="text-gray-600 text-sm">Remember me</Text>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-gray-900 text-sm font-medium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {isSignUp && <View className="mb-6" />}

              {/* Primary Button */}
              <TouchableOpacity
                className="bg-black rounded-full py-4 px-6 mb-4"
                onPress={handleAuth}
                disabled={signingIn}
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                {signingIn ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    {isSignUp ? "Sign up" : "Login"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity
                className="bg-white border border-gray-300 rounded-full py-4 px-6 mb-6"
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setConfirmPassword("");
                }}
                disabled={signingIn}
              >
                <Text className="text-gray-900 text-center font-semibold text-base">
                  {isSignUp ? "Login" : "Sign up"}
                </Text>
              </TouchableOpacity>

              {/* OR Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="text-gray-500 text-sm mx-4">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Continue as Guest Button */}
              <TouchableOpacity
                className="bg-gray-100 rounded-full py-4 px-6 mb-6 flex-row items-center justify-center"
                onPress={() => router.replace("/(tabs)")}
                disabled={signingIn}
              >
                <Ionicons name="person-outline" size={20} color="#374151" />
                <Text className="text-gray-900 text-center font-medium text-base ml-2">
                  Continue as Guest
                </Text>
              </TouchableOpacity>

              {/* Footer Text */}
              <View className="mt-4">
                <Text className="text-xs text-gray-400 text-center leading-4">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <Text className="text-gray-900 font-medium">
                    {isSignUp ? "Login" : "Sign up"}
                  </Text>
                </Text>
              </View>

              {/* Bottom Indicator */}
              <View className="items-center mt-6">
                <View className="w-32 h-1 bg-gray-900 rounded-full" />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthGuard>
  );
}
