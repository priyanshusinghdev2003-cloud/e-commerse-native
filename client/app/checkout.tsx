import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "expo-router";
import { Address } from "@/constants/types";
import { dummyAddress } from "@/assets/assets";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";

export default function checkout() {
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const shipping = 2.0;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const addressList = data.data;
      if (addressList.length > 0) {
        const defaultAddress =
          addressList.find((a: any) => a.isDefault) || addressList[0];
        setSelectedAddress(defaultAddress as Address);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch addresses",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add a shipping address",
      });
      return;
    }
    if (paymentMethod == "stripe") {
      Toast.show({
        type: "error",
        text1: "Info",
        text2: "Stripe payment is not implemented yet",
      });
      return;
    }

    // cash on delivery

    try {
      setLoading(true);
      const token = await getToken();
      const payload = {
        shippingAddress: selectedAddress,
        notes: "Placed via App",
      };
      const { data } = await api.post("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        await clearCart();
        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: "Your order has been placed successfully",
        });
        router.replace("/orders");
      }
    } catch (error: any) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response.data.message || "Failed to place order",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header showBack title="Checkout" />
      <ScrollView className="fflex-1 px-4 mt-4">
        {/* Address Section */}
        <Text className="text-lg font-bold text-primary mb-4">
          Shipping Address
        </Text>
        {selectedAddress ? (
          <View className="bg-white p-4 rounded-xl mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-bold">
                {selectedAddress.type}
              </Text>
              <TouchableOpacity onPress={() => router.push("/addresses")}>
                <Text className="text-accent text-sm">Change</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-secondary leading-5">
              {selectedAddress.street}, {selectedAddress.city} {"\n"}
              {selectedAddress.state}, {selectedAddress.zipCode} {"\n"}
              {selectedAddress.country}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100"
            onPress={() => router.push("/addresses")}
          >
            <Text className="text-primary font-bold">Add Address</Text>
          </TouchableOpacity>
        )}
        {/* payment seection */}
        <Text className="text-lg text-primary mb-4">Payment Method</Text>
        <TouchableOpacity
          onPress={() => setPaymentMethod("cash")}
          className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === "cash" ? "border-primary" : "border-transparent"}`}
        >
          <Ionicons
            name="cash-outline"
            size={24}
            color={COLORS.primary}
            className="mr-3"
          />

          <View className="ml-3 flex-1">
            <Text className="text-bas font-bold text-primary">
              Cash on Delivery
            </Text>
            <Text className="text-secondary text-xs mt-1">
              Pay when you receive the order
            </Text>
          </View>
          {paymentMethod === "cash" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
        {/* stripe */}
        <TouchableOpacity
          onPress={() => setPaymentMethod("stripe")}
          className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === "stripe" ? "border-primary" : "border-transparent"}`}
        >
          <Ionicons
            name="card-outline"
            size={24}
            color={COLORS.primary}
            className="mr-3"
          />

          <View className="ml-3 flex-1">
            <Text className="text-bas font-bold text-primary">
              Pay with Card
            </Text>
            <Text className="text-secondary text-xs mt-1">
              Credit or Debit Card
            </Text>
          </View>
          {paymentMethod === "stripe" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </ScrollView>
      {/* order summary */}
      <View className="p-4 bg-white shadow-lg border-t border-gray-100">
        <Text className="text-lg font-bold text-primary mb-4">
          Order Summary
        </Text>
        {/* sub total */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Subtotal</Text>
          <Text className=" font-bold">${cartTotal.toFixed(2)}</Text>
        </View>
        {/* shipping */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Shipping</Text>
          <Text className="font-bold">${shipping.toFixed(2)}</Text>
        </View>
        {/* tax */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-secondary">Tax</Text>
          <Text className="font-bold">${tax.toFixed(2)}</Text>
        </View>
        {/* total */}
        <View className="flex-row justify-between mb-6">
          <Text className="text-primary text-xl font-bold">Total</Text>
          <Text className="text-primary text-xl font-bold">
            ${total.toFixed(2)}
          </Text>
        </View>
        {/* place order button */}
        <TouchableOpacity
          onPress={handlePlaceOrder}
          className={`p-4 rounded-xl items-center ${loading ? "bg-gray-300" : "bg-primary"}`}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white  text-lg font-bold">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
