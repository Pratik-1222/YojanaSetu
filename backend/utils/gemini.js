
const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-3.8-flash";
const MAX_MATCHES = 4;
const GEMINI_TIMEOUT_MS = 15000;

const CATEGORY_KEYWORDS = {
  education: ["scholarship", "scholarships", "student", "students", "college", "university", "tuition", "education", "school", "fees", "study", "hostel", "academic", "btech", "b tech", "engineering"],
  agriculture: ["farmer", "farmers", "farming", "agriculture", "agricultural", "crop", "crops", "irrigation", "fertilizer", "tractor", "equipment", "seeds", "kisan"],
  health: ["health", "healthcare", "hospital", "medical", "medicine", "treatment", "surgery", "insurance", "ayushman"],
  disability: ["disability", "disabled", "divyang", "special needs", "assistive device"],
  employment: ["employment", "job", "jobs", "unemployment", "skill training", "vocational training", "apprenticeship"],
  women: ["women", "woman", "girl child", "girls", "widow", "maternity", "pregnancy", "female"],
  business: ["business", "entrepreneur", "entrepreneurship", "startup", "msme", "enterprise", "business loan"],
  housing: ["housing", "house", "home", "homeless", "home loan", "housing loan", "rural housing"]
};

function toText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalize(value) {
  return toText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/₹/g, " rupees ")
    .replace(/[^\p{L}\p{N}\s.%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [value.trim()].filter(Boolean);
    }
  }

  return [];
}

function getRequestedCategories(message) {
  const query = normalize(message);

  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) =>
      keywords.some(keyword => query.includes(normalize(keyword)))
    )
    .map(([category]) => category);
}

function asksAboutScholarships(message) {
  const query = normalize(message);

  return [
    "scholarship",
    "scholarships",
    "college student",
    "college students",
    "university student",
    "tuition",
    "college fees",
    "education assistance",
    "student financial aid",
    "btech",
    "b tech",
    "engineering student",
    "engineering students"
  ].some(term => query.includes(term));
}

function isUsableScheme(scheme) {
  if (!scheme || !scheme.name) return false;

  const status = normalize(scheme.status);
  return !status || status === "active" || status === "verified";
}

function getSchemeDetails(scheme) {
  return {
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    department: scheme.dept || "",
    benefit: scheme.benefit || "",
    tagline: scheme.tagline || "",
    eligibility: parseList(scheme.eligibility),
    documents: parseList(scheme.documents),
    steps: parseList(scheme.steps),
    deadline: scheme.deadline || "",
    officialLink: scheme.official_link || "",
    state: scheme.state || "",
    incomeLimit: scheme.income_limit,
    ageLimit: scheme.age_limit,
    lastUpdated: scheme.last_updated || ""
  };
}

function scoreScheme(message, scheme) {
  const query = normalize(message);
  const name = normalize(scheme.name);

  const searchable = normalize([
    scheme.name,
    scheme.category,
    scheme.dept,
    scheme.tagline,
    scheme.benefit,
    scheme.eligibility,
    scheme.description,
    scheme.documents
  ].join(" "));

  let score = 0;

  if (name && query.includes(name)) score += 15;

  const requestedCategories = getRequestedCategories(message);
  const category = normalize(scheme.category);

  if (requestedCategories.includes(category)) score += 8;
  else if (requestedCategories.length > 0) score -= 8;

  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have",
    "your", "you", "are", "was", "what", "which", "please", "want",
    "need", "scheme", "schemes", "government", "about", "tell"
  ]);

  for (const token of query.split(" ")) {
    if (token.length < 3 || stopWords.has(token)) continue;

    if (name.includes(token)) score += 5;
    else if (searchable.includes(token)) score += 1;
  }

  return score;
}

