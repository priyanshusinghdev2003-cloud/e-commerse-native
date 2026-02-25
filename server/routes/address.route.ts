import express from "express";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(protect, getAddresses).post(protect, createAddress);
router.route("/:id").put(protect, updateAddress).delete(protect, deleteAddress);

export default router;
