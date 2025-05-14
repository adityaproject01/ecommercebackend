const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, (req, res) => {
  const user = req.user;
  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can add to cart" });
  }
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  // Check required fields
  if (
    !full_name ||
    !phone ||
    !address_line1 ||
    !city ||
    !state ||
    !postal_code ||
    !country
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  // SQL Query for inserting address into the database
  const sql = `
    INSERT INTO address 
    (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Executing the query with user_id from the verified token
  db.query(
    sql,
    [
      user.id, // User ID comes from the token
      full_name,
      phone,
      address_line1,
      address_line2 || "", // If address_line2 is not provided, set it to an empty string
      city,
      state,
      postal_code,
      country,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(201).json({
        message: "Address added successfully",
        addressId: result.insertId,
        data: {
          user_id: user.id, // Return user_id in response as well
          full_name,
          phone,
          address_line1,
          address_line2: address_line2 || "", // Return address_line2 as an empty string if not provided
          city,
          state,
          postal_code,
          country,
        },
      });
    }
  );
});

// 📋 READ: Get All Addresses for Logged-in User (GET /address)
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  const sql = "SELECT * FROM address WHERE user_id = ?";
  db.query(sql, [user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({ addresses: results });
  });
});

// ✏️ UPDATE: Update an Address (PUT /address/:id)
router.put("/:id", verifyToken, (req, res) => {
  const user = req.user;
  const addressId = req.params.id;
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  // Check required fields
  if (
    !full_name ||
    !phone ||
    !address_line1 ||
    !city ||
    !state ||
    !postal_code ||
    !country
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  // SQL Query to update the address
  const sql = `
    UPDATE address SET 
      full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, 
      city = ?, state = ?, postal_code = ?, country = ?
    WHERE id = ? AND user_id = ?
  `;

  // Executing the update query
  db.query(
    sql,
    [
      full_name,
      phone,
      address_line1,
      address_line2 || "", // If address_line2 is not provided, set it to an empty string
      city,
      state,
      postal_code,
      country,
      addressId,
      user.id, // Ensure the user_id is part of the query
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Address not found or unauthorized" });
      }

      res.status(200).json({ message: "Address updated successfully" });
    }
  );
});

// ❌ DELETE: Delete an Address (DELETE /address/:id)
router.delete("/:id", verifyToken, (req, res) => {
  const user = req.user;
  const addressId = req.params.id;

  // SQL Query to delete the address
  const sql = "DELETE FROM address WHERE id = ? AND user_id = ?";

  // Executing the delete query
  db.query(sql, [addressId, user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  });
});

module.exports = router;