function findRelevantSchemes(message, schemes = [], forcedCategories = []) {
  const categories = forcedCategories.length
    ? forcedCategories
    : getRequestedCategories(message);

  const query = normalize(message);

  return schemes
    .filter(isUsableScheme)
    .filter(scheme => {
      const name = normalize(scheme.name);
      const isDirectory =
        name.includes("scholarship directory") ||
        name.includes("scholarship portal directory");

      const asksForDirectory =
        query.includes("scholarship directory") ||
        query.includes("scholarship portal") ||
        query.includes("all scholarships");

      return !isDirectory || asksForDirectory;
    })
    .map(scheme => ({
      scheme,
      score: scoreScheme(message, scheme)
    }))
    .filter(item => item.score >= 3)
    .filter(item =>
      categories.length === 0 ||
      categories.includes(normalize(item.scheme.category))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES)
    .map(item => item.scheme);
}

function getConversationContext(history = [], message = "") {
  const userMessages = [
    ...history.filter(item => item.role === "user").map(item => item.text),
    message
  ];

  const currentCategories = getRequestedCategories(message);

  if (asksAboutScholarships(message)) {
    return { scholarship: true, categories: ["education"] };
  }

  if (currentCategories.length > 0) {
    return { scholarship: false, categories: currentCategories };
  }

  for (let i = userMessages.length - 2; i >= 0; i--) {
    if (asksAboutScholarships(userMessages[i])) {
      return { scholarship: true, categories: ["education"] };
    }

    const categories = getRequestedCategories(userMessages[i]);

    if (categories.length > 0) {
      return { scholarship: false, categories };
    }
  }

  const scholarship = asksAboutScholarships(userMessages.join(" "));

  return {
    scholarship,
    categories: scholarship ? ["education"] : []
  };
}

function extractScholarshipDetails(history = []) {
  const messages = history
    .filter(item => item.role === "user")
    .map(item => normalize(item.text));

  const conversation = messages.join(" ");

  const courseMatch = conversation.match(
    /\b(b\s*\.?\s*tech|btech|bachelor|undergraduate|engineering|diploma|bca|bsc|bcom|ba)\b/
  );

  const yearMatch = conversation.match(
    /\b(1st|2nd|3rd|4th|first|second|third|fourth|final)\s+year\b/
  );

  const marksPatterns = [
    /\b(?:class\s*12|12th|in\s*12|class\s*xii|12th\s*standard)[\s\S]{0,50}?\b(\d{1,3}(?:\.\d+)?)\s*%?/,
    /\b(\d{1,3}(?:\.\d+)?)\s*%\s*(?:in\s*)?(?:class\s*12|12th|boards|board exams)?\b/,
    /\b(?:marks|percentage|scored|got|score)\s*(?:of|is|was|are)?\s*(\d{1,3}(?:\.\d+)?)\s*%/
  ];

  let marksMatch = null;

  for (const pattern of marksPatterns) {
    const found = conversation.match(pattern);

    if (found) {
      const value = Number(found[1]);

      if (value >= 0 && value <= 100) {
        marksMatch = found;
        break;
      }
    }
  }

  const marksMentioned = Boolean(marksMatch) ||
    /\b(marks|percentage|percent|cgpa|grade|academic score|aggregate)\b/.test(conversation);

  const incomePatterns = [
    /\b(?:family income|annual income|income)\s*(?:is|of|around|about)?\s*(?:rupees\s*)?(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)\b/,
    /\b(?:rupees\s*)?(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)\s*(?:per year|per annum|annually|annual)?\b/
  ];

  let incomeMatch = null;

  for (const pattern of incomePatterns) {
    incomeMatch = conversation.match(pattern);
    if (incomeMatch) break;
  }

  const incomeMentioned = Boolean(incomeMatch) ||
    /\b(family income|annual income|per annum|salary|income)\b/.test(conversation);

  const freshMentioned =
    /\bfresh\b|\bnew application\b|\bfirst time\b/.test(conversation);

  const renewalMentioned =
    /\brenewal\b|\brenew\b|\balready receiving\b/.test(conversation);

  return {
    course: courseMatch ? courseMatch[0] : "",
    year: yearMatch ? yearMatch[0] : "",
    marks: marksMatch ? `${marksMatch[1]}%` : "",
    marksMentioned,
    income: incomeMatch ? `${incomeMatch[1]} ${incomeMatch[2]}` : "",
    incomeMentioned,
    applicationType: freshMentioned
      ? "Fresh application"
      : renewalMentioned
        ? "Renewal"
        : "",
    conversation
  };
}

