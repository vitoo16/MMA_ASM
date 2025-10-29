import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Hiển thị ảnh vừa gửi lên chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: (
            <Image
              source={{ uri: result.assets[0].uri }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
            />
          ),
        },
      ]);

      // Trả về thông báo AI chưa hỗ trợ phân tích hình ảnh và gợi ý sản phẩm
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: (
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: "#6366F1",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 6,
                }}
              >
                AI chưa hỗ trợ phân tích hình ảnh, nhưng bạn vẫn có thể hỏi về
                sản phẩm hoặc nhận gợi ý!
              </Text>
              {allProducts.length > 0 && (
                <Text
                  style={{ marginBottom: 8, color: "#374151", fontSize: 15 }}
                >
                  Một số sản phẩm nổi bật:
                </Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 2 }}
                contentContainerStyle={{ gap: 12, paddingRight: 12 }}
              >
                {allProducts.slice(0, 10).map((p, idx) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => router.push(`/product/${p.id}` as any)}
                    style={{
                      backgroundColor: "#F3F4F6",
                      borderRadius: 18,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 2,
                      minWidth: 90,
                      marginRight: 0,
                    }}
                  >
                    {/* Nếu có hình ảnh sản phẩm thì hiển thị, nếu không thì icon */}
                    {p.image ? (
                      <Image
                        source={{ uri: p.image }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          marginBottom: 6,
                        }}
                      />
                    ) : (
                      <Ionicons
                        name="color-palette"
                        size={28}
                        color="#6366F1"
                        style={{ marginBottom: 6 }}
                      />
                    )}
                    <Text
                      style={{
                        color: "#1F2937",
                        fontWeight: "bold",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {p.artName}
                    </Text>
                    <Text
                      style={{
                        color: "#6B7280",
                        fontSize: 12,
                        marginTop: 2,
                        textAlign: "center",
                      }}
                    >
                      {p.brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ),
        },
      ]);
    }
  };
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
      // 3️⃣ Personality cho AI
      const personality = [
        "Bạn thích vẽ và thường khen người dùng sáng tạo.",
        "Bạn đôi khi thêm emoji để thể hiện cảm xúc 😊🎨.",
        "Khi người dùng có vẻ buồn, bạn khích lệ nhẹ nhàng.",
        "Khi người dùng hỏi linh tinh, bạn cười nhẹ rồi kéo về chủ đề nghệ thuật.",
      ].join("\n");

      // 2️⃣ Context + Personality
      const context = `
${personality}
Bạn là trợ lý AI vui tính, nói chuyện tự nhiên như một người bạn am hiểu nghệ thuật 🎨. 
Ứng dụng của bạn chuyên bán các sản phẩm nghệ thuật như: bút màu, sơn, màu nước, cọ vẽ, giấy vẽ,...

⚙️ NGUYÊN TẮC:
- Luôn giữ giọng văn nhẹ nhàng, thân thiện, có chút cảm xúc và tự nhiên như người thật.
- Nếu người dùng hỏi câu vô nghĩa hoặc không liên quan (ví dụ: “trời mưa có buồn không?”), hãy phản hồi dí dỏm, 
  sau đó khéo léo chuyển hướng sang chủ đề nghệ thuật hoặc sản phẩm.
- Nếu người dùng hỏi về sản phẩm, chỉ nói trong phạm vi sản phẩm có trong app này.
- Nếu người dùng nói về việc cần chọn, so sánh, hay tìm cảm hứng vẽ, hãy gợi ý sản phẩm cụ thể trong app bằng cú pháp [[Tên sản phẩm]].
- Nếu người dùng nói linh tinh, bạn vẫn phải giữ hội thoại tự nhiên và tìm cách gắn kết lại chủ đề vẽ hoặc sáng tạo.
- Nếu người dùng có sản phẩm yêu thích (${
        favoriteProducts.length
      } sản phẩm): ${favoriteProducts
        .map((p) => `${p.artName} (${p.brand}, giá $${p.price})`)
        .join("; ")}.
- Ngôn ngữ trả lời: theo ngôn ngữ người dùng nhập.
- Giữ hội thoại có mạch logic, nhớ nội dung trước đó để phản hồi hợp lý nhưng khi trả lời, chỉ viết câu trả lời mới, không lặp lại hội thoại trước đó.
`;

      const chat = await genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });

      // 2️⃣ Gửi lịch sử hội thoại
      const conversationHistory = messages
        .map(
          (m) =>
            `${m.role === "user" ? "Người dùng" : "Trợ lý"}: ${
              typeof m.text === "string" ? m.text : ""
            }`
        )
        .join("\n");

      const result = await chat.generateContent(
        `${context}\n${conversationHistory}\nNgười dùng: ${input}`
      );
      const aiText = result.response.text();

      // 4️⃣ Gợi ý sản phẩm mượt mà hơn (không phân biệt hoa thường)
      const parts = aiText.split(/(\[\[.*?\]\])/g);
      // ...existing code...
      const formatted = parts.map((part, i) => {
        const match = part.match(/\[\[(.*?)\]\]/);
        if (match) {
          const name = match[1];
          // Chỉ gợi ý nếu là sản phẩm có trong data
          const product = allProducts.find((p) =>
            p.artName.toLowerCase().includes(name.toLowerCase())
          );
          if (product) {
            // Nếu là sản phẩm, bấm vào xem chi tiết
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
          // Nếu không phải sản phẩm, KHÔNG render gì cả
          return null;
        }
        return (
          <Text key={i} style={{ color: "#111" }}>
            {part}
          </Text>
        );
      });
      // ...existing code...

      // 5️⃣ Giới hạn độ dài hội thoại
      setMessages((prev) => {
        const newMsgs = [...prev, { role: "assistant", text: formatted }];
        return newMsgs.slice(-10);
      });
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
  }, [input, allProducts, favoriteProducts, messages]);

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
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                AI Assistant
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs text-gray-500">Powered by Gemini</Text>
              </View>
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
                  msg.role === "user" ? "" : "bg-gray-100"
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
                      <Text className="text-base text-white">{msg.text}</Text>
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

        {/* Input + nút gửi ảnh */}
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
            <TouchableOpacity
              onPress={pickImage}
              className="ml-2"
              style={{ padding: 4 }}
            >
              <Ionicons name="image" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
          {input.trim() && !loading ? (
            <GradientBackground
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
              imageStyle={{ borderRadius: 24 }}
            >
              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || loading}
                className="w-full h-full justify-center items-center"
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </GradientBackground>
          ) : (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center"
            >
              <Ionicons name="send" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
