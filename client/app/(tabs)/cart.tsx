import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="My Cart" showBack />
      {cartItems.length > 0 ? (
        <></>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-secondary text-lg">Your cart is empty</Text>
          <TouchableOpacity className="mt-4" onPress={() => router.push("/")}>
            <Text className="text-primary font-bold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
