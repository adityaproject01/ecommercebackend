const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🌍 View Order History (Customer, Seller, Admin)
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  let sql;

  if (user.role === "customer") {
    sql = "SELECT * FROM orders WHERE user_id = ?";
    db.query(sql, [user.id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json(results);
    });
  }

  if (user.role === "seller") {
    sql = `
      SELECT DISTINCT o.* 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `;
    db.query(sql, [user.id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json(results);
    });
  }

  if (user.role === "admin") {
    sql = "SELECT * FROM orders";
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json(results);
    });
  }
});

module.exports = router;
