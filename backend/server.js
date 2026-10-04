require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const schemesRouter = require("./routes/schemes");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local dev and Vercel domains
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "YojanaSetu API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/schemes", schemesRouter);
app.use("/api/auth", authRouter);

// Start Server and Initialise SQLite DB
app.listen(PORT, async () => {
  console.log(`YojanaSetu API running on port ${PORT}`);
  try {
    await initDb();
    console.log("SQLite database initialised successfully.");
    
    // Trigger crawler scan 10 seconds after server startup
    setTimeout(async () => {
      const { scrapeAndExtract } = require("./utils/crawlers");
      await scrapeAndExtract().catch(err => console.error("Periodic crawler trigger failed:", err));
    }, 10000);
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
});
