const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "yojanasetu_super_secret_key";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No authorization header provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
