const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// ➕ Setup Multer Storage for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 🔒 Add a product — Only sellers allowed
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;

  if (user.role !== "seller") {
    return res.status(403).json({ message: "Only sellers can add products" });
  }

  const { name, description, sub_sub_subcategory_id, quantity } = req.body;
  const baseUrl = req.protocol + "://" + req.get("host");
  const imageFilename = req.file
    ? `${baseUrl}/uploads/${req.file.filename}`
    : null;
  const price = parseFloat(req.body.price);
  const subSubSubcatId =
    sub_sub_subcategory_id && sub_sub_subcategory_id.trim() !== ""
      ? parseInt(sub_sub_subcategory_id)
      : null;
  const qty = quantity ? parseInt(quantity) : 0;

  if (!name || !price || !subSubSubcatId || !imageFilename || isNaN(qty)) {
    return res.status(400).json({
      message:
        "Name, Price, Quantity, Sub-Sub-Subcategory ID, and Image are required",
    });
  }

  const sql = `
    INSERT INTO products (name, description, price, quantity, sub_sub_subcategory_id, image_url, seller_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      description || "",
      price,
      qty,
      subSubSubcatId,
      imageFilename,
      user.id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(201).json({
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
});
router.get("/allProducts", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can access all products" });
  }

  const sql = "SELECT * FROM products ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({
      total: results.length,
      products: results,
    });
  });
});
// 🧾 Get products added by the current seller
router.get("/my-products", verifyToken, (req, res) => {
  const user = req.user;

  if (user.role !== "seller") {
    return res
      .status(403)
      .json({ message: "Only sellers can view their products" });
  }

  const sql = `SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC`;

  db.query(sql, [user.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({
      sellerId: user.id,
      products: results,
    });
  });
});

// 🌐 Get products with Search, Sort, Pagination, and Filters
router.get("/", (req, res) => {
  const {
    search,
    sub_sub_subcategory,
    minPrice = 0,
    maxPrice = 999999,
    sortBy = "id",
    sortOrder = "asc",
    limit = 10,
    page = 1,
  } = req.query;

  const validSortFields = ["price", "name", "id"];
  const validSortOrder = ["asc", "desc"];

  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  const order = validSortOrder.includes(sortOrder.toLowerCase())
    ? sortOrder
    : "ASC";

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let baseSql = "SELECT * FROM products";
  let countSql = "SELECT COUNT(*) as total FROM products";
  let conditions = [];
  let values = [];

  if (search) {
    conditions.push("(name LIKE ? OR description LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }

  if (sub_sub_subcategory) {
    conditions.push("sub_sub_subcategory_id = ?");
    values.push(sub_sub_subcategory);
  }

  conditions.push("price BETWEEN ? AND ?");
  values.push(minPrice, maxPrice);

  if (conditions.length > 0) {
    const whereClause = " WHERE " + conditions.join(" AND ");
    baseSql += whereClause;
    countSql += whereClause;
  }

  baseSql += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), offset);

  db.query(countSql, values.slice(0, -2), (err, countResult) => {
    if (err) return res.status(500).json({ message: err.message });

    const total = countResult[0].total;

    db.query(baseSql, values, (err, results) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        products: results,
      });
    });
  });
});

// 🌐 Get product by ID (Public)
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(results[0]);
  });
});

// ✏️ Update product (Only owner or admin)
router.put("/:id", verifyToken, upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, description, sub_sub_subcategory_id, quantity } = req.body;
  const user = req.user;
  const baseUrl = req.protocol + "://" + req.get("host");
  const imageFilename = req.file
    ? `${baseUrl}/uploads/${req.file.filename}`
    : null;
  const price = parseFloat(req.body.price);
  const subSubSubcatId =
    sub_sub_subcategory_id && sub_sub_subcategory_id.trim() !== ""
      ? parseInt(sub_sub_subcategory_id)
      : null;
  const qty = quantity ? parseInt(quantity) : 0;

  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const product = results[0];

    if (user.role !== "admin" && user.id !== product.seller_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this product" });
    }

    const image_url = imageFilename || product.image_url;

    const updateSQL = `
      UPDATE products
      SET name = ?, description = ?, price = ?, quantity = ?, sub_sub_subcategory_id = ?, image_url = ?
      WHERE id = ?
    `;

    db.query(
      updateSQL,
      [name, description, price, qty, subSubSubcatId, image_url, id],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });

        return res
          .status(200)
          .json({ message: "Product updated successfully" });
      }
    );
  });
});

// ❌ Delete product by ID
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM cart WHERE product_id = ?", [id], (cartErr) => {
    if (cartErr) {
      return res.status(500).json({
        message: "Failed to delete from cart",
        error: cartErr.message,
      });
    }

    db.query(
      "DELETE FROM order_items WHERE product_id = ?",
      [id],
      (orderErr) => {
        if (orderErr) {
          return res.status(500).json({
            message: "Failed to delete from order_items",
            error: orderErr.message,
          });
        }

        db.query(
          "DELETE FROM products WHERE id = ?",
          [id],
          (productErr, result) => {
            if (productErr) {
              return res.status(500).json({
                message: "Failed to delete product",
                error: productErr.message,
              });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Product not found" });
            }

            return res
              .status(200)
              .json({ message: "Product deleted successfully" });
          }
        );
      }
    );
  });
});

module.exports = router;
