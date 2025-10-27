import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@favorites";

export const favoritesService = {
  // Get all favorite product IDs
  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  },

  // Add a product to favorites
  async addFavorite(productId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  },

  // Remove a product from favorites
  async removeFavorite(productId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.filter((id) => id !== productId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  },

  // Check if a product is in favorites
  async isFavorite(productId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(productId);
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  },

  // Clear all favorites
  async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error("Error clearing favorites:", error);
    }
  },
};
