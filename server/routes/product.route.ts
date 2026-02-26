import express from "express";
import upload from "../middlewares/upload.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(getProducts);
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProduct,
);

router.route("/:id").get(getProduct);
router
  .route("/:id")
  .put(upload.array("images", 5), protect, authorize("admin"), updateProduct);
router.route("/:id").delete(protect, authorize("admin"), deleteProduct);

export default router;
