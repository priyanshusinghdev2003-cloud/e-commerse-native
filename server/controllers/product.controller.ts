import { Request, Response } from "express";
import Product from "../models/Products.mode.js";

// get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query: any = { isActive: true };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)); // skip = (page - 1) * limit
    res.status(200).json({
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch products",
      success: false,
    });
  }
};

// get single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }
    res.status(200).json({
      data: product,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch product",
      success: false,
    });
  }
};

// create or list product
export const createProduct = async (req: Request, res: Response) => {
  try {
    let images = [];

    // handle file uploads
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to create product",
      success: false,
    });
  }
};
