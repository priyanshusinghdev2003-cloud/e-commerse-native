import Cart from "../models/Cart.model.js";
import Order from "../models/Order.model.js";
import { Request, Response } from "express";
import Product from "../models/Products.model.js";

// get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const query = { user: req.user._id };
    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .sort("-createdAt");
    res.status(200).json({
      data: orders,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch orders",
      success: false,
    });
  }
};

// get single order
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate(
      "items.product",
      "name images",
    );
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }
    res.status(200).json({
      data: order,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch order",
      success: false,
    });
  }
};

// create or place order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { shippingAddress, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        message: "Cart is empty",
        success: false,
      });
    }
    // verify stock and prepare order item
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(404).json({
          message: `Insufficient stock for ${(item?.product as any).name}`,
          success: false,
        });
      }
      orderItems.push({
        product: item.product._id,
        name: (item.product as any).name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      });
      //   reduce stock
      product.stock -= item.quantity;
      await product.save();
    }
    const subtotal = cart.totalAmount;
    const shippingCost = 2;
    const tax = 0;
    const totalAmount = subtotal + shippingCost + tax;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: req.body.paymentMethod || "cash",
      paymentStatus: "pending",
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes,
      paymentIntentId: req.body.paymentIntentId,
      orderNumber: `ORD-${Date.now()}`,
    });

    if (req.body.paymentMethod !== "stripe") {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    res.status(201).json({
      data: order,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to create order",
      success: false,
    });
  }
};

// update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.status(200).json({
      data: order,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to update order status",
      success: false,
    });
  }
};

// get all orders for admin
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: any = {};
    if (status) {
      query.orderStatus = status;
    }
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort("-createdAt")
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      data: orders,
      success: true,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch orders",
      success: false,
    });
  }
};
