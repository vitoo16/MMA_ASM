import React, { createContext, useState, useContext, useEffect } from "react";
import { favoritesService } from "../services/favorites";
import { Product } from "../types/product";
import { apiService } from "../services/api";

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteProducts: Product[];
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const ids = await favoritesService.getFavorites();
      setFavoriteIds(ids);

      // Fetch full product details for favorites
      if (ids.length > 0) {
        const products = await Promise.all(
          ids.map((id) => apiService.getProductById(id))
        );
        setFavoriteProducts(products.filter(Boolean) as Product[]);
      } else {
        setFavoriteProducts([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const isFavorite = (productId: string) => {
    return favoriteIds.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    try {
      if (isFavorite(productId)) {
        await favoritesService.removeFavorite(productId);
      } else {
        await favoritesService.addFavorite(productId);
      }
      await loadFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const clearFavorites = async () => {
    try {
      await favoritesService.clearFavorites();
      await loadFavorites();
    } catch (error) {
      console.error("Error clearing favorites:", error);
    }
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteProducts,
        loading,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
