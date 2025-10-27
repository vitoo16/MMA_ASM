import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GradientBackground } from "../../components/GradientBackground";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset scroll position when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (err) {
            console.error("Sign out error:", err);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  // Show loading or nothing while checking auth state
  if (loading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Profile</Text>
            <Text className="text-sm text-gray-500">Manage your account</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSignOut}
            className="w-10 h-10 bg-red-50 rounded-full justify-center items-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* User Profile Card */}
        <View className="mx-5 mb-6">
          <View 
            className="bg-gray-50 rounded-2xl p-6 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <GradientBackground
              style={{ width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
              imageStyle={{ borderRadius: 32 }}
            >
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </GradientBackground>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {user?.email || "No email"}
              </Text>
            </View>
            <GradientBackground
              style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              imageStyle={{ borderRadius: 20 }}
            >
              <TouchableOpacity className="w-full h-full justify-center items-center">
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </GradientBackground>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <Text className="text-2xl font-bold text-gray-900 mb-1">12</Text>
              <Text className="text-xs text-gray-500">Orders</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <Text className="text-2xl font-bold text-gray-900 mb-1">8</Text>
              <Text className="text-xs text-gray-500">Favorites</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <Text className="text-2xl font-bold text-gray-900 mb-1">5</Text>
              <Text className="text-xs text-gray-500">Reviews</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="px-5">
          <Text className="text-base font-bold text-gray-900 mb-3">Account Settings</Text>
          
          {/* My Orders */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="receipt-outline" size={20} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">My Orders</Text>
              <Text className="text-xs text-gray-500">View order history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Addresses */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="location-outline" size={20} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Addresses</Text>
              <Text className="text-xs text-gray-500">Manage delivery addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Payment Methods */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-6 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="card-outline" size={20} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Payment Methods</Text>
              <Text className="text-xs text-gray-500">Manage payment options</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <Text className="text-base font-bold text-gray-900 mb-3">Support</Text>

          {/* FAQ */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Help & FAQ</Text>
              <Text className="text-xs text-gray-500">Get help and support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="settings-outline" size={20} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Settings</Text>
              <Text className="text-xs text-gray-500">App preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-50 rounded-2xl p-4 mt-4 flex-row items-center justify-center"
            style={{
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-base font-bold text-red-500 ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
