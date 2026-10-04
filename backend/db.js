const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "yojanasetu.sqlite");
const db = new sqlite3.Database(DB_PATH);

// Helper helper function to run queries with promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialise and seed database structure
// Initialise and seed database structure
async function initDb() {
  // 1. Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      profile TEXT DEFAULT '{}'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT NOT NULL,
      baseMatch INTEGER NOT NULL,
      benefit TEXT NOT NULL,
      deadline TEXT NOT NULL,
      eligibility TEXT NOT NULL, -- JSON array of strings
      documents TEXT NOT NULL, -- JSON array of strings
      steps TEXT NOT NULL, -- JSON array of strings
      state TEXT NOT NULL DEFAULT 'Central',
      income_limit INTEGER DEFAULT 0,
      age_limit INTEGER DEFAULT 0,
      official_link TEXT,
      last_updated TEXT,
      status TEXT DEFAULT 'active'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS saved_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scheme_id TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, scheme_id)
    )
  `);

  // Run migrations in case database already exists
  try {
    await run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN state TEXT NOT NULL DEFAULT 'Central'");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN income_limit INTEGER DEFAULT 0");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN age_limit INTEGER DEFAULT 0");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN official_link TEXT");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN last_updated TEXT");
  } catch (e) {}
  try {
    await run("ALTER TABLE schemes ADD COLUMN status TEXT DEFAULT 'active'");
  } catch (e) {}

  // 2. Check if schemes table is empty, and seed if so
  const countRow = await get("SELECT COUNT(*) as count FROM schemes");
  if (countRow.count === 0) {
    console.log("Seeding schemes table into SQLite database...");
    const { SCHEMES } = require("./data/schemes");
    for (const s of SCHEMES) {
      await run(
        `INSERT OR REPLACE INTO schemes (id, name, dept, category, tagline, baseMatch, benefit, deadline, eligibility, documents, steps, state, income_limit, age_limit, official_link, last_updated, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.name,
          s.dept,
          s.category,
          s.tagline,
          s.baseMatch,
          s.benefit,
          s.deadline,
          JSON.stringify(s.eligibility),
          JSON.stringify(s.documents),
          JSON.stringify(s.steps),
          s.state || "Central",
          s.income_limit || 0,
          s.age_limit || 0,
          s.official_link || "",
          s.last_updated || "",
          s.status || "active"
        ]
      );
    }
    console.log("Seeding completed successfully.");
  }
}

module.exports = {
  db,
  initDb,
  run,
  get,
  all
};
