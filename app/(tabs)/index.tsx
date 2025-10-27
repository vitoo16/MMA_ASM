import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useBestSellers, useProducts } from "../../hooks/useProducts";
import { Product } from "../../types/product";

export default function HomeScreen() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "deals">("all");
  const { products } = useProducts();
  const { bestSellers } = useBestSellers();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Get unique brands from products
  const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand)))];

  // Navigation function for product detail
  const navigateToProduct = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  // Get products based on active tab
  const getDisplayProducts = () => {
    switch (activeTab) {
      case "deals":
        return bestSellers;
      default:
        return products;
    }
  };

  // Filter by brand first
  let filteredProducts =
    selectedBrand === "All"
      ? getDisplayProducts()
      : getDisplayProducts().filter(
          (item) => item.brand.toLowerCase() === selectedBrand.toLowerCase()
        );

  // Then filter by search query
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(
      (item) =>
        item.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const renderProduct = ({ item }: { item: Product }) => {
    // Calculate average rating
    const avgRating =
      item.feedbacks && item.feedbacks.length > 0
        ? item.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
          item.feedbacks.length
        : 0;

    return (
      <TouchableOpacity
        onPress={() => navigateToProduct(item.id)}
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 w-[48%]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="relative mb-3">
          <Image
            source={{ uri: item.image }}
            className="w-full h-32 rounded-xl"
            resizeMode="cover"
          />
          {item.limitedTimeDeal > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
              <Text className="text-xs text-white font-bold">
                -{Math.round(item.limitedTimeDeal * 100)}%
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-2"
          >
            <Ionicons
              name={isFavorite(item.id) ? "heart" : "heart-outline"}
              size={16}
              color={isFavorite(item.id) ? "#EF4444" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <Text
          className="text-base font-bold text-gray-900 mb-1"
          numberOfLines={2}
        >
          {item.artName}
        </Text>

        <Text className="text-xs text-gray-500 font-medium uppercase mb-2">
          {item.brand}
        </Text>

        {avgRating > 0 && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text className="text-xs text-gray-600 ml-1 font-medium">
              {avgRating.toFixed(1)} ({item.feedbacks?.length || 0})
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          {item.limitedTimeDeal > 0 ? (
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-red-500">
                ${(item.price * (1 - item.limitedTimeDeal)).toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-400 line-through">
                ${item.price.toFixed(2)}
              </Text>
            </View>
          ) : (
            <Text className="text-base font-bold text-gray-900">
              ${item.price.toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row justify-between items-center mb-6">
            <ImageBackground
              source={require("../../assets/images/Rectangle 189.png")}
              className="w-12 h-12 rounded-full justify-center items-center overflow-hidden"
              imageStyle={{ borderRadius: 24 }}
            >
              <Ionicons name="brush" size={24} color="#FFFFFF" />
            </ImageBackground>
            <View className="flex-row gap-3">
              <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center relative">
                <Ionicons name="notifications-outline" size={22} color="#000" />
                <View className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
              </TouchableOpacity>
              <ImageBackground
                source={require("../../assets/images/Rectangle 189.png")}
                className="w-10 h-10 rounded-full justify-center items-center overflow-hidden"
                imageStyle={{ borderRadius: 20 }}
              >
                <TouchableOpacity
                  className="w-full h-full justify-center items-center"
                  onPress={() => router.push("/profile" as any)}
                >
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Search art supplies..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <ImageBackground
              source={require("../../assets/images/Rectangle 189.png")}
              className="w-12 h-12 rounded-xl justify-center items-center overflow-hidden"
              imageStyle={{ borderRadius: 12 }}
            >
              <Ionicons name="options" size={22} color="#FFFFFF" />
            </ImageBackground>
          </View>

          {/* Category Tabs */}
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => setActiveTab("all")}
                className={`px-6 py-3 rounded-xl ${
                  activeTab === "all" ? "" : "bg-gray-100"
                }`}
              >
                {activeTab === "all" ? (
                  <ImageBackground
                    source={require("../../assets/images/Rectangle 189.png")}
                    className="px-6 py-3 rounded-xl -m-3"
                    imageStyle={{ borderRadius: 12 }}
                  >
                    <Text className="text-sm font-bold text-white">
                      All Products
                    </Text>
                  </ImageBackground>
                ) : (
                  <Text className="text-sm font-bold text-gray-600">
                    All Products
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("deals")}
                className={`px-6 py-3 rounded-xl ${
                  activeTab === "deals" ? "" : "bg-gray-100"
                }`}
              >
                {activeTab === "deals" ? (
                  <ImageBackground
                    source={require("../../assets/images/Rectangle 189.png")}
                    className="px-6 py-3 rounded-xl -m-3"
                    imageStyle={{ borderRadius: 12 }}
                  >
                    <Text className="text-sm font-bold text-white">
                      🔥 Hot Deals
                    </Text>
                  </ImageBackground>
                ) : (
                  <Text className="text-sm font-bold text-gray-600">
                    🔥 Hot Deals
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Brands Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Brands</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            >
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  onPress={() => setSelectedBrand(brand)}
                  className="items-center"
                >
                  {selectedBrand === brand ? (
                    <ImageBackground
                      source={require("../../assets/images/Rectangle 189.png")}
                      className="w-16 h-16 rounded-full justify-center items-center mb-2 overflow-hidden"
                      imageStyle={{ borderRadius: 32 }}
                    >
                      <Ionicons name="brush" size={28} color="#FFFFFF" />
                    </ImageBackground>
                  ) : (
                    <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-2">
                      <Ionicons name="brush" size={28} color="#000000" />
                    </View>
                  )}
                  <Text
                    className={`text-xs font-medium ${
                      selectedBrand === brand
                        ? "text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Products Section */}
        <View className="px-5 mb-24">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                {activeTab === "deals" ? "Hot Deals" : "All Products"}
              </Text>
              <Text className="text-sm text-gray-500">
                {filteredProducts.length} items
              </Text>
            </View>
          </View>

          {filteredProducts.length === 0 ? (
            <View className="items-center py-12">
              <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-4">
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{ paddingVertical: 4 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
