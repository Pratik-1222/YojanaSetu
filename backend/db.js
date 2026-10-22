
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { SCHEMES } = require("./data/schemes");

const DB_PATH = path.join(__dirname, "yojanasetu.sqlite");
const db = new sqlite3.Database(DB_PATH);

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

async function initDb() {
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
      eligibility TEXT NOT NULL,
      documents TEXT NOT NULL,
      steps TEXT NOT NULL,
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

  const migrations = [
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
    "ALTER TABLE schemes ADD COLUMN state TEXT NOT NULL DEFAULT 'Central'",
    "ALTER TABLE schemes ADD COLUMN income_limit INTEGER DEFAULT 0",
    "ALTER TABLE schemes ADD COLUMN age_limit INTEGER DEFAULT 0",
    "ALTER TABLE schemes ADD COLUMN official_link TEXT",
    "ALTER TABLE schemes ADD COLUMN last_updated TEXT",
    "ALTER TABLE schemes ADD COLUMN status TEXT DEFAULT 'active'"
  ];

  for (const sql of migrations) {
    try {
      await run(sql);
    } catch (error) {
      if (!error.message.includes("duplicate column name")) {
        throw error;
      }
    }
  }

  let inserted = 0;

  for (const s of SCHEMES) {
    const result = await run(
      `INSERT OR IGNORE INTO schemes (
        id, name, dept, category, tagline, baseMatch, benefit,
        deadline, eligibility, documents, steps, state,
        income_limit, age_limit, official_link, last_updated, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.name,
        s.dept,
        s.category,
        s.tagline,
        s.baseMatch,
        s.benefit,
        s.deadline,
        JSON.stringify(s.eligibility || []),
        JSON.stringify(s.documents || []),
        JSON.stringify(s.steps || []),
        s.state || "Central",
        s.income_limit ?? 0,
        s.age_limit ?? 0,
        s.official_link || "",
        s.last_updated || "",
        s.status || "active"
      ]
    );

    inserted += result.changes;
  }

  const countRow = await get("SELECT COUNT(*) AS count FROM schemes");
  const educationSchemes = await all(
    "SELECT id, name, category, status FROM schemes WHERE category = ?",
    ["education"]
  );

  console.log("YojanaSetu database initialized.");
  console.log(`New schemes inserted: ${inserted}`);
  console.log(`Total schemes in database: ${countRow.count}`);
  console.log("Education schemes:", JSON.stringify(educationSchemes));
}

module.exports = {
  db,
  initDb,
  run,
  get,
  all
};
