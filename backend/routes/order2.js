const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// ➕ Create Order — Only customers can place orders
router.post("/create", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can place orders" });
  }

  const { productIds, quantity } = req.body;

  if (!productIds || !quantity) {
    return res
      .status(400)
      .json({ message: "Product IDs and quantity are required" });
  }

  const orderData = {
    customer_id: user.id,
    status: "Pending",
    total_price: 0, // We will calculate this in the next steps
  };

  // Calculate total price based on the products
  let totalPrice = 0;
  for (const productId of productIds) {
    const sql = "SELECT price FROM products WHERE id = ?";
    const result = await db.query(sql, [productId]);
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found` });
    }
    totalPrice += result[0].price * quantity;
  }

  orderData.total_price = totalPrice;

  const sqlOrder =
    "INSERT INTO orders (customer_id, total_price, status) VALUES (?, ?, ?)";
  const [orderResult] = await db.query(sqlOrder, [
    user.id,
    totalPrice,
    orderData.status,
  ]);

  // Insert order items
  for (const productId of productIds) {
    const sqlOrderItem =
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)";
    await db.query(sqlOrderItem, [orderResult.insertId, productId, quantity]);
  }

  res
    .status(201)
    .json({
      message: "Order placed successfully",
      orderId: orderResult.insertId,
    });
});

// 🌐 Get all orders (For admin only)
router.get("/all", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can view all orders" });
  }

  const sql = "SELECT * FROM orders ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({ orders: results });
  });
});

// 🌐 Get orders placed by the current customer
router.get("/my-orders", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Only customers can view their orders" });
  }

  const sql =
    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC";
  db.query(sql, [user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({ orders: results });
  });
});

module.exports = router;
