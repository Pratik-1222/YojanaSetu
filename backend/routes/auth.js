const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { run, get, all } = require("../db");
const { authMiddleware, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// 1. User Registration
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Please provide email, password, and name." });
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === "admin@yojanasetu.gov.in" ? "admin" : "user";
    const result = await run(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, name, role]
    );

    const token = jwt.sign({ id: result.id, email, role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, name, email, role, profile: {} });
  } catch (err) {
    res.status(500).json({ error: "Database error during registration." });
  }
});

// 2. User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password." });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password credentials." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password credentials." });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: JSON.parse(user.profile || "{}")
    });
  } catch (err) {
    res.status(500).json({ error: "Database error during login." });
  }
});

// 3. Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await get("SELECT name, email, role, profile FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      profile: JSON.parse(user.profile || "{}")
    });
  } catch (err) {
    res.status(500).json({ error: "Database error retrieving profile." });
  }
});

// 4. Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: "Profile details missing." });
  }

  try {
    await run(
      "UPDATE users SET profile = ? WHERE id = ?",
      [JSON.stringify(profile), req.user.id]
    );
    res.json({ status: "ok", profile });
  } catch (err) {
    res.status(500).json({ error: "Database error updating profile." });
  }
});

// 5. Get Saved Schemes List
router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const rows = await all("SELECT scheme_id FROM saved_schemes WHERE user_id = ?", [req.user.id]);
    const ids = rows.map((r) => r.scheme_id);
    res.json(ids);
  } catch (err) {
    res.status(500).json({ error: "Database error loading bookmarks." });
  }
});

// 6. Toggle Bookmark Scheme ID
router.post("/saved", authMiddleware, async (req, res) => {
  const { schemeId } = req.body;
  if (!schemeId) {
    return res.status(400).json({ error: "Scheme ID missing." });
  }

  try {
    const existing = await get(
      "SELECT id FROM saved_schemes WHERE user_id = ? AND scheme_id = ?",
      [req.user.id, schemeId]
    );

    if (existing) {
      // Unsave/delete
      await run("DELETE FROM saved_schemes WHERE id = ?", [existing.id]);
      res.json({ saved: false });
    } else {
      // Save/insert
      await run(
        "INSERT INTO saved_schemes (user_id, scheme_id) VALUES (?, ?)",
        [req.user.id, schemeId]
      );
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error bookmarking scheme." });
  }
});

module.exports = router;
