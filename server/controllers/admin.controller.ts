import { Request, Response } from "express";
import User from "../models/User.model.js";
import Product from "../models/Products.model.js";
import Order from "../models/Order.model.js";

// get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const validOrders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    const totalRevenue = validOrders.reduce(
      (acc, order) => acc + order.totalAmount,
      0,
    );
    const recentOrders = await Order.find()
      .sort("-createdAt")
      .limit(5)
      .populate("user", "name email");

    res.status(200).json({
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
      },
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to get dashboard stats",
      success: false,
    });
  }
};
