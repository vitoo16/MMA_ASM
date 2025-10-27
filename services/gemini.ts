import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key from environment
const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  "AIzaSyC59I0HMx7M-h6nYW3Y_CoLQ__AE3cXewk";
const genAI = new GoogleGenerativeAI(API_KEY);

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export const geminiService = {
  /**
   * 🧠 Ask with Context (Main intelligent chat entry)
   * - Understands chat history
   * - Knows user's favorites
   * - Replies in user's language
   * - Can highlight product names
   */
  async askWithContext(
    userInput: string,
    chatHistory: ChatMessage[],
    userFavorites: any[],
    userActions: string[] = []
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const favoritesList = userFavorites
        .map(
          (p) => `- ${p.artName} (${p.brand}, $${p.price}) - ${p.description}`
        )
        .join("\n");

      const conversation = chatHistory
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
        .join("\n");

      const prompt = `
You are an in-app AI shopping assistant for an art supplies mobile app.
Your job is to help users find, compare, and understand products *inside this app only*.

RULES:
1. Only discuss products, prices, and actions related to this app.
2. Remember past conversation and continue naturally.
3. Understand both English and Vietnamese.
4. Always reply in the same language as the user.
5. If the user refers to something from before, keep the context.
6. When mentioning a product, wrap its name with <highlight>...</highlight>.
   (The app will render highlighted names as clickable links to product detail.)
7. If user asks to translate your previous message, rephrase your last AI reply into that language.
8. If user asks to compare or recommend from their favorites, use the "Favorites" list below.

USER CONTEXT:
Favorites:
${favoritesList || "User currently has no favorite products."}

Recent actions:
${userActions.join(", ") || "No recent actions recorded."}

CONVERSATION HISTORY:
${conversation}

USER MESSAGE:
"${userInput}"

Now, continue the conversation naturally following these rules.
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Context API Error:", error);
      return "Xin lỗi, tôi đang gặp chút sự cố khi xử lý yêu cầu này. Bạn có thể thử lại sau nhé!";
    }
  },

  /**
   * 🎨 Recommend products based on user's query
   */
  async getProductRecommendations(
    userQuery: string,
    availableProducts: any[]
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const productDetails = availableProducts
        .map(
          (p) => `- ${p.artName} (${p.brand}, $${p.price}) - ${p.description}`
        )
        .join("\n");

      const prompt = `You are an AI assistant for an Art Supplies e-commerce app. 
Rules:
1. ONLY recommend products from the catalog below.
2. Highlight the recommended product names using <highlight>...</highlight>.
3. Keep responses concise (2-4 sentences).

PRODUCT CATALOG:
${productDetails}

CUSTOMER QUESTION: "${userQuery}"

Respond helpfully based ONLY on the products above.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Hiện tại tôi không thể kết nối tới máy chủ AI. Bạn thử hỏi lại sau nhé!";
    }
  },

  /**
   * ⚖️ Compare multiple products
   */
  async compareProducts(
    products: any[],
    userQuestion?: string
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const productDetails = products
        .map(
          (p, i) =>
            `Product ${i + 1}: ${p.artName}
   - Brand: ${p.brand}
   - Price: $${p.price}
   - Description: ${p.description}
   - Glass Surface Compatible: ${p.glassSurface ? "Yes" : "No"}
   - Deal: ${
     p.limitedTimeDeal
       ? `${(p.limitedTimeDeal * 100).toFixed(0)}% off`
       : "No discount"
   }`
        )
        .join("\n\n");

      const prompt = `Compare these art products for a customer:

${productDetails}

${
  userQuestion
    ? `Customer wants to know: "${userQuestion}"`
    : "Provide a comparison highlighting key differences in price, quality, and purpose."
}

Use <highlight>ProductName</highlight> for the recommended item. Keep it clear and short (3–5 sentences).`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Xin lỗi, hiện tôi chưa thể so sánh các sản phẩm này. Bạn hãy thử lại sau nhé!";
    }
  },

  /**
   * ✍️ Enhance a product description
   */
  async enhanceProductDescription(productName: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `Create a short, engaging product description (2–3 sentences) for this art supply product: "${productName}". 
Focus on its creative potential and quality.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return `${productName} - a high-quality art supply loved by creative minds worldwide!`;
    }
  },

  /**
   * 🧩 Art Tips and Tricks
   */
  async getArtTips(topic: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `Give 3 short, practical tips for artists about "${topic}". 
Each tip one sentence, numbered list format.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "1. Practice consistently.\n2. Explore new techniques.\n3. Seek feedback and inspiration.";
    }
  },

  /**
   * 💬 Business / Website related queries
   */
  async answerBusinessQuery(
    question: string,
    productsContext: any[]
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const brands = [...new Set(productsContext.map((p) => p.brand))].join(
        ", "
      );
      const priceRange = {
        min: Math.min(...productsContext.map((p) => p.price)),
        max: Math.max(...productsContext.map((p) => p.price)),
      };

      const prompt = `You are an AI assistant for an Art Supplies e-commerce website.

WEBSITE INFO:
- We sell ${productsContext.length} different art supply products.
- Brands: ${brands}
- Price range: $${priceRange.min} - $${priceRange.max}
- Features: Product search, favorites, shopping cart, user authentication, AI assistant.
- We offer deals and discounts on selected items.

CUSTOMER QUESTION: "${question}"

Provide a concise, accurate answer (2–3 sentences) about our website or products.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Tôi sẵn sàng giúp bạn! Bạn có thể hỏi về sản phẩm, giá cả hoặc tính năng của ứng dụng.";
    }
  },
};
