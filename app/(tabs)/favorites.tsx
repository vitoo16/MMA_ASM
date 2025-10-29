import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { GradientBackground } from "../../components/GradientBackground";
import { useFavorites } from "../../contexts/FavoritesContext";
import { Product } from "../../types/product";

import React, { useCallback, useRef, useState } from "react";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteProducts, loading, clearFavorites, toggleFavorite } =
    useFavorites();
  const [undoItem, setUndoItem] = useState<Product | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Reset scroll position and all states when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      // Scroll to top
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

      // Reset select mode and selections
      setSelectMode(false);
      setSelectedIds([]);

      // Reset search mode and query
      setSearchMode(false);
      setSearchQuery("");

      // Close all open swipeable items
      swipeableRefs.current.forEach((ref) => {
        ref?.close();
      });

      // Clear undo state
      setShowUndo(false);
      setUndoItem(null);
      if (undoTimeout.current) {
        clearTimeout(undoTimeout.current);
        undoTimeout.current = null;
      }
    }, [])
  );

  // Filter products based on search query
  const filteredProducts = favoriteProducts.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.brand && product.brand.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

  // Search handlers
  const handleSearchToggle = () => {
    setSearchMode(!searchMode);
    if (searchMode) {
      setSearchQuery("");
    }
  };

  const handleSearchCancel = () => {
    setSearchMode(false);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EAB308" />
      </SafeAreaView>
    );
  }

  // Header matching homepage style
  const Header = () => (
    <View className="px-5 pt-4 pb-3">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {selectMode ? "Select Items" : "My Favorites"}
          </Text>
          {favoriteProducts.length > 0 && (
            <Text className="text-sm text-gray-500">
              {selectMode
                ? `${selectedIds.length} selected`
                : searchMode && searchQuery.trim()
                ? `${filteredProducts.length} of ${favoriteProducts.length} ${
                    filteredProducts.length === 1 ? "item" : "items"
                  } found`
                : `${favoriteProducts.length} ${
                    favoriteProducts.length === 1 ? "item" : "items"
                  } saved`}
            </Text>
          )}
        </View>
        <View className="flex-row gap-3">
          {selectMode ? (
            <>
              <TouchableOpacity
                onPress={handleBatchUnfavorite}
                disabled={selectedIds.length === 0}
                className={`px-4 py-2 rounded-full ${
                  selectedIds.length > 0 ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedIds.length > 0 ? "text-white" : "text-gray-500"
                  }`}
                >
                  Remove ({selectedIds.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelSelect}
                className="px-4 py-2 bg-gray-100 rounded-full"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <GradientBackground
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                imageStyle={{ borderRadius: 20 }}
              >
                <TouchableOpacity
                  onPress={handleSearchToggle}
                  className="w-full h-full justify-center items-center"
                >
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </GradientBackground>
              {favoriteProducts.length > 0 && (
                <TouchableOpacity
                  onPress={() => clearFavorites()}
                  className="w-10 h-10 bg-red-50 rounded-full justify-center items-center"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      {searchMode && (
        <View className="mt-3 flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search favorites..."
            className="flex-1 ml-2 text-gray-900"
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearchCancel} className="ml-2">
            <Text className="text-blue-500 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Undo logic
  const handleUnfavorite = async (product: Product) => {
    setUndoItem(product);
    setShowUndo(true);
    await toggleFavorite(product.id);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {
      setShowUndo(false);
      setUndoItem(null);
    }, 3500);
  };

  const handleUndo = async () => {
    if (undoItem) {
      await toggleFavorite(undoItem.id);
      setShowUndo(false);
      setUndoItem(null);
    }
  };

  // Long press to enter select mode
  const handleLongPress = (product: Product) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([product.id]);
    } else {
      handleSelect(product.id);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchUnfavorite = async () => {
    for (const id of selectedIds) {
      await toggleFavorite(id);
    }
    setSelectedIds([]);
    setSelectMode(false);
  };

  const handleCancelSelect = () => {
    setSelectedIds([]);
    setSelectMode(false);
  };

  // Render right action for swipe
  const renderRightActions = (progress: any, dragX: any, product: Product) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#EF4444",
          justifyContent: "center",
          alignItems: "center",
          width: 100,
          height: "90%",
          borderRadius: 16,
          marginVertical: 6,
        }}
        onPress={() => handleUnfavorite(product)}
      >
        <Ionicons name="heart-dislike" size={24} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "bold", marginTop: 4 }}>
          Remove
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      {favoriteProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          {/* Empty Favorites Illustration */}
          <View className="w-28 h-28 bg-gray-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="heart-outline" size={56} color="#9CA3AF" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
            No favorites yet
          </Text>
          <Text className="text-base text-gray-500 text-center mb-10 leading-6 px-4">
            Start adding your favorite art supplies by tapping the heart icon on
            products you love
          </Text>
          <View className="w-full px-6 space-y-3">
            <GradientBackground
              style={{
                borderRadius: 25,
                overflow: "hidden",
              }}
              imageStyle={{ borderRadius: 25 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(tabs)" as any)}
                className="py-4 px-6"
              >
                <Text className="text-center text-white font-bold text-base">
                  Browse Products
                </Text>
              </TouchableOpacity>
            </GradientBackground>
          </View>
        </View>
      ) : filteredProducts.length === 0 && searchQuery.trim() ? (
        <View className="flex-1 justify-center items-center px-8">
          {/* No Search Results Illustration */}
          <View className="w-28 h-28 bg-gray-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="search" size={56} color="#9CA3AF" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
            No results found
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6 leading-6 px-4">
            We couldn't find any favorites matching "{searchQuery}". Try a
            different search term.
          </Text>
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            className="px-6 py-3 bg-blue-50 rounded-lg"
          >
            <Text className="text-blue-600 font-semibold">Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              paddingBottom: 100,
            }}
            renderItem={({ item: product }) => (
              <Swipeable
                ref={(ref) => {
                  if (ref) {
                    swipeableRefs.current.set(product.id, ref);
                  } else {
                    swipeableRefs.current.delete(product.id);
                  }
                }}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, product)
                }
                overshootRight={false}
              >
                <TouchableOpacity
                  key={product.id}
                  onPress={() => {
                    if (selectMode) {
                      handleSelect(product.id);
                    } else {
                      router.push(`/product/${product.id}` as any);
                    }
                  }}
                  onLongPress={() => handleLongPress(product)}
                  activeOpacity={0.85}
                  className={`bg-white rounded-2xl mb-4 overflow-hidden border ${
                    selectMode && selectedIds.includes(product.id)
                      ? "border-blue-500 border-2"
                      : "border-gray-100"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row p-4">
                    {selectMode && (
                      <View className="mr-3 justify-center">
                        <View
                          className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                            selectedIds.includes(product.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedIds.includes(product.id) && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="white"
                            />
                          )}
                        </View>
                      </View>
                    )}
                    <Image
                      source={{ uri: product.image }}
                      className="w-24 h-24 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                    <View className="flex-1 justify-between">
                      <View>
                        <Text
                          className="text-base font-bold text-gray-900 mb-1"
                          numberOfLines={2}
                        >
                          {product.artName}
                        </Text>
                        <Text className="text-xs text-gray-500 font-medium uppercase mb-2">
                          {product.brand}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          {product.limitedTimeDeal > 0 ? (
                            <>
                              <Text className="text-lg font-bold text-gray-900">
                                $
                                {(
                                  product.price *
                                  (1 - product.limitedTimeDeal)
                                ).toFixed(2)}
                              </Text>
                              <Text className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </Text>
                            </>
                          ) : (
                            <Text className="text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </Text>
                          )}
                        </View>
                        {product.limitedTimeDeal > 0 && (
                          <View className="bg-red-500 px-2 py-1 rounded-md">
                            <Text className="text-xs text-white font-bold">
                              -{Math.round(product.limitedTimeDeal * 100)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {!selectMode && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleUnfavorite(product);
                        }}
                        className="ml-2 w-10 h-10 justify-center items-center"
                      >
                        <Ionicons name="heart" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
          {/* Snackbar Undo */}
          {showUndo && undoItem && (
            <Animated.View
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                bottom: 40,
                backgroundColor: "#222",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                zIndex: 100,
              }}
            >
              <Text
                style={{ color: "#fff", flex: 1 }}
              >{`Removed from favorites: "${undoItem.artName}"`}</Text>
              <TouchableOpacity onPress={handleUndo} style={{ marginLeft: 16 }}>
                <Text style={{ color: "#EAB308", fontWeight: "bold" }}>
                  Undo
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
