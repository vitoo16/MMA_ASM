import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useProducts, useBestSellers } from "../hooks/useProducts";
import { Product } from "../types/product";
import { useFavorites } from "../contexts/FavoritesContext";

export default function SeeAllScreen() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { category } = useLocalSearchParams();
  const { products } = useProducts();
  const { bestSellers } = useBestSellers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Determine products to display based on category
  const getProducts = () => {
    if (category === "bestseller") {
      return bestSellers;
    }
    return products;
  };

  // Lọc sản phẩm dựa trên tìm kiếm và bộ lọc
  const filteredProducts = getProducts().filter((product) => {
    const matchesSearch =
      product.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      product.brand.toLowerCase() === selectedFilter.toLowerCase()
    );
  });

  // Lấy danh sách thương hiệu duy nhất cho bộ lọc
  const brands = Array.from(new Set(getProducts().map((p) => p.brand)));

  const navigateToProduct = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigateToProduct(item.id)}
      className="flex mb-4 rounded-xl w-[48%] p-4 border border-slate-200"
    >
      <View className="relative mb-3">
        <Image
          source={{ uri: item.image }}
          className="w-full h-32 rounded-xl bg-gray-50"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
          onPress={async (e) => {
            e.stopPropagation();
            await toggleFavorite(item.id);
          }}
        >
          <Ionicons
            name={isFavorite(item.id) ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite(item.id) ? "#EF4444" : "#666"}
            style={{ transform: [{ scale: isFavorite(item.id) ? 1.2 : 1 }] }}
          />
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-gray-500 font-medium uppercase mb-1">
        {item.brand}
      </Text>

      <Text
        className="text-sm font-semibold text-gray-900 mb-3 h-10 leading-tight"
        numberOfLines={2}
      >
        {item.artName}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          ${item.price.toFixed(2)}
        </Text>
        {item.limitedTimeDeal > 0 && (
          <View className="bg-red-500 px-2 py-1 rounded-md">
            <Text className="text-xs text-white font-bold">
              -{Math.round(item.limitedTimeDeal * 100)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (brand: string) => (
    <TouchableOpacity
      key={brand}
      onPress={() => setSelectedFilter(brand === "All" ? "all" : brand)}
      className={`px-4 py-2 rounded-full mr-3 ${
        selectedFilter === (brand === "All" ? "all" : brand)
          ? "bg-yellow-500"
          : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          selectedFilter === (brand === "All" ? "all" : brand)
            ? "text-white"
            : "text-gray-700"
        }`}
      >
        {brand === "All" ? "All" : brand}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          {category === "bestseller" ? "Best Sellers" : "New Arrivals"}
        </Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-4">
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            className="flex-1 text-base text-gray-800 ml-3 focus:outline-none"
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Brand Filter */}
      <View className="px-5 mb-4">
        <FlatList
          data={["All", ...brands]}
          renderItem={({ item }) => renderFilterButton(item as string)}
          keyExtractor={(item) => item as string}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      </View>

      {/* Product Count */}
      <View className="px-5 mb-4">
        <Text className="text-sm text-gray-600">
          Found {filteredProducts.length} products
        </Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text className="text-lg text-gray-500 mt-4 mb-2">
              No products found
            </Text>
            <Text className="text-sm text-gray-400 text-center px-8">
              Try changing the keyword or filter to find suitable products
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
