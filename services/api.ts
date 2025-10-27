import { Product } from "../types/product";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://68cbc9de716562cf50750aa4.mockapi.io/se171306";

export const apiService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get products by brand
  getProductsByBrand: async (brand: string): Promise<Product[]> => {
    try {
      const products = await apiService.getProducts();
      return products.filter(
        (product) => product.brand.toLowerCase() === brand.toLowerCase()
      );
    } catch (error) {
      console.error(`Error fetching products for brand ${brand}:`, error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const products = await apiService.getProducts();
      return products.filter(
        (product) =>
          product.artName.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(`Error searching products with query ${query}:`, error);
      throw error;
    }
  },

  // Get best sellers (products with limited time deal)
  getBestSellers: async (): Promise<Product[]> => {
    try {
      const products = await apiService.getProducts();
      // Sort by discount percentage and limit to top products
      return products
        .filter((product) => product.limitedTimeDeal > 0)
        .sort((a, b) => b.limitedTimeDeal - a.limitedTimeDeal)
        .slice(0, 6);
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      throw error;
    }
  },

  // Get new arrivals (latest products by ID - assuming higher IDs are newer)
  getNewArrivals: async (): Promise<Product[]> => {
    try {
      const products = await apiService.getProducts();
      // Sort by ID descending (newer first) and take top 8
      return products
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 8);
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      throw error;
    }
  },

  // Get featured products (products with best ratings)
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const products = await apiService.getProducts();
      return products
        .filter((product) => product.feedbacks && product.feedbacks.length > 0)
        .sort((a, b) => {
          const avgRatingA =
            a.feedbacks!.reduce((sum, f) => sum + f.rating, 0) /
            a.feedbacks!.length;
          const avgRatingB =
            b.feedbacks!.reduce((sum, f) => sum + f.rating, 0) /
            b.feedbacks!.length;
          return avgRatingB - avgRatingA;
        })
        .slice(0, 6);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },
};
