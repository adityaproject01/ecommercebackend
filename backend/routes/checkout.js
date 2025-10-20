const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, (req, res) => {
  const userId = req.user.id;

  // Step 1: Get cart items
  const getCartQuery = `
    SELECT c.product_id, c.quantity, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(getCartQuery, [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ message: err.message });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Step 2: Calculate total price
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Step 3: Insert into orders table
    const insertOrderQuery = 'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)';
    db.query(insertOrderQuery, [userId, total, 'pending'], (err, orderResult) => {
      if (err) return res.status(500).json({ message: err.message });

      const orderId = orderResult.insertId;

      // Step 4: Insert into order_items table
      const orderItems = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
      const insertOrderItemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;

      db.query(insertOrderItemsQuery, [orderItems], (err, itemResult) => {
        if (err) return res.status(500).json({ message: err.message });

        // Step 5: Clear cart
        const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';
        db.query(clearCartQuery, [userId], (err) => {
          if (err) return res.status(500).json({ message: err.message });

          res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId,
            totalAmount: total
          });
        });
      });
    });
  });
});

module.exports = router;
