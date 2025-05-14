const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load .env variables (important to call early)

const db = require("./db"); // MySQL connection

// Route imports
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const checkoutRoutes = require("./routes/checkout");
const addressRoutes = require("./routes/address");
const categoryRoutes = require("./routes/category");
const subcategoryRoutes = require("./routes/subcategory");
const subSubcategoryRoutes = require("./routes/subsubcategories");
const subsubsubcategoryRoutes = require("./routes/subsubsubCategory");
const orderConfirmationRoutes = require("./routes/orderConfirmation");
const orderHistoryRoutes = require("./routes/orderHistory");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests
app.use("/uploads", express.static("uploads")); // Serve uploaded images or files

// ===== API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/subsubcategory", subSubcategoryRoutes);
app.use("/api/subsubsubcategory", subsubsubcategoryRoutes);
app.use("/api/order-confirmation", orderConfirmationRoutes);
app.use("/api/order-history", orderHistoryRoutes);

// ===== ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send("✅ E-Commerce API is live!");
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
