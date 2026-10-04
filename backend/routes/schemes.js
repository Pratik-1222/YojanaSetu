const express = require("express");
const { all, get } = require("../db");
const { CATEGORIES } = require("../data/schemes");

const router = express.Router();

// GET /api/schemes - list all schemes (optionally filter by category)
router.get("/", async (req, res) => {
  const { category, includePending } = req.query;
  try {
    let rows;
    if (category && category !== "all") {
      rows = includePending === "true"
        ? await all("SELECT * FROM schemes WHERE category = ?", [category])
        : await all("SELECT * FROM schemes WHERE category = ? AND status = 'active'", [category]);
    } else {
      rows = includePending === "true"
        ? await all("SELECT * FROM schemes")
        : await all("SELECT * FROM schemes WHERE status = 'active'");
    }

    const parsed = rows.map((r) => ({
      ...r,
      match: r.baseMatch,
      eligibility: JSON.parse(r.eligibility || "[]"),
      documents: JSON.parse(r.documents || "[]"),
      steps: JSON.parse(r.steps || "[]")
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Database error retrieving schemes." });
  }
});

// GET /api/schemes/categories - category metadata
router.get("/categories", (req, res) => {
  res.json(CATEGORIES);
});

// GET /api/schemes/:id - single scheme detail
router.get("/:id", async (req, res) => {
  try {
    const r = await get("SELECT * FROM schemes WHERE id = ?", [req.params.id]);
    if (!r) return res.status(404).json({ error: "Scheme not found" });

    res.json({
      ...r,
      match: r.baseMatch,
      eligibility: JSON.parse(r.eligibility || "[]"),
      documents: JSON.parse(r.documents || "[]"),
      steps: JSON.parse(r.steps || "[]")
    });
  } catch (err) {
    res.status(500).json({ error: "Database error retrieving scheme details." });
  }
});

// Rule-based matching scorer
function computeMatch(profile, scheme) {
  let score = scheme.baseMatch;

  const income = profile.income || "";
  const occupation = (profile.occupation || "").toLowerCase();
  const education = (profile.education || "").toLowerCase();
  const gender = (profile.gender || "").toLowerCase();
  const category = (profile.category || "").toLowerCase();
  const disability = (profile.disability || "").toLowerCase();

  const lowIncome = income.includes("Below") || income.includes("1,00,000") || income.includes("2,50,000");

  if (scheme.category === "education" && (occupation.includes("student") || education.includes("undergraduate") || education.includes("postgraduate"))) score += 6;
  if (scheme.category === "education" && lowIncome) score += 3;

  if (scheme.category === "agriculture" && occupation.includes("farmer")) score += 8;

  if (scheme.category === "business" && (occupation.includes("self-employed") || occupation.includes("business"))) score += 6;
  if (scheme.id === "stand-up-india" && (gender === "female" || category === "sc" || category === "st")) score += 10;

  if (scheme.category === "women" && gender === "female") score += 8;

  if (scheme.category === "health" && lowIncome) score += 5;
  
  if (scheme.category === "disability" && disability === "yes") score += 20;

  return Math.max(20, Math.min(99, Math.round(score)));
}

// POST /api/schemes/match - personalised ranking based on onboarding profile
router.post("/match", express.json(), async (req, res) => {
  const profile = req.body || {};
  try {
    const rows = await all("SELECT * FROM schemes WHERE status = 'active'");
    const parsed = rows.map((r) => ({
      ...r,
      eligibility: JSON.parse(r.eligibility || "[]"),
      documents: JSON.parse(r.documents || "[]"),
      steps: JSON.parse(r.steps || "[]")
    }));

    const ranked = parsed
      .map((s) => ({ ...s, match: computeMatch(profile, s) }))
      .sort((a, b) => b.match - a.match);

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: "Database error running eligibility evaluation matching." });
  }
});

// POST /api/schemes/assistant - RAG query
router.post("/assistant", express.json(), async (req, res) => {
  const { message, profile } = req.body;
  const { queryAssistant } = require("../utils/gemini");
  
  try {
    const rows = await all("SELECT * FROM schemes");
    const parsedSchemes = rows.map((r) => ({
      ...r,
      eligibility: JSON.parse(r.eligibility || "[]"),
      documents: JSON.parse(r.documents || "[]"),
      steps: JSON.parse(r.steps || "[]")
    }));

    const reply = await queryAssistant(message, profile, parsedSchemes);
    
    // Filter matching scheme details referenced in reply
    const matched = parsedSchemes.filter((s) => {
      return reply.includes(s.name) || reply.toLowerCase().includes(s.id.toLowerCase());
    });

    res.json({ reply, schemes: matched });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate AI assistant reply." });
  }
});

// PUT /api/schemes/:id/verify - Approve a pending scheme
router.put("/:id/verify", express.json(), async (req, res) => {
  try {
    const { status } = req.body;
    await run(
      "UPDATE schemes SET status = ?, last_updated = ? WHERE id = ?",
      [status || "active", new Date().toISOString().split("T")[0], req.params.id]
    );
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify scheme." });
  }
});

// POST /api/schemes - Create a new scheme manually (Admin CMS)
router.post("/", express.json(), async (req, res) => {
  const s = req.body || {};
  if (!s.id || !s.name || !s.dept || !s.category || !s.benefit || !s.deadline) {
    return res.status(400).json({ error: "Missing required scheme properties." });
  }
  try {
    await run(
      `INSERT OR REPLACE INTO schemes (id, name, dept, category, tagline, baseMatch, benefit, deadline, eligibility, documents, steps, state, official_link, last_updated, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.name,
        s.dept,
        s.category,
        s.tagline || "",
        s.baseMatch || 70,
        s.benefit,
        s.deadline,
        JSON.stringify(s.eligibility || []),
        JSON.stringify(s.documents || []),
        JSON.stringify(s.steps || []),
        s.state || "Central",
        s.official_link || "",
        new Date().toISOString().split("T")[0],
        s.status || "active"
      ]
    );
    res.status(201).json({ status: "ok", scheme: s });
  } catch (err) {
    res.status(500).json({ error: "Failed to create scheme." });
  }
});

module.exports = router;
