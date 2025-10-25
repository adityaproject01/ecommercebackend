const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const uploadToCloudinary = require("../middleware/uploadCloudinary");

// ➕ Add Sub-Subcategory (Admin only)
router.post("/add", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const { name } = req.body;
  const subcategory_id = parseInt(req.body.subcategory_id);

  if (user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Only admin can add sub-subcategories" });
  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!subcategory_id)
    return res.status(400).json({ message: "subcategory ID is required" });
  if (!req.file) return res.status(400).json({ message: "Image is required" });

  const image_url = req.file.path; // Cloudinary URL

  const sql = `INSERT INTO sub_subcategories (name, subcategory_id, image_url) VALUES (?, ?, ?)`;
  db.query(sql, [name, subcategory_id, image_url], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(201).json({
      message: "Sub-subcategory created successfully",
      subSubcategoryId: result.insertId,
      image_url,
    });
  });
});

// 📝 Update Sub-Subcategory (Admin only)
router.put("/:id", verifyToken, uploadToCloudinary("image"), (req, res) => {
  const user = req.user;
  const { name, subcategory_id } = req.body;
  const subSubcategoryId = req.params.id;

  if (user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Only admin can update sub-subcategories" });
  if (!name || !subcategory_id)
    return res
      .status(400)
      .json({ message: "Name and subcategory ID are required" });

  const image_url = req.file ? req.file.path : null; // Cloudinary URL

  const sql = `UPDATE sub_subcategories SET name = ?, subcategory_id = ?, image_url = COALESCE(?, image_url) WHERE id = ?`;
  db.query(
    sql,
    [name, subcategory_id, image_url, subSubcategoryId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Sub-subcategory not found" });

      res
        .status(200)
        .json({ message: "Sub-subcategory updated successfully", image_url });
    }
  );
});

// ❌ Delete Sub-Subcategory (Admin only)
router.delete("/:id", verifyToken, (req, res) => {
  const user = req.user;
  const id = req.params.id;

  if (user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Only admin can delete sub-subcategories" });

  const sql = "DELETE FROM sub_subcategories WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Sub-subcategory not found" });

    res.status(200).json({ message: "Sub-subcategory deleted successfully" });
  });
});

// 🌍 View All Sub-Subcategories
router.get("/", (req, res) => {
  const sql = `
    SELECT ssc.id AS subsub_id, ssc.name AS subsub_name, ssc.image_url,
           sc.id AS subcategory_id, sc.name AS subcategory_name
    FROM sub_subcategories ssc
    JOIN subcategories sc ON ssc.subcategory_id = sc.id
    ORDER BY ssc.name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// 🔍 Get Sub-Subcategory by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT ssc.id AS subsub_id, ssc.name AS subsub_name, ssc.image_url,
           sc.id AS subcategory_id, sc.name AS subcategory_name
    FROM sub_subcategories ssc
    JOIN subcategories sc ON ssc.subcategory_id = sc.id
    WHERE ssc.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Sub-subcategory not found" });
    res.status(200).json(results[0]);
  });
});

// 📦 Get Sub-Subcategories by Subcategory ID
router.get("/subcategory/:subcategory_id", (req, res) => {
  const subcategoryId = req.params.subcategory_id;
  const sql = `
    SELECT id AS subsub_id, name AS subsub_name, image_url, subcategory_id
    FROM sub_subcategories
    WHERE subcategory_id = ?
    ORDER BY name ASC
  `;
  db.query(sql, [subcategoryId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

module.exports = router;
