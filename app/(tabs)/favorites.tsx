import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
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
  const {
    favoriteProducts,
    loading,
    clearFavorites,
    toggleFavorite,
  } = useFavorites();
  const [undoItem, setUndoItem] = useState<Product | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSheetProduct, setActionSheetProduct] = useState<Product | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
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

      // Clear action sheet/modal states
      setActionSheetProduct(null);
      setShowModal(false);
    }, [])
  );

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
            My Favorites
          </Text>
          {favoriteProducts.length > 0 && (
            <Text className="text-sm text-gray-500">
              {favoriteProducts.length}{" "}
              {favoriteProducts.length === 1 ? "item" : "items"} saved
            </Text>
          )}
        </View>
        <View className="flex-row gap-3">
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
            <TouchableOpacity className="w-full h-full justify-center items-center">
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
        </View>
      </View>
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

  // Long press ActionSheet/Modal
  const handleLongPress = (product: Product) => {
    setActionSheetProduct(product);
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "View details",
            "Remove from favorites",
            selectMode ? "Deselect" : "Select product",
            "Cancel",
          ],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) router.push(`/product/${product.id}`);
          else if (buttonIndex === 1) handleUnfavorite(product);
          else if (buttonIndex === 2) handleSelect(product.id);
        }
      );
    } else {
      setShowModal(true);
    }
  };

  const handleSelect = (id: string) => {
    setSelectMode(true);
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
      ) : (
        <>
          {selectMode && selectedIds.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEF3C7",
                padding: 10,
                margin: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ flex: 1, color: "#B45309", fontWeight: "bold" }}>
                {selectedIds.length} selected
              </Text>
              <TouchableOpacity
                onPress={handleBatchUnfavorite}
                style={{
                  backgroundColor: "#EF4444",
                  padding: 8,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Remove
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectMode(false);
                  setSelectedIds([]);
                }}
                style={{
                  backgroundColor: "#F3F4F6",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#374151" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={favoriteProducts}
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
                  onPress={() => router.push(`/product/${product.id}` as any)}
                  onLongPress={() => handleLongPress(product)}
                  activeOpacity={0.85}
                  className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row p-4">
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
                        <Text className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </Text>
                        {product.limitedTimeDeal > 0 && (
                          <View className="bg-red-500 px-2 py-1 rounded-md">
                            <Text className="text-xs text-white font-bold">
                              -{Math.round(product.limitedTimeDeal * 100)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUnfavorite(product);
                      }}
                      className="ml-2 w-10 h-10 justify-center items-center"
                    >
                      <Ionicons name="heart" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
          {/* Android ActionSheet Modal */}
          {showModal && actionSheetProduct && (
            <Modal
              visible={showModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowModal(false)}
            >
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
                onPress={() => setShowModal(false)}
              />
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  padding: 18,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    if (actionSheetProduct)
                      router.push(`/product/${actionSheetProduct.id}`);
                  }}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 16, color: "#111" }}>
                    View details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    if (actionSheetProduct)
                      handleUnfavorite(actionSheetProduct);
                  }}
                  style={{ paddingVertical: 14 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#EF4444",
                      fontWeight: "bold",
                    }}
                  >
                    Remove from favorites
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    if (actionSheetProduct) handleSelect(actionSheetProduct.id);
                  }}
                  style={{ paddingVertical: 14 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#EAB308",
                      fontWeight: "bold",
                    }}
                  >
                    {selectMode ? "Deselect" : "Select product"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 16, color: "#6B7280" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
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
