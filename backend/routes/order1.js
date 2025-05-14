const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// ✅ Route: Place Order (Checkout)
router.post('/checkout', verifyToken, (req, res) => {
  const user = req.user;

  // 🔒 Only customers can place orders
  if (user.role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can place orders' });
  }

  const {
    address_id,
    payment_method = 'COD'
  } = req.body;

  if (!address_id) {
    return res.status(400).json({ message: 'Address is required for checkout' });
  }

  // 1. Fetch items from cart
  const getCartSql = `
    SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(getCartSql, [user.id], (err, cartItems) => {
    if (err) return res.status(500).json({ message: err.message });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Insert into orders table
    const orderSql = `
      INSERT INTO orders (user_id, address_id, total_amount, payment_method, status, order_date)
      VALUES (?, ?, ?, ?, 'Processing', NOW())
    `;

    db.query(orderSql, [user.id, address_id, total, payment_method], (err, orderResult) => {
      if (err) return res.status(500).json({ message: err.message });

      const orderId = orderResult.insertId;

      // 3. Insert into order_items table
      const orderItemsSql = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;

      const values = cartItems.map(item => [
        orderId,
        item.product_id,
        item.quantity,
        item.price
      ]);

      db.query(orderItemsSql, [values], (err) => {
        if (err) return res.status(500).json({ message: err.message });

        // 4. Clear the cart
        db.query('DELETE FROM cart WHERE user_id = ?', [user.id]);

        res.status(201).json({ message: 'Order placed successfully', orderId });
      });
    });
  });
});

// ✅ Route: View My Orders (for Customer)
router.get('/my-orders', verifyToken, (req, res) => {
  const user = req.user;

  const sql = `
    SELECT o.id AS order_id, o.total_amount, o.status, o.order_date,
           p.name AS product_name, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    const orders = {};

    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          order_date: row.order_date,
          items: []
        };
      }
      orders[row.order_id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });
    });

    res.json(Object.values(orders));
  });
});

// ✅ Route: Admin - View All Orders
router.get('/all-orders', verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const sql = `
    SELECT o.id AS order_id, u.username, o.total_amount, o.status, o.order_date,
           p.name AS product_name, oi.quantity, oi.price
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    ORDER BY o.order_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    const orders = {};

    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          username: row.username,
          total_amount: row.total_amount,
          status: row.status,
          order_date: row.order_date,
          items: []
        };
      }
      orders[row.order_id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });
    });

    res.json(Object.values(orders));
  });
});

module.exports = router;
