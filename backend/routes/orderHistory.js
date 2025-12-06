const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🌍 View Order History (Customer, Seller, Admin)
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  // Base SELECT with address + preview image from first product
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

      -- 👇 sample image from products in this order
      MIN(p.image_url) AS preview_image
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
  `;

  let sql = "";
  let params = [];

  if (user.role === "customer") {
    // 🧑‍💻 Customer: only their own orders
    sql = `
      ${baseSelect}
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    params = [user.id];

  } else if (user.role === "seller") {
    // 🛒 Seller: orders that contain their products
    sql = `
      ${baseSelect}
      WHERE p.seller_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    params = [user.id];

  } else if (user.role === "admin") {
    // 👑 Admin: all orders
    sql = `
      ${baseSelect}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    params = [];

  } else {
    return res.status(403).json({ message: "Unauthorized role" });
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json(results);
  });
});

module.exports = router;
