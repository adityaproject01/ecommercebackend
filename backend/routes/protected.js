const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Update user profile (protected route)
router.put('/profile', verifyToken, (req, res) => {
  const userId = req.user.id;  // Get the user's ID from the token
  const { name, password } = req.body;

  // Ensure that at least one field is provided to update
  if (!name && !password) {
    return res.status(400).json({ message: 'Name or password required to update' });
  }

  const fields = [];
  const values = [];

  // Add name field to the query if provided
  if (name) {
    fields.push('name = ?');
    values.push(name);
  }

  // If password is provided, hash it and add it to the query
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    fields.push('password = ?');
    values.push(hashedPassword);
  }

  values.push(userId);  // Add userId at the end to use in the WHERE clause

  // SQL query for updating the user's profile
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

  // Perform the database query
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    // Respond with success message
    res.json({ message: 'Profile updated successfully' });
  });
});

// You can add more protected routes here

module.exports = router;
