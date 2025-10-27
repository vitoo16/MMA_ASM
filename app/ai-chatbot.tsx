import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { apiService } from "@/services/api";
import { favoritesService } from "@/services/favorites";
import { Product } from "@/types/product";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""
);

interface Message {
  role: "user" | "assistant";
  text: string | React.ReactNode;
}

export default function AIChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Xin chào! Tôi là trợ lý AI của bạn 🎨. Tôi có thể giúp bạn so sánh, gợi ý hoặc tìm hiểu về các sản phẩm bạn yêu thích. Bạn muốn hỏi gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load products from API
  const loadProducts = async () => {
    try {
      const products = await apiService.getProducts();
      setAllProducts(products);

      const favIds = await favoritesService.getFavorites();
      const favProducts = products.filter((p) => favIds.includes(p.id));
      setFavoriteProducts(favProducts);
    } catch (error) {
      console.error(error);
    }
  };

  // Reset scroll position when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const newUserMsg: Message = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = `
      Bạn là trợ lý AI của một ứng dụng bán các sản phẩm nghệ thuật như bút màu, sơn, màu nước.
      Trả lời ngắn gọn, thân thiện và hữu ích.
      Giữ hội thoại có mạch logic, nhớ nội dung trước đó.
      Nếu người dùng hỏi về sản phẩm, chỉ nói trong phạm vi app này.
      Nếu người dùng có sản phẩm yêu thích (${
        favoriteProducts.length
      } sản phẩm): ${favoriteProducts
        .map((p) => `${p.artName} (${p.brand}, giá $${p.price})`)
        .join("; ")}.
      Nếu cần so sánh, hãy dựa trên mô tả, giá và thương hiệu.
      Nếu gợi ý sản phẩm, hãy đặt tên sản phẩm trong [[double brackets]] để app có thể render link.
      Ngôn ngữ trả lời: theo ngôn ngữ người dùng nhập.
      `;

      const chat = await genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      const result = await chat.generateContent(
        `${context}\nNgười dùng: ${input}`
      );
      const aiText = result.response.text();

      // Replace [[Product]] thành button bấm được
      const parts = aiText.split(/(\[\[.*?\]\])/g);
      const formatted = parts.map((part, i) => {
        const match = part.match(/\[\[(.*?)\]\]/);
        if (match) {
          const name = match[1];
          const product = allProducts.find((p) => p.artName.includes(name));
          if (product) {
            return (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(`/product/${product.id}` as any)}
                style={{
                  backgroundColor: "#fde68a",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 54,
                  marginVertical: 2,
                }}
              >
                <Text style={{ color: "#92400e", fontWeight: "bold" }}>
                  {product.artName}
                </Text>
              </TouchableOpacity>
            );
          }
        }
        return (
          <Text key={i} style={{ color: "#111" }}>
            {part}
          </Text>
        );
      });

      setMessages((prev) => [...prev, { role: "assistant", text: formatted }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Hãy thử lại nhé!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, allProducts, favoriteProducts]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-1">AI Assistant</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs text-gray-500">Powered by Gemini</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <GradientBackground 
                style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                imageStyle={{ borderRadius: 20 }}
              >
                <TouchableOpacity className="w-full h-full justify-center items-center">
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </GradientBackground>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollViewRef} className="flex-1 px-5 py-4">
          {messages.map((msg, idx) => (
            <View
              key={idx}
              className={`mb-4 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <View
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? ""
                    : "bg-gray-100"
                }`}
                style={msg.role === "user" ? {} : {}}
              >
                {msg.role === "user" ? (
                  <GradientBackground
                    style={{
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    {Array.isArray(msg.text) ? (
                      msg.text
                    ) : (
                      <Text className="text-base text-white">
                        {msg.text}
                      </Text>
                    )}
                  </GradientBackground>
                ) : (
                  <>
                    {Array.isArray(msg.text) ? (
                      msg.text
                    ) : (
                      <Text className="text-base text-gray-800">
                        {msg.text}
                      </Text>
                    )}
                  </>
                )}
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
          {loading && (
            <View className="flex-row items-center mb-4">
              <View className="bg-gray-100 px-4 py-3 rounded-2xl">
                <ActivityIndicator size="small" color="#000" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View
          className="flex-row items-center px-5 py-4"
          style={{ marginBottom: 100 }}
        >
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
          </View>
          {input.trim() && !loading ? (
            <GradientBackground
              style={{ width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}
              imageStyle={{ borderRadius: 24 }}
            >
              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || loading}
                className="w-full h-full justify-center items-center"
              >
                <Ionicons
                  name="send"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </GradientBackground>
          ) : (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center"
            >
              <Ionicons
                name="send"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
