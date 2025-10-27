import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useProducts } from "../../hooks/useProducts";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { products } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = products.find((p) => p.id === id);

  // Danh sách ảnh sản phẩm (hiện tại lặp lại 4 lần ảnh chính)
  const productImages = product
    ? [product.image, product.image, product.image, product.image]
    : [];

  // Hiển thị thumbnail ảnh sản phẩm
  const renderThumbnail = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedImageIndex(index)}
      className={`mr-3 rounded-lg border-2 ${
        selectedImageIndex === index ? "border-gray-800" : "border-gray-200"
      }`}
    >
      <Image
        source={{ uri: item }}
        className="w-16 h-16 rounded-lg"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Art supply size/quantity options based on product type
  const getProductOptions = () => {
    if (!product) return ["Small"];
    const artName = product.artName.toLowerCase();
    if (artName.includes("paint") || artName.includes("fabric")) {
      return ["10ml", "20ml", "50ml", "100ml"]; // Paint tube sizes
    } else if (artName.includes("marker") || artName.includes("pen")) {
      return ["Fine", "Medium", "Bold", "Extra Bold"]; // Marker tips
    } else if (artName.includes("brush")) {
      return ["Size 2", "Size 4", "Size 6", "Size 8"]; // Brush sizes
    } else {
      return ["Small", "Medium", "Large", "XL"]; // Default sizes
    }
  };

  const options = getProductOptions();
  const [selectedOption, setSelectedOption] = useState(options[0]);

  if (!product) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        {/* Subtle Background Pattern */}
        <View className="absolute inset-0 opacity-3">
          {/* Decorative Art Elements */}
          <View className="absolute top-20 left-10 w-6 h-6 bg-yellow-200 rounded-full"></View>
          <View className="absolute top-40 right-16 w-4 h-4 bg-gray-200 rounded-full"></View>
          <View className="absolute top-60 left-20 w-3 h-3 bg-yellow-100 rounded-full"></View>
          <View className="absolute bottom-40 right-10 w-8 h-8 bg-gray-100 rounded-full"></View>
          <View className="absolute bottom-60 left-14 w-5 h-5 bg-yellow-200 rounded-full"></View>
        </View>

        {/* Main Logo Container */}
        <View className="relative justify-center items-center">
          {/* Outer Rotating Ring */}
          <View className="absolute w-40 h-40 border-4 border-transparent border-t-yellow-500 border-r-yellow-400 rounded-full"></View>

          {/* Middle Rotating Ring (opposite direction) */}
          <View className="absolute w-32 h-32 border-3 border-transparent border-b-gray-300 border-l-yellow-300 rounded-full"></View>

          {/* Inner Glow Circle */}
          <View className="absolute w-24 h-24 bg-yellow-50 rounded-full opacity-60"></View>

          {/* App Logo - Art Supplies Theme */}
          <View className="w-20 h-20 bg-white rounded-full justify-center items-center shadow-lg border-4 border-yellow-100">
            {/* Paint Brush Icon */}
            <View className="relative">
              {/* Brush Handle */}
              <View className="w-1 h-8 bg-yellow-600 rounded-full absolute left-2 top-0"></View>
              {/* Brush Ferrule */}
              <View className="w-2 h-3 bg-gray-400 rounded-sm absolute left-1.5 top-5"></View>
              {/* Brush Bristles */}
              <View className="w-3 h-4 bg-gray-700 rounded-t-full absolute left-1 top-8"></View>
              {/* Paint Drop */}
              <View className="w-1.5 h-2 bg-yellow-500 rounded-full absolute left-3 top-10"></View>

              {/* Palette */}
              <View className="w-6 h-4 bg-gray-50 rounded-full absolute -right-2 top-4 border border-gray-200">
                <View className="w-1 h-1 bg-yellow-400 rounded-full absolute top-0.5 left-1"></View>
                <View className="w-1 h-1 bg-gray-400 rounded-full absolute top-0.5 right-1"></View>
                <View className="w-1 h-1 bg-yellow-500 rounded-full absolute bottom-0.5 left-2"></View>
              </View>
            </View>
          </View>
        </View>
        {/* Bottom Decorative Elements */}
        <View className="absolute bottom-20 left-0 right-0 flex-row justify-center space-x-8 opacity-40">
          <Ionicons name="color-palette" size={20} color="#EAB308" />
          <Ionicons name="brush" size={20} color="#6B7280" />
          <Ionicons name="pencil" size={20} color="#EAB308" />
          <Ionicons name="shapes" size={20} color="#6B7280" />
        </View>
        <Text className="text-lg text-gray-500 mt-8">Product not found</Text>
      </View>
    );
  }
  const renderOptionButton = (option: string) => (
    <TouchableOpacity
      key={option}
      onPress={() => setSelectedOption(option)}
      className={`px-4 py-2 rounded-lg mr-3 justify-center items-center border ${
        selectedOption === option
          ? "bg-gray-800 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          selectedOption === option ? "text-white" : "text-gray-800"
        }`}
      >
        {option}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Product Details
          </Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Main Product Image */}
        <View className="px-5 mb-4">
          <View className="relative bg-gray-50 rounded-2xl p-6">
            <Image
              source={{ uri: productImages[selectedImageIndex] }}
              className="w-full h-80 rounded-xl"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => toggleFavorite(product.id)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm"
              accessibilityLabel={
                isFavorite(product.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Ionicons
                name={isFavorite(product.id) ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite(product.id) ? "#EF4444" : "#666"}
                style={{
                  transform: [{ scale: isFavorite(product.id) ? 1.2 : 1 }],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnail Images */}
        <View className="px-5 mb-6">
          <FlatList
            data={productImages}
            renderItem={renderThumbnail}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Product Info */}
        <View className="px-5">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.artName}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            {product.limitedTimeDeal > 0 ? (
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl font-bold text-red-500">
                  ${(product.price * (1 - product.limitedTimeDeal)).toFixed(2)}
                </Text>
                <Text className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </Text>
                <View className="bg-red-500 px-2 py-1 rounded-md">
                  <Text className="text-xs text-white font-bold">
                    -{(product.limitedTimeDeal * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Product Options */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              {product.artName.toLowerCase().includes("paint")
                ? "Volume"
                : product.artName.toLowerCase().includes("marker")
                ? "Tip Size"
                : product.artName.toLowerCase().includes("brush")
                ? "Brush Size"
                : "Size"}
            </Text>
            <View className="flex-row flex-wrap">
              {options.map(renderOptionButton)}
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base text-gray-600 leading-6">
              {product.description ||
                `Discover the excellent quality of ${product.brand} ${product.artName}. Perfect for artists, crafters, and creative professionals.`}
            </Text>

            {/* Special Feature */}
            {product.glassSurface && (
              <View className="mt-3 bg-blue-50 px-3 py-2 rounded-lg">
                <Text className="text-sm text-blue-800 font-medium">
                  ✨ Usable on glass surfaces
                </Text>
              </View>
            )}
          </View>

          {/* Reviews */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Reviews ({product.feedbacks?.length || 0})
              </Text>
              {product.feedbacks && product.feedbacks.length > 0 && (
                <View className="flex-row items-center">
                  <View className="flex-row">
                    {[...Array(5)].map((_, i) => {
                      const avgRating =
                        product.feedbacks!.reduce(
                          (sum, feedback) => sum + feedback.rating,
                          0
                        ) / product.feedbacks!.length;
                      return (
                        <Ionicons
                          key={i}
                          name={
                            i < Math.floor(avgRating) ? "star" : "star-outline"
                          }
                          size={16}
                          color="#FFA500"
                        />
                      );
                    })}
                  </View>
                  <Text className="text-sm text-gray-600 ml-2">
                    {(
                      product.feedbacks.reduce(
                        (sum, feedback) => sum + feedback.rating,
                        0
                      ) / product.feedbacks.length
                    ).toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Rating Distribution */}
            {product.feedbacks && product.feedbacks.length > 0 && (
              <View className="bg-gray-50 p-4 rounded-xl mb-4">
                <Text className="text-sm font-semibold text-gray-900 mb-3">
                  Rating Distribution
                </Text>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = product.feedbacks!.filter(
                    (f) => f.rating === stars
                  ).length;
                  const percentage = (count / product.feedbacks!.length) * 100;
                  return (
                    <View key={stars} className="flex-row items-center mb-2">
                      <Text className="text-xs text-gray-600 w-8">
                        {stars}★
                      </Text>
                      <View className="flex-1 bg-gray-200 h-2 rounded-full mx-2">
                        <View
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </View>
                      <Text className="text-xs text-gray-600 w-10 text-right">
                        {count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Detailed Reviews */}
            {product.feedbacks && product.feedbacks.length > 0 ? (
              <View className="space-y-4">
                {product.feedbacks.slice(0, 2).map((feedback, index) => (
                  <View key={index} className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-gray-300 mr-3 justify-center items-center">
                          <Text className="text-sm font-bold text-gray-600">
                            {feedback.author.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-sm font-semibold text-gray-900">
                          {feedback.author}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < feedback.rating ? "star" : "star-outline"}
                            size={12}
                            color="#FFA500"
                          />
                        ))}
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 mb-2">
                      {feedback.comment}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(feedback.date).toLocaleDateString("en-US")}
                    </Text>
                  </View>
                ))}

                {product.feedbacks.length > 2 && (
                  <TouchableOpacity className="mt-3">
                    <Text className="text-center text-gray-600 font-medium">
                      View all {product.feedbacks.length} reviews
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="bg-gray-50 p-6 rounded-xl items-center">
                <Ionicons name="chatbubble-outline" size={32} color="#999" />
                <Text className="text-gray-500 mt-2 text-center">
                  No reviews yet. Be the first to review this product!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
