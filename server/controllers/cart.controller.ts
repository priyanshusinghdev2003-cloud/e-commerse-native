import Cart from "../models/Cart.model.js";
import { Request, Response } from "express";
import Product from "../models/Products.model.js";

// get user cart
export const getCart = async (req: Request, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id }).populate(
      "items.product",
      "name images price stock",
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message || "Failed to get cart", success: false });
  }
};

// add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock", success: false });
    }
    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }
    // find item with same product and size
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        size,
      });
    }
    cart.calculateTotal();
    await cart.save();
    await cart.populate("items.product", "name images price stock");

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to add item to cart",
      success: false,
    });
  }
};

// update cart item
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { quantity, size } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        messgae: "Cart not found",
      });
    }
    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        messgae: "Item not found in cart",
      });
    }
    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId,
      );
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          messgae: "Product not found",
        });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          messgae: "Insufficient stock",
        });
      }
      item.quantity = quantity;
    }
    cart.calculateTotal();
    await cart.save();
    await cart.populate("items.product", "name images price stock");
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to update cart item",
      success: false,
    });
  }
};

// remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { size } = req.query;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !size) {
      return res.status(404).json({
        success: false,
        messgae: "Cart not found",
      });
    }
    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== req.params.productId && item.size !== size,
    );
    cart.calculateTotal();
    await cart.save();
    await cart.populate("items.product", "name images price stock");
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to remove item from cart",
      success: false,
    });
  }
};

// clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to clear cart",
      success: false,
    });
  }
};
