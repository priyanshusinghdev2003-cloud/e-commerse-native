import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./db/index.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";
import makeAdmin from "./scripts/makeAdmin.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import addressRoutes from "./routes/address.route.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();
await connectDB();

app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

const port = process.env.PORT || 3000;

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Server is Live!" });
});

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);

await makeAdmin();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
