// backend/routes/subSubSubCategory.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const uploadToCloudinary = require("../middleware/uploadCloudinary");

// ✅ Create Sub-Sub-Subcategory
router.post("/add", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const { name = "", subsubcategory_id } = req.body;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can add sub-sub-subcategories" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  const image_url = req.file.path; // Cloudinary URL

  const sql = `
    INSERT INTO sub_sub_subcategories (name, subsubcategory_id, image_url)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, subsubcategory_id, image_url], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(201).json({
      message: "Sub-sub-subcategory created successfully",
      id: result.insertId,
    });
  });
});

// 📝 Update Sub-Sub-Subcategory
router.put("/:id", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const { name = "", subsubcategory_id } = req.body;
  const id = req.params.id;
  const image_url = req.file ? req.file.path : null;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can update sub-sub-subcategories" });
  }

  if (!subsubcategory_id) {
    return res.status(400).json({ message: "Sub-subcategory ID is required" });
  }

  const sql = `
    UPDATE sub_sub_subcategories
    SET name = ?, subsubcategory_id = ?, image_url = COALESCE(?, image_url)
    WHERE id = ?
  `;

  db.query(sql, [name, subsubcategory_id, image_url, id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sub-sub-subcategory not found" });
    }

    res
      .status(200)
      .json({ message: "Sub-sub-subcategory updated successfully" });
  });
});

// ❌ Delete Sub-Sub-Subcategory
router.delete("/:id", verifyToken, (req, res) => {
  const user = req.user;
  const id = req.params.id;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can delete sub-sub-subcategories" });
  }

  const sql = "DELETE FROM sub_sub_subcategories WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sub-sub-subcategory not found" });
    }

    res
      .status(200)
      .json({ message: "Sub-sub-subcategory deleted successfully" });
  });
});

// 🌍 Get All Sub-Sub-Subcategories
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sss.id AS id,
      sss.name AS name,
      sss.image_url,
      ssc.id AS sub_subcategory_id,
      ssc.name AS sub_subcategory_name
    FROM sub_sub_subcategories sss
    JOIN sub_subcategories ssc ON sss.subsubcategory_id = ssc.id
    ORDER BY sss.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// 🔍 Get Sub-Sub-Subcategory by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      sss.id AS id,
      sss.name AS name,
      sss.image_url,
      ssc.id AS sub_subcategory_id,
      ssc.name AS sub_subcategory_name
    FROM sub_sub_subcategories sss
    JOIN sub_subcategories ssc ON sss.subsubcategory_id = ssc.id
    WHERE sss.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Sub-sub-subcategory not found" });
    }

    res.status(200).json(results[0]);
  });
});

// 📦 Get by Sub-Subcategory ID
router.get("/subsubcategory/:subsubcategory_id", (req, res) => {
  const subsubcategoryId = req.params.subsubcategory_id;
  const sql = `
    SELECT id, name, image_url, subsubcategory_id
    FROM sub_sub_subcategories
    WHERE subsubcategory_id = ?
    ORDER BY name ASC
  `;

  db.query(sql, [subsubcategoryId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

module.exports = router;