function getMissingScholarshipDetails(details) {
  const missing = [];

  if (!details.course || !details.year) {
    missing.push("your current course and year of study");
  }

  if (!details.marksMentioned) {
    missing.push("your Class 12 or current academic marks");
  }

  if (!details.incomeMentioned) {
    missing.push("your approximate annual family income");
  }

  if (!details.applicationType) {
    missing.push("whether this is a fresh application or renewal");
  }

  return missing;
}

function isLikelyScholarshipFollowUp(message, history = []) {
  const previousUserMessages = history
    .filter(item => item.role === "user")
    .map(item => item.text);

  if (!previousUserMessages.some(asksAboutScholarships)) return false;
  if (asksAboutScholarships(message)) return false;

  const categories = getRequestedCategories(message);

  if (categories.some(category => category !== "education")) {
    return false;
  }

  const query = normalize(message);

  const detailPatterns = [
    /\b(1st|2nd|3rd|4th|first|second|third|fourth|final)\s+year\b/,
    /\b(income|lakh|lakhs|lac|lacs|salary|rupees|per annum)\b/,
    /\b(marks|percentage|percent|cgpa|grade|scored|got|aggregate)\b/,
    /\b(fresh|renewal|renew|first time|new application)\b/,
    /\b(b\s*\.?\s*tech|btech|engineering|undergraduate|diploma)\b/,
    /\b\d{1,3}\s*%/,
    /\bin\s*12\b/
  ];

  return detailPatterns.some(pattern => pattern.test(query)) ||
    query.split(" ").filter(Boolean).length <= 7;
}

function buildScholarshipFollowUp(history = []) {
  const details = extractScholarshipDetails(history);
  const missing = getMissingScholarshipDetails(details);

  if (missing.length > 0) {
    return `Thanks, I've noted the details you've shared. I still need ${missing.join(", ")}.`;
  }

  return [
    "Thanks! Here's the information you've shared:",
    `- Course: ${details.course}`,
    `- Study year: ${details.year}`,
    `- Class 12 marks: ${details.marks}`,
    `- Annual family income: ${details.income}`,
    `- Application type: ${details.applicationType}`,
    "",
    "I'll use these details to narrow down education schemes in the database. Final eligibility depends on the official scheme criteria, including any merit, institution, and application requirements."
  ].join("\n");
}

function formatScheme(scheme) {
  const details = getSchemeDetails(scheme);
  const lines = [`### ${details.name}`];

  if (details.benefit) lines.push(`**Benefit:** ${details.benefit}`);
  if (details.category) lines.push(`**Category:** ${details.category}`);

  if (details.eligibility.length) {
    lines.push("**Eligibility:**");
    details.eligibility.forEach(item => lines.push(`- ${toText(item)}`));
  }

  if (details.documents.length) {
    lines.push("**Documents:**");
    details.documents.forEach(item => lines.push(`- ${toText(item)}`));
  }

  if (details.steps.length) {
    lines.push("**How to apply:**");
    details.steps.forEach((item, index) => {
      lines.push(`${index + 1}. ${toText(item)}`);
    });
  }

  if (details.deadline) lines.push(`**Deadline / timeline:** ${details.deadline}`);
  if (details.officialLink) lines.push(`**Official website:** ${details.officialLink}`);
  if (details.lastUpdated) lines.push(`**Database last updated:** ${details.lastUpdated}`);

  return lines.join("\n");
}

function fallbackResponse(message, profile = {}, schemes = [], history = []) {
  const conversation = [
    ...history,
    { role: "user", text: message }
  ];

  const context = getConversationContext(history, message);

  if (context.scholarship && isLikelyScholarshipFollowUp(message, history)) {
    return buildScholarshipFollowUp(conversation);
  }

  const matches = findRelevantSchemes(
    context.scholarship ? conversation.filter(item => item.role === "user").map(item => item.text).join(" ") : message,
    schemes,
    context.categories
  );

  if (!matches.length) {
    return context.scholarship
      ? "I couldn't find another sufficiently relevant education scheme in the current database. Please check the official National Scholarship Portal for available options."
      : "I couldn't find a sufficiently relevant scheme in YojanaSetu's current database. Try specifying the type of support you need.";
  }

  const response = [
    "I checked the schemes currently available in YojanaSetu's database.",
    context.scholarship
      ? "These education schemes may be relevant. Eligibility must be confirmed against the official guidelines."
      : "These schemes may be relevant. Please check their eligibility conditions."
  ];

  matches.forEach(scheme => response.push("", formatScheme(scheme)));

  response.push(
    "",
    "Important: These are possible matches, not a guarantee of eligibility. Verify current rules, deadlines and documents on the official scheme website."
  );

  if (context.scholarship) {
    response.push("", buildScholarshipFollowUp(conversation));
  }

  return response.join("\n");
}

