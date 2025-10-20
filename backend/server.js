const express = require("express");
const cors = require("cors");
const db = require("./db");

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

// Middlewares
app.use(cors());
app.use(express.json()); // For parsing JSON requests

// API Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api", protectedRoutes); // Protected routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes); // Order routes
app.use("/api/address", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/subsubcategory", subSubcategoryRoutes);
app.use("/api/subsubsubcategory", subsubsubcategoryRoutes);
app.use("/api/order-confirmation", orderConfirmationRoutes);
app.use("/api/order-history", orderHistoryRoutes);

app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Default Route
app.get("/", (req, res) => {
  res.send("E-Commerce API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
