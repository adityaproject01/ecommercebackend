const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🌍 View Order History (Customer, Seller, Admin)
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  // Base SELECT with address + preview image via subquery
  const baseSelect = `
    SELECT 
      o.*,
      a.full_name     AS address_full_name,
      a.phone         AS address_phone,
      a.address_line1 AS address_line1,
      a.address_line2 AS address_line2,
      a.city          AS address_city,
      a.state         AS address_state,
      a.postal_code   AS address_postal_code,
      a.country       AS address_country,

      -- 👇 one sample image from products in this order
      (
        SELECT p.product_image
        FROM order_items oi2
        JOIN products p ON oi2.product_id = p.id
        WHERE oi2.order_id = o.id
        LIMIT 1
      ) AS preview_image
    FROM orders o
    LEFT JOIN address a ON o.address_id = a.id
  `;

  let sql = "";
  let params = [];

  if (user.role === "customer") {
    // 🧑‍💻 Customer: only their own orders
    sql = `
      ${baseSelect}
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    params = [user.id];

  } else if (user.role === "seller") {
    // 🛒 Seller: orders that contain *their* products
    sql = `
      ${baseSelect}
      WHERE EXISTS (
        SELECT 1
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = o.id
          AND p.seller_id = ?
      )
      ORDER BY o.created_at DESC
    `;
    params = [user.id];

  } else if (user.role === "admin") {
    // 👑 Admin: all orders
    sql = `
      ${baseSelect}
      ORDER BY o.created_at DESC
    `;
    params = [];

  } else {
    return res.status(403).json({ message: "Unauthorized role" });
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Order history SQL error:", err); // 👈 check this in terminal
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
