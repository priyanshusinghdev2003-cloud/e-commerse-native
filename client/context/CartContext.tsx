import api from "@/constants/api";
import { Product } from "@/constants/types";
import { useAuth } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (itemId: string, size: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    size: string,
    quantity: number,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const { isSignedIn, getToken } = useAuth();

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success && data.data) {
        const serverCart = data.data;
        const mappedItem: CartItem[] = serverCart.items.map((item: any) => ({
          id: item.product._id,
          productId: item.product._id,
          quantity: item.quantity,
          product: item.product,
          size: item?.size || "M",
          price: item.price,
        }));
        setCartItems(mappedItem);
        setCartTotal(serverCart.totalAmount);
      }
    } catch (error) {
      console.log("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string) => {
    if (!isSignedIn) {
      Toast.show({
        type: "error",
        text1: "Please login to add items to cart",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Item added to cart",
        });
        await fetchCart();
      }
    } catch (error) {
      console.log("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string, size: string) => {
    if (!isSignedIn) {
      return;
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete(`/cart/item/${itemId}?size=${size}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Item removed from cart",
        });
        await fetchCart();
      }
    } catch (error) {
      console.log("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (
    itemId: string,
    size: string = "M",
    quantity: number,
  ) => {
    if (!isSignedIn || quantity <= 1) {
      return;
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.put(
        `/cart/item/${itemId}`,
        {
          quantity,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.log("Error updating cart item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isSignedIn) {
      return;
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error) {
      console.log("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const itemCount =
    cartItems && cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
      setIsLoading(false);
    }
  }, [isSignedIn]);
  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
