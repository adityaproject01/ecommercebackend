//backend/middleware/authmiddleware
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { verifyToken };
