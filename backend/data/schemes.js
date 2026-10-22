const CATEGORIES = [
  { key: "education", label: "Education", count: 2 },
  { key: "agriculture", label: "Agriculture", count: 2 },
  { key: "health", label: "Health", count: 1 },
  { key: "disability", label: "Disability", count: 0 },
  { key: "employment", label: "Employment", count: 0 },
  { key: "women", label: "Women & Child", count: 2 },
  { key: "business", label: "Business & MSME", count: 1 },
  { key: "housing", label: "Housing", count: 0 },
];

const SCHEMES = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    dept: "Ministry of Agriculture & Farmers Welfare",
    category: "agriculture",
    tagline: "Income support for eligible farmer families",
    baseMatch: 0,
    benefit: "₹6,000 per year in three instalments for eligible beneficiaries",
    deadline: "Check the official portal for current registration and instalment updates",
    eligibility: [
      "Eligibility depends on land records and applicable scheme rules",
      "Certain institutional landholders and specified categories of beneficiaries are excluded",
      "Additional exclusion criteria may apply"
    ],
    documents: [
      "Aadhaar card",
      "Land records, where required",
      "Bank account details"
    ],
    steps: [
      "Check the official PM-KISAN portal for eligibility",
      "Complete registration through the available official process",
      "Submit the required details for verification",
      "Track beneficiary and payment status on the official portal"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://pmkisan.gov.in",
    last_updated: "2026-10-22",
    status: "active"
  },
  {
    id: "pm-usp-csss",
    name: "PM-USP Central Sector Scheme of Scholarship for College and University Students",
    dept: "Department of Higher Education, Ministry of Education",
    category: "education",
    tagline: "Merit-based scholarship for eligible college and university students",
    baseMatch: 0,
    benefit: "Scholarship amount and continuation conditions are defined in the current official guidelines",
    deadline: "Check the National Scholarship Portal for current application dates and fresh-application availability",
    eligibility: [
      "Merit-based eligibility conditions apply",
      "The student must satisfy the current scheme guidelines and institution requirements",
      "Fresh and renewal application conditions may differ",
      "Confirm marks, income, course, and other criteria in the official guidelines before applying"
    ],
    documents: [
      "Documents requested by the National Scholarship Portal for this scheme",
      "Academic records required for fresh or renewal application",
      "Bank and identity details required by the portal"
    ],
    steps: [
      "Open the National Scholarship Portal",
      "Find PM-USP Central Sector Scheme of Scholarship for College and University Students",
      "Read the current guidelines and check whether fresh or renewal applications are open for your situation",
      "Complete the application and institution verification steps shown on the portal"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://scholarships.gov.in/",
    last_updated: "2026-10-22",
    status: "active"
  },
  {
    id: "smam-agri-machinery",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    dept: "Department of Agriculture & Farmers Welfare, Ministry of Agriculture & Farmers Welfare",
    category: "agriculture",
    tagline: "Government assistance supporting access to agricultural machinery and mechanization",
    baseMatch: 0,
    benefit: "Assistance for eligible farm machinery and implements may be available subject to current guidelines, state allocation, machine type, and beneficiary eligibility",
    deadline: "Application windows and allocations vary by state and financial year; check the official DBT farm machinery portal and Uttar Pradesh agriculture department announcements",
    eligibility: [
      "Eligibility and assistance depend on the current scheme guidelines and state-level implementation",
      "Availability can depend on machinery type, beneficiary category, district allocation, and application window",
      "Do not assume a subsidy is currently available until the portal confirms the applicant and equipment eligibility"
    ],
    documents: [
      "Identity and farmer or landholding details as required by the state application process",
      "Bank account details",
      "Machinery and dealer details where required",
      "Any additional documents requested by the official application portal"
    ],
    steps: [
      "Open the official DBT farm machinery portal",
      "Check whether applications and targets are available for Uttar Pradesh and your district",
      "Review the eligible machinery list and current scheme guidelines",
      "Follow the portal's application, selection, purchase, and verification instructions"
    ],
    state: "Central with state-level implementation",
    income_limit: null,
    age_limit: null,
    official_link: "https://agrimachinery.nic.in/index/index",
    guidelines_link: "https://agrimachinery.nic.in/Files/Guidelines/SMAM_2026.pdf",
    last_updated: "2026-10-22",
    status: "active"
  },
  {
    id: "nsp-scholarship",
    name: "National Scholarship Portal — Scholarship Directory",
    dept: "Multiple government departments",
    category: "education",
    tagline: "Find scholarship programmes based on course, background, and eligibility",
    baseMatch: 0,
    benefit: "Benefits vary by individual scholarship and its official guidelines",
    deadline: "Deadlines vary by scholarship; check the current portal notices",
    eligibility: [
      "This is a directory of scholarship programmes, not one standalone scholarship",
      "Eligibility varies by scheme, course, institution, academic performance, income, and applicant category",
      "Check the individual scheme guidelines before applying"
    ],
    documents: [
      "Documents vary by scholarship",
      "Identity, academic, income, bank, or category documents may be required depending on the selected scheme"
    ],
    steps: [
      "Open the National Scholarship Portal",
      "Review the available schemes and select one that matches your circumstances",
      "Read that scheme's official eligibility rules and application dates",
      "Submit the required information and documents through the portal"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://scholarships.gov.in/",
    last_updated: "2026-10-22",
    status: "active"
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat — PM-JAY",
    dept: "Ministry of Health & Family Welfare",
    category: "health",
    tagline: "Hospitalisation coverage for eligible beneficiaries",
    baseMatch: 0,
    benefit: "Cashless hospitalisation cover for eligible beneficiaries under applicable PM-JAY rules",
    deadline: "Check the official portal for eligibility and card-generation information",
    eligibility: [
      "Eligibility depends on the applicable beneficiary database and government rules",
      "State-specific eligibility provisions may apply",
      "Confirm eligibility through an official channel"
    ],
    documents: [
      "Accepted identity document",
      "Ration card or other accepted family document, where required",
      "Other documents requested during eligibility verification"
    ],
    steps: [
      "Check beneficiary eligibility through the official portal or an authorised centre",
      "Follow the official process for beneficiary identification and card generation",
      "Locate an empanelled hospital",
      "Confirm coverage for the required treatment before admission"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://pmjay.gov.in",
    last_updated: "2026-10-22",
    status: "pending_verification"
  },
  {
    id: "stand-up-india",
    name: "Stand-Up India",
    dept: "Government of India",
    category: "business",
    tagline: "Explore government-backed financing options for entrepreneurs",
    baseMatch: 0,
    benefit: "Loan terms and availability must be confirmed from current official guidance",
    deadline: "Check current scheme status and application options with an official source or participating bank",
    eligibility: [
      "Eligibility depends on the current programme rules",
      "Applicant and enterprise requirements must be checked against official guidance",
      "Loan approval is subject to lender assessment"
    ],
    documents: [
      "Identity and address documents",
      "Business plan, where required",
      "Financial and enterprise documents requested by the lender"
    ],
    steps: [
      "Check the current official scheme guidance",
      "Confirm whether applications are being accepted under the programme",
      "Consult the relevant bank or authorised application channel",
      "Submit the documents required for assessment"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://www.standupmitra.in",
    last_updated: "2026-10-22",
    status: "pending_verification"
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana",
    dept: "Government of India",
    category: "women",
    tagline: "Savings scheme for the future of an eligible girl child",
    baseMatch: 0,
    benefit: "Interest rate and account terms are subject to current government notifications",
    deadline: "Account-opening age conditions apply; confirm the current rules through an authorised post office or bank",
    eligibility: [
      "Account-opening rules apply to the girl child and guardian",
      "Age and account-number conditions must be met",
      "Check the current official scheme rules"
    ],
    documents: [
      "Girl child's birth certificate",
      "Guardian's identity document",
      "Address proof, as required"
    ],
    steps: [
      "Review the current scheme rules",
      "Visit an authorised post office or participating bank",
      "Provide the required documents and opening deposit",
      "Keep the account documents for future deposits and servicing"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://www.indiapost.gov.in",
    last_updated: "2026-10-22",
    status: "pending_verification"
  },
  {
    id: "ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana",
    dept: "Ministry of Petroleum & Natural Gas",
    category: "women",
    tagline: "LPG connection support for eligible women from households without an existing LPG connection",
    baseMatch: 0,
    benefit: "Connection support and other benefits depend on current scheme provisions",
    deadline: "Check the official portal or an authorised LPG distributor for current application availability",
    eligibility: [
      "Applicant and household must satisfy the current scheme criteria",
      "Household LPG connection conditions apply",
      "Required identity and household documents must be provided"
    ],
    documents: [
      "Identity and address documents",
      "Household or ration-card details, where required",
      "Bank account details, where required"
    ],
    steps: [
      "Review current eligibility requirements on the official portal",
      "Contact an authorised LPG distributor",
      "Submit the application and required documents",
      "Wait for verification and confirmation of the application outcome"
    ],
    state: "Central",
    income_limit: null,
    age_limit: null,
    official_link: "https://www.pmuy.gov.in",
    last_updated: "2026-10-22",
    status: "pending_verification"
  }
];

module.exports = { SCHEMES, CATEGORIES };
