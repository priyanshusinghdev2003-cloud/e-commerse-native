import { dummyCart } from "@/assets/assets";
import { Product } from "@/constants/types";
import { createContext, useContext, useEffect, useState } from "react";

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

  const fetchCart = async () => {
    setIsLoading(true);
    const serverCart = dummyCart;
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
    setIsLoading(false);
  };

  const addToCart = async (product: Product, size: string) => {};

  const removeFromCart = async (itemId: string, size: string) => {};

  const updateQuantity = async (
    itemId: string,
    size: string = "M",
    quantity: number,
  ) => {};

  const clearCart = async () => {};
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, []);
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
