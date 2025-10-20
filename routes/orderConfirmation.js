const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 📍 View Order Details (For Customer, Seller, Admin)
router.get("/:orderId", verifyToken, async (req, res) => {
  const user = req.user; // Retrieved user info from JWT token
  const { orderId } = req.params; // Extracting orderId from URL params

  const sql = "SELECT * FROM orders WHERE id = ?";
  db.query(sql, [orderId], (err, orderResults) => {
    if (err) return res.status(500).json({ message: err.message });

    if (!orderResults.length)
      return res.status(404).json({ message: "Order not found" });

    const order = orderResults[0];
    console.log("🧾 Order from DB:", order);

    // 🧍‍♂️ Customer can view their own order
    if (user.role === "customer") {
      console.log("🧍‍♂️ Customer check:", order.user_id, user.id); // ✅ fixed
      if (parseInt(order.user_id) !== parseInt(user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const itemsSql = `
        SELECT oi.*, p.name AS product_name 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `;

      return db.query(itemsSql, [orderId], (err, items) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ order, items });
      });
    }

    // 🧑‍💼 Seller can view order if it contains their product
    if (user.role === "seller") {
      const productSql = `
        SELECT DISTINCT p.seller_id 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `;

      return db.query(productSql, [orderId], (err, productResults) => {
        if (err) return res.status(500).json({ message: err.message });

        const sellerIds = productResults.map((p) => p.seller_id);
        console.log("👨‍💼 Seller check:", sellerIds, user.id);

        if (!sellerIds.includes(user.id)) {
          return res.status(403).json({ message: "Access denied" });
        }

        const itemsSql = `
          SELECT oi.*, p.name AS product_name 
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ?
        `;

        db.query(itemsSql, [orderId], (err, items) => {
          if (err) return res.status(500).json({ message: err.message });
          res.status(200).json({ order, items });
        });
      });
    }

    // 👑 Admin can view any order
    if (user.role === "admin") {
      const itemsSql = `
        SELECT oi.*, p.name AS product_name 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `;

      return db.query(itemsSql, [orderId], (err, items) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ order, items });
      });
    }

    // 🚫 Default: Role not allowed
    return res.status(403).json({ message: "Access denied" });
  });
});

module.exports = router;
