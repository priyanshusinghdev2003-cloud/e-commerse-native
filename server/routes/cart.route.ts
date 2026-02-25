import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(protect, getCart);
router.route("/add").post(protect, addToCart);
router.route("/item/:productId").put(protect, updateCartItem);
router.route("/item/:productId").delete(protect, removeFromCart);
router.route("/").delete(protect, clearCart);

export default router;
