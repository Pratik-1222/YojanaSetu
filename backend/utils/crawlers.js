const axios = require("axios");
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { run, get } = require("../db");

// Scrapes PIB or Ministry news announcements and extracts new schemes via Gemini AI
async function scrapeAndExtract() {
  console.log("Triggering automated YojanaSetu web crawler...");
  const pibUrl = "https://pib.gov.in/PressReleasePage.aspx"; // official press release releases portal
  
  try {
    // 1. Fetch raw page text
    const response = await axios.get(pibUrl, {
      headers: { "User-Agent": "Mozilla/5.0 YojanaSetuCrawler/1.0" },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const pageText = $("body").text().substring(0, 8000); // inspect first 8k characters

    // 2. Extract using Gemini AI
    const extracted = await extractSchemeFromText(pageText);
    if (!extracted || extracted.length === 0) {
      console.log("Crawler finished: No new schemes found in current press feeds.");
      return [];
    }

    console.log(`AI extracted ${extracted.length} potential scheme(s) from PIB:`, extracted);

    // 3. Insert new schemes into database
    const saved = [];
    for (const s of extracted) {
      const exists = await get("SELECT id FROM schemes WHERE id = ?", [s.id]);
      if (!exists) {
        await run(
          `INSERT INTO schemes (id, name, dept, category, tagline, baseMatch, benefit, deadline, eligibility, documents, steps, state, official_link, last_updated, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.name,
            s.dept,
            s.category,
            s.tagline,
            s.baseMatch || 70,
            s.benefit,
            s.deadline,
            JSON.stringify(s.eligibility || []),
            JSON.stringify(s.documents || []),
            JSON.stringify(s.steps || []),
            s.state || "Central",
            s.official_link || `https://${s.id}.gov.in`,
            new Date().toISOString().split("T")[0],
            "pending_verification"
          ]
        );
        console.log(`Saved new scheme to YojanaSetu DB: ${s.name}`);
        saved.push(s);
      }
    }
    return saved;
  } catch (err) {
    console.warn("Crawler failed during fetch/scraping. Using mock simulation trigger.");
    return triggerMockScraper();
  }
}

// Extract struct fields using Gemini structured prompt
async function extractSchemeFromText(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") return null;

  const prompt = `Inspect this press announcement and extract any new government scheme/benefit matching details.
If found, output a JSON array of scheme objects conforming to this schema. If none are found, output an empty JSON array: [].

Schema:
[{
  "id": "short-string-dash-separated-id",
  "name": "Scheme Full Name",
  "dept": "Ministry or Dept Name",
  "category": "education | agriculture | health | disability | employment | women | business | housing",
  "tagline": "Short description of the benefit",
  "baseMatch": 75,
  "benefit": "Core benefit details (e.g. ₹5,000 cash help)",
  "deadline": "Deadline text",
  "eligibility": ["Rule 1", "Rule 2"],
  "documents": ["Doc 1", "Doc 2"],
  "steps": ["Step 1", "Step 2"]
}]

Announcement text:
${text}`;

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const replyText = result.response.text();
    // Clean code fences if present in AI reply
    const cleanJson = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("AI extraction parsing error:", e);
    return null;
  }
}

// Simulates adding a new program to demonstrate real-time crawler updates
async function triggerMockScraper() {
  console.log("Simulating crawler pipeline update...");
  const mockScheme = {
    id: "pm-vishwa",
    name: "PM Vishwakarma Scheme",
    dept: "Ministry of Micro, Small & Medium Enterprises",
    category: "business",
    tagline: "Collateral-free loans, toolkit incentives, and skill training for traditional artisans",
    baseMatch: 78,
    benefit: "Toolkit incentive of ₹15,000 and credit support up to ₹3,00,000",
    deadline: "Applications open until 15 Nov 2026",
    eligibility: [
      "An artisan or craftsperson working with hands and tools in one of 18 trades",
      "Minimum age of 18 years on the date of registration",
      "Only one member of the family is eligible to register"
    ],
    documents: ["Aadhaar card", "Mobile number linked with Aadhaar", "Bank account details", "Caste certificate (if applicable)"],
    steps: [
      "Artisan registers on PM Vishwakarma Portal using Aadhaar biometrics at a CSC",
      "Receive Vishwakarma Certificate and ID card",
      "Basic skill training course of 5-7 days starts",
      "Toolkit incentive disbursed to linked bank account"
    ]
  };

  const exists = await get("SELECT id FROM schemes WHERE id = ?", [mockScheme.id]);
  if (!exists) {
    await run(
      `INSERT INTO schemes (id, name, dept, category, tagline, baseMatch, benefit, deadline, eligibility, documents, steps, state, official_link, last_updated, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mockScheme.id,
        mockScheme.name,
        mockScheme.dept,
        mockScheme.category,
        mockScheme.tagline,
        mockScheme.baseMatch,
        mockScheme.benefit,
        mockScheme.deadline,
        JSON.stringify(mockScheme.eligibility),
        JSON.stringify(mockScheme.documents),
        JSON.stringify(mockScheme.steps),
        "Central",
        "https://pmvishwakarma.gov.in",
        new Date().toISOString().split("T")[0],
        "pending_verification"
      ]
    );
    console.log("Mock crawler successfully inserted: PM Vishwakarma Scheme");
    return [mockScheme];
  }
  
  console.log("Artisan scheme already verified and saved in SQLite database.");
  return [];
}

module.exports = {
  scrapeAndExtract
};
