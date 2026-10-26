const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-3.8-flash";
const MAX_MATCHES = 5;
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
      return Array.isArray(parsed) ? parsed : [value.trim()];
    } catch {
      return value.split(/\n|,/).map(item => item.trim()).filter(Boolean);
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

function isRecommendationRequest(message) {
  const query = normalize(message);

  return [
    "which scholarships",
    "which scholarship",
    "can i apply",
    "can i get",
    "am i eligible",
    "based on my details",
    "based on all the details",
    "based on my information",
    "based on all the information",
    "recommend scholarships",
    "recommend a scholarship",
    "suggest scholarships",
    "find scholarships",
    "eligible scholarships",
    "suitable scholarships",
    "scholarships for me",
    "according to my details",
    "according to my profile",
    "what can i apply for"
  ].some(phrase => query.includes(phrase));
}

function isDirectoryScheme(scheme) {
  const name = normalize(scheme && scheme.name);
  const id = normalize(scheme && scheme.id);
  const text = `${name} ${id}`;

  return (
    name === "national scholarship portal" ||
    name === "scholarship portal" ||
    name.includes("scholarship directory") ||
    name.includes("scholarship portal directory") ||
    name.includes("list of scholarships") ||
    name.includes("scholarship scheme list") ||
    name.includes("scholarship search portal") ||
    id === "scholarship directory" ||
    (/\b(directory|catalogue|catalog|search portal)\b/.test(text) &&
      /\b(scholarship|scheme list)\b/.test(text))
  );
}

function isUsableScheme(scheme) {
  if (!scheme || !scheme.name || isDirectoryScheme(scheme)) return false;

  const status = normalize(scheme.status);
  return !status || ["active", "verified"].includes(status);
}

function getSchemeCategory(scheme) {
  return normalize(scheme.category);
}

function getSchemeDetails(scheme) {
  return {
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    department: scheme.dept || "",
    benefit: scheme.benefit || "",
    tagline: scheme.tagline || "",
    description: scheme.description || "",
    eligibility: parseList(scheme.eligibility),
    documents: parseList(scheme.documents),
    steps: parseList(scheme.steps),
    deadline: scheme.deadline || "",
    officialLink: scheme.official_link || "",
    state: scheme.state || "",
    incomeLimit: scheme.income_limit ?? "",
    ageLimit: scheme.age_limit ?? "",
    lastUpdated: scheme.last_updated || ""
  };
}

function getConversationContext(history = [], message = "") {
  const userMessages = [
    ...history.filter(item => item.role === "user").map(item => item.text),
    message
  ];

  const categories = getRequestedCategories(message);

  if (asksAboutScholarships(message)) {
    return { scholarship: true, categories: ["education"] };
  }

  if (categories.length > 0) {
    return { scholarship: false, categories };
  }

  for (let i = userMessages.length - 2; i >= 0; i--) {
    if (asksAboutScholarships(userMessages[i])) {
      return { scholarship: true, categories: ["education"] };
    }

    const previousCategories = getRequestedCategories(userMessages[i]);

    if (previousCategories.length > 0) {
      return { scholarship: false, categories: previousCategories };
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
    /\b(?:class\s*12|12th|in\s*12|class\s*xii|12th\s*standard)[\s\S]{0,60}?\b(\d{1,3}(?:\.\d+)?)\s*%?/,
    /\b(\d{1,3}(?:\.\d+)?)\s*%\s*(?:in\s*)?(?:class\s*12|12th|boards|board exams)?\b/,
    /\b(?:marks|percentage|percent|scored|got|score)\s*(?:of|is|was|are)?\s*(\d{1,3}(?:\.\d+)?)\s*%/
  ];

  let marksMatch = null;

  for (const pattern of marksPatterns) {
    const match = conversation.match(pattern);

    if (match) {
      const value = Number(match[1]);

      if (value >= 0 && value <= 100) {
        marksMatch = match;
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

  if (!details.course) missing.push("your course");
  if (!details.year) missing.push("your current year of study");
  if (!details.marksMentioned) missing.push("your Class 12 or current academic marks");
  if (!details.incomeMentioned) missing.push("your approximate annual family income");
  if (!details.applicationType) missing.push("whether this is a fresh application or renewal");

  return missing;
}

function isLikelyScholarshipFollowUp(message, history = []) {
  const previousMessages = history
    .filter(item => item.role === "user")
    .map(item => item.text);

  if (!previousMessages.some(asksAboutScholarships)) return false;
  if (asksAboutScholarships(message)) return false;
  if (isRecommendationRequest(message)) return false;

  const categories = getRequestedCategories(message);

  if (categories.some(category => category !== "education")) return false;

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

function formatProfile(details) {
  return [
    `- Course: ${details.course || "Not provided"}`,
    `- Study year: ${details.year || "Not provided"}`,
    `- Class 12 marks: ${details.marks || "Not provided"}`,
    `- Annual family income: ${details.income || "Not provided"}`,
    `- Application type: ${details.applicationType || "Not provided"}`
  ].join("\n");
}

function buildScholarshipFollowUp(history = []) {
  const details = extractScholarshipDetails(history);
  const missing = getMissingScholarshipDetails(details);

  if (missing.length > 0) {
    return [
      "Thanks, I've noted the details you've shared.",
      "",
      `I still need ${missing.join(", ")}.`
    ].join("\n");
  }

  return [
    "Thanks! I've saved the details from our conversation:",
    "",
    formatProfile(details),
    "",
    "You can now ask me which scholarships may match your profile."
  ].join("\n");
}

function parseIncomeLimit(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = normalize(value);
  if (!text) return null;

  const match = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|crore|crores)?/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  if (["lakh", "lakhs", "lac", "lacs"].includes(match[2])) return amount * 100000;
  if (["crore", "crores"].includes(match[2])) return amount * 10000000;

  return amount;
}

function parseIncome(value) {
  const text = normalize(value);
  const match = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|crore|crores)?/);

  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  if (["lakh", "lakhs", "lac", "lacs"].includes(match[2])) return amount * 100000;
  if (["crore", "crores"].includes(match[2])) return amount * 10000000;

  return amount;
}

function evaluateScheme(scheme, details) {
  const eligibility = parseList(scheme.eligibility);
  const eligibilityText = normalize(eligibility.join(" "));
  const checks = [];
  let definiteMismatch = false;

  const income = parseIncome(details.income);
  const incomeLimit = parseIncomeLimit(scheme.income_limit);

  const explicitIncomeText = eligibilityText.match(
    /(?:family|annual|parental)?\s*income[^.]{0,100}?(?:up to|not exceed|less than|below|maximum|max|limit of)?\s*(?:rs|rupees)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|crore|crores)?/
  );

  const textIncomeLimit = explicitIncomeText
    ? parseIncomeLimit(`${explicitIncomeText[1]} ${explicitIncomeText[2] || ""}`)
    : null;

  const effectiveIncomeLimit = incomeLimit || textIncomeLimit;

  if (details.course) {
    checks.push({
      label: "Course",
      status: "The database does not establish a course match unless the exact eligible course is explicitly listed."
    });
  }

  if (details.year) {
    checks.push({
      label: "Study year",
      status: "The database does not establish eligibility for your current year unless the exact rule is listed."
    });
  }

  if (details.marks) {
    const mark = Number.parseFloat(details.marks);
    const markRule = eligibilityText.match(
      /(?:minimum|at least|more than|above|greater than|not less than)\s*(\d{1,3}(?:\.\d+)?)\s*%/
    );

    if (markRule && Number.isFinite(mark)) {
      const threshold = Number(markRule[1]);
      const passes = /more than|above|greater than/.test(markRule[0])
        ? mark > threshold
        : mark >= threshold;

      checks.push({
        label: "Class 12 marks",
        status: passes
          ? `Your ${details.marks} meets the stored ${threshold}% threshold.`
          : `Your ${details.marks} does not meet the stored ${threshold}% threshold.`
      });

      if (!passes) definiteMismatch = true;
    } else {
      checks.push({
        label: "Class 12 marks",
        status: "No explicit marks threshold was found in the database."
      });
    }
  }

  if (details.income) {
    if (income !== null && effectiveIncomeLimit !== null) {
      const passes = income <= effectiveIncomeLimit;

      checks.push({
        label: "Family income",
        status: passes
          ? "Your stated income is within the income limit stored in the database."
          : "Your stated income is above the income limit stored in the database."
      });

      if (!passes) definiteMismatch = true;
    } else {
      checks.push({
        label: "Family income",
        status: "No usable income limit was found in the database."
      });
    }
  }

  if (details.applicationType) {
    const applicationRule = eligibilityText.match(
      /\b(fresh application|fresh applicants?|new applicants?|renewal applicants?|renewal only|renewal)\b/
    );

    if (applicationRule) {
      const rule = applicationRule[0];
      const matches = details.applicationType === "Fresh application"
        ? /fresh|new applicant/.test(rule)
        : /renewal/.test(rule);

      checks.push({
        label: "Application type",
        status: matches
          ? `The stored rule mentions ${rule}. Confirm current application instructions.`
          : `The stored rule mentions ${rule}, which may not match your ${details.applicationType.toLowerCase()}.`
      });

      if (!matches) definiteMismatch = true;
    } else {
      checks.push({
        label: "Application type",
        status: "The database does not specify whether fresh applications are accepted."
      });
    }
  }

  return {
    checks,
    definiteMismatch,
    specificCriteriaAvailable: Boolean(effectiveIncomeLimit || /\d+\s*%/.test(eligibilityText))
  };
}

function formatScheme(scheme) {
  const details = getSchemeDetails(scheme);
  const lines = [`### ${details.name}`];

  if (details.benefit) lines.push(`**Benefit:** ${details.benefit}`);
  if (details.category) lines.push(`**Category:** ${details.category}`);

  if (details.eligibility.length) {
    lines.push("**Eligibility listed in the database:**");
    details.eligibility.forEach(item => lines.push(`- ${toText(item)}`));
  }

  if (details.documents.length) {
    lines.push("**Documents:**");
    details.documents.forEach(item => lines.push(`- ${toText(item)}`));
  }

  if (details.steps.length) {
    lines.push("**How to apply:**");
    details.steps.forEach((item, index) => lines.push(`${index + 1}. ${toText(item)}`));
  }

  if (details.deadline) lines.push(`**Deadline:** ${details.deadline}`);
  if (details.officialLink) lines.push(`**Official website:** ${details.officialLink}`);
  if (details.lastUpdated) lines.push(`**Database last updated:** ${details.lastUpdated}`);

  return lines.join("\n");
}

function buildRecommendationResponse(history, schemes) {
  const details = extractScholarshipDetails(history);
  const missing = getMissingScholarshipDetails(details);

  const educationSchemes = schemes
    .filter(scheme => isUsableScheme(scheme) && getSchemeCategory(scheme) === "education")
    .map(scheme => ({ scheme, evaluation: evaluateScheme(scheme, details) }))
    .filter(item => !item.evaluation.definiteMismatch)
    .slice(0, MAX_MATCHES);

  const lines = [
    "Based on the information you've shared, here's your profile:",
    "",
    formatProfile(details),
    ""
  ];

  if (missing.length) {
    lines.push(`To assess eligibility more accurately, I still need ${missing.join(", ")}.`, "");
  }

  if (!educationSchemes.length) {
    lines.push(
      "I couldn't identify an individual education scheme in the current database that I can responsibly match to your profile.",
      "The database may be missing scheme-specific eligibility rules. Check the official National Scholarship Portal: https://scholarships.gov.in/"
    );

    return lines.join("\n");
  }

  lines.push("## Options to verify");
  lines.push("These are not confirmed eligible matches. I have excluded records with explicit stored criteria that conflict with your details; the remaining records need official eligibility verification.");

  educationSchemes.forEach(({ scheme, evaluation }) => {
    lines.push("", `### ${scheme.name}`);
    lines.push("**Status: Eligibility not confirmed from the available database.**");

    if (scheme.benefit) {
      lines.push(`**Benefit listed in the database:** ${scheme.benefit}`);
    }

    if (evaluation.checks.length) {
      lines.push("**Checks:**");
      evaluation.checks.forEach(check => lines.push(`- ${check.label}: ${check.status}`));
    }

    const eligibility = parseList(scheme.eligibility);

    if (eligibility.length) {
      lines.push("**Eligibility stored in the database:**");
      eligibility.forEach(item => lines.push(`- ${toText(item)}`));
    } else {
      lines.push("Detailed eligibility criteria are missing from the database.");
    }

    if (scheme.official_link) {
      lines.push(`**Official website:** ${scheme.official_link}`);
    }
  });

  lines.push(
    "",
    "Your Class 12 marks and income are useful screening details, but they do not prove eligibility by themselves. The database must contain reliable scheme-specific rules, including course, institution, category, marks, income and application type.",
    "Official portal: https://scholarships.gov.in/"
  );

  return lines.join("\n");
}

function findRelevantSchemes(message, schemes = [], forcedCategories = []) {
  const categories = forcedCategories.length
    ? forcedCategories
    : getRequestedCategories(message);

  const query = normalize(message);

  const genericTokens = new Set([
    "the", "and", "for", "you", "your", "can", "are", "with", "from",
    "that", "this", "which", "what", "based", "details", "shared",
    "apply", "application", "scholarship", "scholarships", "student",
    "students", "education", "college", "university", "btech", "tech",
    "engineering", "study", "year", "uttar", "pradesh", "up", "fresh",
    "income", "family", "marks", "class", "12", "got", "lakh", "lakhs",
    "suggest", "recommend", "find", "show", "list", "give", "please",
    "available", "options", "option", "information"
  ]);

  const tokens = [...new Set(
    query.split(" ").filter(token => token.length >= 3 && !genericTokens.has(token))
  )];

  return schemes
    .filter(isUsableScheme)
    .filter(scheme =>
      categories.length === 0 || categories.includes(getSchemeCategory(scheme))
    )
    .map(scheme => {
      const name = normalize(scheme.name);

      const searchable = normalize([
        scheme.name,
        scheme.dept,
        scheme.tagline,
        scheme.benefit,
        scheme.eligibility,
        scheme.description,
        scheme.state
      ].join(" "));

      let score = name && query.includes(name) ? 20 : 0;

      for (const token of tokens) {
        if (name.includes(token)) score += 4;
        else if (searchable.includes(token)) score += 1;
      }

      if (categories.includes(getSchemeCategory(scheme)) && tokens.length === 0) {
        score += 1;
      }

      return { scheme, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES)
    .map(item => item.scheme);
}

function buildInitialScholarshipResponse(history, schemes) {
  const initialMessage = history
    .filter(item => item.role === "user")
    .map(item => item.text)
    .join(" ");

  const matches = findRelevantSchemes(
    initialMessage,
    schemes,
    ["education"]
  );

  if (!matches.length) {
    return [
      "I couldn't find a matching individual education scheme in the current database.",
      "You can check available options on the National Scholarship Portal: https://scholarships.gov.in/",
      "",
      "If you share your course, year of study, marks, annual family income and whether you're applying fresh or for renewal, I can help narrow down the options."
    ].join("\n");
  }

  const lines = [
    "I found these education schemes in YojanaSetu's database. These are possible matches, not confirmed eligibility."
  ];

  matches.forEach(scheme => {
    lines.push("", formatScheme(scheme));
  });

  lines.push(
    "",
    "To narrow down the options, tell me your current course and year, Class 12 or current academic marks, approximate annual family income, and whether this is a fresh application or renewal."
  );

  return lines.join("\n");
}

function fallbackResponse(message, profile = {}, schemes = [], history = []) {
  const conversation = [
    ...history,
    { role: "user", text: message }
  ];

  const context = getConversationContext(history, message);

  const priorScholarshipQuestion = history.some(item =>
    item.role === "user" && asksAboutScholarships(item.text)
  );

  if (
    context.scholarship &&
    isRecommendationRequest(message) &&
    priorScholarshipQuestion
  ) {
    return buildRecommendationResponse(conversation, schemes);
  }

  if (context.scholarship && isLikelyScholarshipFollowUp(message, history)) {
    return buildScholarshipFollowUp(conversation);
  }

  if (context.scholarship && !priorScholarshipQuestion) {
    return buildInitialScholarshipResponse(conversation, schemes);
  }

  const matches = findRelevantSchemes(
    message,
    schemes,
    context.categories
  );

  if (!matches.length) {
    return "I couldn't find a sufficiently relevant scheme in YojanaSetu's current database. Please specify the type of support you need.";
  }

  return [
    "I found these possible matches in YojanaSetu's database.",
    ...matches.map(formatScheme),
    "Please verify current eligibility and deadlines on the official scheme website."
  ].join("\n\n");
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

  const priorScholarshipQuestion = safeHistory.some(item =>
    item.role === "user" && asksAboutScholarships(item.text)
  );

  if (
    context.scholarship &&
    isRecommendationRequest(message) &&
    priorScholarshipQuestion
  ) {
    return buildRecommendationResponse(conversation, schemes);
  }

  if (context.scholarship && isLikelyScholarshipFollowUp(message, safeHistory)) {
    return buildScholarshipFollowUp(conversation);
  }

  if (context.scholarship && !priorScholarshipQuestion) {
    return buildInitialScholarshipResponse(conversation, schemes);
  }

  const combinedUserMessages = conversation
    .filter(item => item.role === "user")
    .map(item => item.text)
    .join(" ");

  const matches = findRelevantSchemes(
    context.scholarship ? combinedUserMessages : message,
    schemes,
    context.categories
  );

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using local scheme matching.");
    return fallbackResponse(message, userProfile, schemes, safeHistory);
  }

  const scholarshipDetails = extractScholarshipDetails(conversation);

  const prompt = `
You are YojanaSetu, an assistant that helps Indian citizens understand government schemes.

CONVERSATION HISTORY:
${safeHistory.map(item => `${item.role.toUpperCase()}: ${item.text}`).join("\n") || "No previous messages."}

LATEST MESSAGE:
${message}

USER PROFILE:
${JSON.stringify(userProfile || {})}

EXTRACTED SCHOLARSHIP DETAILS:
${JSON.stringify(scholarshipDetails, null, 2)}

SCHEME RECORDS FROM THE DATABASE:
${JSON.stringify(matches.map(getSchemeDetails), null, 2)}

RULES:
1. Answer the latest message using the full conversation history.
2. Remember details the user has already provided and do not ask for them again.
3. For an initial scholarship request, show relevant individual schemes and ask for missing details.
4. For a follow-up asking which scholarships the user can apply for, compare their details with the supplied scheme records.
5. Never treat the National Scholarship Portal directory as an individual scholarship.
6. Recommend only schemes present in the supplied database.
7. Distinguish potential matches from confirmed eligibility.
8. Never invent benefits, eligibility rules, income limits, deadlines, documents or official links.
9. If the database lacks exact eligibility criteria, explicitly say eligibility cannot be confirmed.
10. Do not claim a scheme is accepting fresh applications unless the records establish that.
11. Use concise, simple language.
12. Do not repeat a full scheme card after every short follow-up.

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
