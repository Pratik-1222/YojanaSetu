const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper to interact with Gemini API
async function queryAssistant(userMessage, userProfile = {}, allSchemes = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Compile schemes text context for LLM RAG injection
  const contextText = allSchemes
    .map((s) => {
      return `- ID: ${s.id}\n  Name: ${s.name}\n  Benefit: ${s.benefit}\n  Eligibility: ${s.eligibility}\n  Tagline: ${s.tagline}`;
    })
    .join("\n\n");

  const profileText = JSON.stringify(userProfile);

  const prompt = `You are YojanaSetu AI Assistant, an expert on Indian government welfare schemes.
Your task is to analyze the citizen's query and profile, and guide them to eligible schemes from our database.

Here is the database of available schemes:
${contextText}

Here is the citizen's profile details:
${profileText}

The citizen asks: "${userMessage}"

GUIDELINES:
1. CRITICAL: You MUST NOT invent, make up, or hallucinate any government schemes that are not in the provided database of available schemes above. Only reference schemes from the provided list.
2. If the user asks about a program not in the list, state that we do not have verified data for it yet, and guide them to the database items that match nearest.
3. Contrast their profile (age, income limit, state, gender, disability status) against the scheme criteria. Clearly explain why they are eligible, or if they are close, what is missing.
4. Simplify complex government terms into plain, simple-to-understand language.
5. For any matched or recommended scheme, you MUST explicitly detail:
   - **Documents Required**: List out the exact documents (e.g. Aadhaar, Income certificate) required to apply.
   - **How to Apply**: Walk the user step-by-step through the application instructions.
   - **Processing Time / Timeline**: Clearly state the scheme's deadline and estimate how long the process takes (e.g. processing timeframe, rolling basis).
6. Keep your response professional, structured, and easy to read. Use bullet points where appropriate.`;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("No VITE/GEMINI API key found. Using smart heuristic assistant fallback.");
    return fallbackResponse(userMessage, userProfile, allSchemes);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.response.text();
  } catch (err) {
    console.error("Gemini API call failed, falling back:", err);
    return fallbackResponse(userMessage, userProfile, allSchemes);
  }
}

// Smart local matching fallback if API key is missing or calls fail
function fallbackResponse(msg, profile, schemes) {
  const term = msg.toLowerCase();
  
  // Find schemes whose category matches terms
  let matches = schemes.filter((s) => {
    return (
      s.name.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.dept.toLowerCase().includes(term) ||
      s.tagline.toLowerCase().includes(term)
    );
  });

  if (matches.length === 0) {
    // Return general category match based on occupation
    const occ = (profile.occupation || "").toLowerCase();
    if (occ.includes("student")) {
      matches = schemes.filter(s => s.category === "education");
    } else if (occ.includes("farmer")) {
      matches = schemes.filter(s => s.category === "agriculture");
    } else {
      matches = schemes.slice(0, 2);
    }
  }

  if (matches.length > 0) {
    let response = `Based on your request, I found some relevant schemes you may qualify for:\n\n`;
    matches.forEach((s) => {
      const eligArr = Array.isArray(s.eligibility) ? s.eligibility : JSON.parse(s.eligibility || "[]");
      const docsArr = Array.isArray(s.documents) ? s.documents : JSON.parse(s.documents || "[]");
      const stepsArr = Array.isArray(s.steps) ? s.steps : JSON.parse(s.steps || "[]");

      response += `### 🌟 ${s.name}\n`;
      response += `*   **Primary Benefit**: ${s.benefit}\n`;
      response += `*   **Timeline / Deadline**: ${s.deadline}\n`;
      response += `*   **Eligibility Details**:\n${eligArr.map(x => `    - ${x}`).join("\n")}\n`;
      response += `*   **Required Documents**:\n${docsArr.map(x => `    - ${x}`).join("\n")}\n`;
      response += `*   **How to Apply (Instructions)**:\n${stepsArr.map((x, i) => `    ${i + 1}. ${x}`).join("\n")}\n\n`;
    });
    response += `You can navigate to the "Browse Schemes" tab to click "Apply Now" and go directly to each scheme's official registration portal!`;
    return response;
  }

  return "I analyzed your profile details, but I couldn't find specific matches for that query. Try asking about 'scholarships', 'farming subsidies', or 'business loans'.";
}

module.exports = {
  queryAssistant
};
