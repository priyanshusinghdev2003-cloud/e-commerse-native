import Address from "../models/Address.model.js";
import { Request, Response } from "express";

// get user address
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      data: addresses,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to fetch addresses",
      success: false,
    });
  }
};

// create new address
export const createAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } },
      );
    }

    const newAddress = await Address.create({
      user: req.user._id,
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      data: newAddress,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to create address",
      success: false,
    });
  }
};

// update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    let address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
        success: false,
      });
    }
    // ensure user owns the address
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this address",
        success: false,
      });
    }
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } },
      );
    }
    address = await Address.findByIdAndUpdate(
      req.params.id,
      {
        type,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
      },
      { new: true },
    );
    res.status(200).json({
      data: address,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to update address",
      success: false,
    });
  }
};

// delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
        success: false,
      });
    }
    // ensure user owns the address
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this address",
        success: false,
      });
    }
    await address.deleteOne();
    res.status(200).json({
      message: "Address deleted successfully",
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Failed to delete address",
      success: false,
    });
  }
};