async function queryAssistant(
  userMessage,
  userProfile = {},
  allSchemes = [],
  history = []
) {
  const message = toText(userMessage).trim();

  if (!message) {
    return "Please enter a question about a government scheme or benefit.";
  }

  const schemes = Array.isArray(allSchemes) ? allSchemes : [];

  const safeHistory = Array.isArray(history)
    ? history
        .filter(item =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.text === "string"
        )
        .slice(-12)
        .map(item => ({
          role: item.role,
          text: item.text.slice(0, 4000)
        }))
    : [];

  const conversation = [
    ...safeHistory,
    { role: "user", text: message }
  ];

  const context = getConversationContext(safeHistory, message);

  if (context.scholarship && isLikelyScholarshipFollowUp(message, safeHistory)) {
    return buildScholarshipFollowUp(conversation);
  }

  const matches = findRelevantSchemes(
    context.scholarship
      ? conversation.filter(item => item.role === "user").map(item => item.text).join(" ")
      : message,
    schemes,
    context.categories
  );

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using local scheme matching.");
    return fallbackResponse(message, userProfile, schemes, safeHistory);
  }

  const details = extractScholarshipDetails(conversation);

  const prompt = `
You are YojanaSetu, an assistant helping Indian citizens understand government schemes.

CONVERSATION HISTORY:
${safeHistory.map(item => `${item.role.toUpperCase()}: ${item.text}`).join("\n") || "No previous messages."}

LATEST MESSAGE:
${message}

CITIZEN PROFILE:
${JSON.stringify(userProfile || {})}

EXTRACTED SCHOLARSHIP DETAILS:
${JSON.stringify(details, null, 2)}

RELEVANT SCHEMES FROM THE DATABASE:
${JSON.stringify(matches.map(getSchemeDetails), null, 2)}

RULES:
1. Answer the latest message using the full conversation history.
2. Remember information the user has already provided.
3. Never ask again for a detail that is already available.
4. If the user provides a short follow-up, acknowledge it and ask only for genuinely missing details.
5. Interpret phrases such as "In 12 I got 90%" as 90% in Class 12.
6. Interpret "I am in 3rd year" as the third year of the course previously discussed.
7. Interpret "family income is 2 lakh per year" as annual family income of ₹2 lakh.
8. Interpret "fresh application" as a fresh application.
9. During scholarship conversations, recommend only education-category schemes from the supplied records.
10. Do not repeat the full scheme description in every follow-up.
11. Never invent scheme names, benefits, eligibility criteria, documents, deadlines, or official URLs.
12. Do not claim that the user is eligible until the official requirements have been checked.
13. If no relevant database records exist, say so.
14. Use simple, concise language.

Answer the latest message in context.
`;

  try {
    const ai = new GoogleGenerativeAI(apiKey);

    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200
      }
    });

    let timeoutId;

    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const error = new Error("Gemini request timed out");
            error.code = "GEMINI_TIMEOUT";
            reject(error);
          }, GEMINI_TIMEOUT_MS);
        })
      ]);

      const answer = result.response.text();

      if (answer && answer.trim()) {
        return answer.trim();
      }

      return fallbackResponse(message, userProfile, schemes, safeHistory);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Gemini API request failed:", {
      message: error.message,
      status: error.status || error.statusCode || null,
      code: error.code || null
    });

    return fallbackResponse(message, userProfile, schemes, safeHistory);
  }
}

module.exports = {
  queryAssistant
};
