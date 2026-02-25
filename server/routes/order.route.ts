import express from "express";

import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { authorize, protect } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(protect, getUserOrders);
router.route("/:id").get(protect, getOrder);
router.route("/").post(protect, createOrder);
router.route("/:id/status").put(protect, authorize("admin"), updateOrderStatus);
router.route("/admin/all").get(protect, authorize("admin"), getAllOrders);

export default router;
