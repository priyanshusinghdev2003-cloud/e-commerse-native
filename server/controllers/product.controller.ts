import { Request, Response } from "express";
import Product from "../models/Products.model.js";
import cloudinary from "../config/cloudinary.js";

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
    let images: string[] = [];

    // handle file uploads
    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "e-commersenative/products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result!.secure_url);
              }
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      images = await Promise.all(uploadPromises);
    }

    if (images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
        success: false,
      });
    }

    let sizes = req.body.sizes || [];
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (error) {
        sizes = sizes
          .split(",")
          .map((size: string) => size.trim())
          .filter((size: string) => size !== "");
      }
    }

    if (!Array.isArray(sizes)) {
      sizes = [sizes];
    }

    const product = await Product.create({
      ...req.body,
      images,
      sizes,
    });

    res.status(201).json({
      data: product,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to create product",
      success: false,
    });
  }
};

// update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    let images: string[] = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = [...req.body.existingImages];
      } else {
        images = [req.body.existingImages];
      }
    }

    // handle file uploads
    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "e-commersenative/products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result!.secure_url);
              }
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      const newImages = await Promise.all(uploadPromises);
      images = [...images, ...newImages];
    }

    const updates = {
      ...req.body,
    };
    if (req.body.sizes) {
      let sizes = req.body.sizes || [];
      if (typeof sizes === "string") {
        try {
          sizes = JSON.parse(sizes);
        } catch (error) {
          sizes = sizes
            .split(",")
            .map((size: string) => size.trim())
            .filter((size: string) => size !== "");
        }
      }
      if (!Array.isArray(sizes)) sizes = [sizes];
      updates.sizes = sizes;
    }
    if (
      req.body.existingImages ||
      (req.files && (req.files as any).length > 0)
    ) {
      updates.images = images;
    }

    delete updates.existingImages;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.status(201).json({
      data: product,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to update product",
      success: false,
    });
  }
};

// delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }
    //delete images from cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((image: string) => {
        const publicIdMatch = image.match(/\/v\d+\/(.+)\.[a-z]+$/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to delete product",
      success: false,
    });
  }
};
