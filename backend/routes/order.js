const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// ➕ Create Order (Only Customers)
router.post("/add", verifyToken, async (req, res) => {
  const user = req.user;
  const { items, total_price, address_id } = req.body;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can place orders" });
  }

  if (!items || !total_price || !address_id) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  // 1. Check if the provided address_id belongs to the logged-in user
  const checkAddressSql = "SELECT * FROM address WHERE id = ? AND user_id = ?";
  db.query(checkAddressSql, [address_id, user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    // If the address doesn't exist for the current user, return an error
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid address ID for this user" });
    }

    // 2. Proceed with the order creation if the address exists
    const sql = `
      INSERT INTO orders (user_id, address_id, total, status)
      VALUES (?, ?, ?, 'pending')
    `;

    db.query(sql, [user.id, address_id, total_price], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      const orderId = result.insertId;

      // Prepare items for insertion into the order_items table
      const orderItems = items.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      const orderItemsSql =
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";

      db.query(orderItemsSql, [orderItems], (err) => {
        if (err) return res.status(500).json({ message: err.message });

        res.status(201).json({ message: "Order placed successfully", orderId });
      });
    });
  });
});

module.exports = router;
