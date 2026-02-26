import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Product } from "@/constants/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "@/constants/api";

const { width } = Dimensions.get("window");

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { cartItems, addToCart, itemCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch product",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }
  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl font-bold">Product not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      Toast.show({
        type: "info",
        text1: "No size selected",
        text2: "Please select a size",
      });
      return;
    }
    addToCart(product, selectedSize || "");
  };

  const isLiked = isInWishlist(product._id);
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Carousel */}
        <View className="relative h-[450px] bg-gray-100 mb-6">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const slide = Math.ceil(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width,
              );
              setActiveImageIndex(slide);
            }}
          >
            {product.images?.map((image, index) => (
              <Image
                source={{ uri: image }}
                key={index}
                style={{
                  width: width,
                  height: 450,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Header Action */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-10">
            <TouchableOpacity
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
              onPress={() => toggleWishlist(product)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.accent : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
          {/* pagination dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images?.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeImageIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </View>
        </View>

        {/* product info */}
        <View className="px-5">
          {/* product title and rating */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-primary flex-1 mr-4">
              {product.name}
            </Text>
            <View className="flex-row items-start justify-between mb-2 bg-gray-100 px-3 py-1 rounded-full">
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text className="ml-1 text-sm font-bold">4.6</Text>
              <Text className="ml-1 text-secondary text-xs">(85)</Text>
            </View>
          </View>

          {/* product price */}
          <Text className="text-2xl font-bold text-primary mb-6">
            ${product.price.toFixed(2)}
          </Text>
          {/* product size */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <Text className="text-base font-bold text-primary mb-3">
                Size
              </Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    className={`w-12 h-12 rounded-full items-center justify-center border ${
                      selectedSize === size
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-100"
                    }`}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedSize === size ? "text-white" : "text-primary"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {/* product description */}
          <Text className="text-base font-bold text-primary mb-2">
            Description
          </Text>
          <Text className="text-secondary leading-6 mb-6">
            {product.description}
          </Text>
        </View>
      </ScrollView>
      {/* footer */}
      <View className="absolute bottom-0 left-0 right-0 flex-row bg-white border-t border-gray-100 p-4">
        <TouchableOpacity
          className="w-4/5 bg-primary py-4 rounded-full items-center shadow-lg flex-row justify-center"
          onPress={handleAddToCart}
        >
          <Ionicons name="bag-outline" size={20} color="white" />
          <Text className="text-white font-bold text-base ml-2">
            Add to Cart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-1/5 py-3 flex-row justify-center relative"
          onPress={() => router.push("/(tabs)/cart")}
        >
          <Ionicons name="cart-outline" size={24} />
          <View className="absolute top-2 right-4 size-4 z-10 bg-black rounded-full justify-center items-center">
            <Text className="text-white text-[9px]">{itemCount}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;
