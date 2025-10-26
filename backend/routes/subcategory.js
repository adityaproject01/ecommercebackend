const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const uploadToCloudinary = require("../middleware/uploadCloudinary");


// ➕ Create Subcategory (Admin only)
router.post("/add", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const { name } = req.body;

  const category_id = parseInt(req.body.category_id);
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can add subcategories" });
  }

  if (!name || !category_id || !req.file) {
    return res
      .status(400)
      .json({ message: "Name, category ID, and image are required" });
  }
  // const baseUrl = req.protocol + "://" + req.get("host");
  // const baseUrl = "https://ecommercebackend-87gs.onrender.com/";
  const image_url = req.file ? req.file.path : null; 
  const sql =
    "INSERT INTO subcategories (name, category_id, image_url) VALUES (?, ?, ?)";
  db.query(sql, [name, category_id, image_url], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(201).json({
      message: "Subcategory created successfully",
      subcategoryId: result.insertId,
    });
  });
});

// 📝 Update Subcategory (Admin only)
router.put("/:id", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const subcategoryId = req.params.id;
  const { name, category_id } = req.body;
  // const baseUrl = req.protocol + "://" + req.get("host");
  // const baseUrl = "https://ecommercebackend-87gs.onrender.com/";

  const image_url = req.file ? req.file.path : null;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can update subcategories" });
  }

  if (!name || !category_id) {
    return res
      .status(400)
      .json({ message: "Name and category ID are required" });
  }

  const sql = `
    UPDATE subcategories 
    SET name = ?, category_id = ?, image_url = COALESCE(?, image_url)
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, category_id, image_url, subcategoryId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      res.status(200).json({ message: "Subcategory updated successfully" });
    }
  );
});

// ❌ Delete Subcategory (Admin only)
router.delete("/:id", verifyToken, (req, res) => {
  const user = req.user;
  const subcategoryId = req.params.id;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can delete subcategories" });
  }

  const sql = "DELETE FROM subcategories WHERE id = ?";
  db.query(sql, [subcategoryId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({ message: "Subcategory deleted successfully" });
  });
});

// 🌍 View All Subcategories (Available to everyone)
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sub.id AS subcategory_id,
      sub.name AS subcategory_name,
      sub.image_url,
      cat.id AS category_id,
      cat.name AS category_name
    FROM subcategories sub
    JOIN categories cat ON sub.category_id = cat.id
    ORDER BY sub.name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json(results);
  });
});

// 📦 Get Subcategories by Category ID (For sellers/customers)
router.get("/category/:category_id", (req, res) => {
  const categoryId = req.params.category_id;
  const sql = `
    SELECT 
      id AS subcategory_id, 
      name AS subcategory_name, 
      image_url,
      category_id
    FROM subcategories 
    WHERE category_id = ?
    ORDER BY name ASC
  `;
  db.query(sql, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json(results);
  });
});

// 📍 Get Subcategory by ID (For detail view)
router.get("/:id", (req, res) => {
  const subcategoryId = req.params.id;
  const sql = `
    SELECT 
      sub.id AS subcategory_id,
      sub.name AS subcategory_name,
      sub.image_url,
      cat.id AS category_id,
      cat.name AS category_name
    FROM subcategories sub
    JOIN categories cat ON sub.category_id = cat.id
    WHERE sub.id = ?
  `;
  db.query(sql, [subcategoryId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = router;
