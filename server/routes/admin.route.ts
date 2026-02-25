import express from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { authorize, protect } from "../middlewares/auth.js";

const router = express.Router();

router.route("/stats").get(protect, authorize("admin"), getDashboardStats);
export default router;
