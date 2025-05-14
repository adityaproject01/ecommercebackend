//backend/routes/cart.js

const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Add product to cart
router.post("/add", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can add to cart" });
  }

  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required" });
  }

  // Check if product already exists in cart
  const checkSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(checkSql, [user.id, product_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length > 0) {
      // If exists, update quantity
      const newQty = results[0].quantity + quantity;
      const updateSql =
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
      db.query(updateSql, [newQty, user.id, product_id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(200).json({ message: "Cart updated successfully" });
      });
    } else {
      // If not, insert new row
      const insertSql =
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
      db.query(insertSql, [user.id, product_id, quantity], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(201).json({ message: "Product added to cart" });
      });
    }
  });
});

// 📦 Get all cart items for logged-in customer
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can view cart" });
  }

  const sql = `
    SELECT c.id as cart_id, p.*, c.quantity 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `;

  db.query(sql, [user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// ✏️ Update quantity of a product in cart
router.put("/update/:product_id", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Only customers can update cart items" });
  }

  const { product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const sql = `
    UPDATE cart 
    SET quantity = ? 
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(sql, [quantity, user.id, product_id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Cart item updated successfully" });
  });
});
// ❌ Clear all items in the logged-in customer's cart
router.delete("/clear", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Only customers can clear the cart" });
  }

  const sql = "DELETE FROM cart WHERE user_id = ?";

  db.query(sql, [user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({ message: "Cart cleared successfully" });
  });
});

// Remove an item from cart
router.delete("/remove/:product_id", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Only customers can remove items from cart" });
  }

  const { product_id } = req.params;

  const sql = `
    DELETE FROM cart 
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(sql, [user.id, product_id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  });
});

module.exports = router;
