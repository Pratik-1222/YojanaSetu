const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

export function getSchemes(category = "all") {
  const q = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  return fetch(`${API_BASE}/api/schemes${q}`).then(handle);
}

export function getScheme(id) {
  return fetch(`${API_BASE}/api/schemes/${id}`).then(handle);
}

export function getCategories() {
  return fetch(`${API_BASE}/api/schemes/categories`).then(handle);
}

export function matchSchemes(profile) {
  return fetch(`${API_BASE}/api/schemes/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  }).then(handle);
}

// User Authentication API methods
export function loginUser(email, password) {
  return fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }).then(handle);
}

export function registerUser(email, password, name) {
  return fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name })
  }).then(handle);
}

export function getAuthProfile(token) {
  return fetch(`${API_BASE}/api/auth/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(handle);
}

export function updateAuthProfile(token, profile) {
  return fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ profile })
  }).then(handle);
}

export function getAuthSaved(token) {
  return fetch(`${API_BASE}/api/auth/saved`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(handle);
}

export function toggleAuthSaved(token, schemeId) {
  return fetch(`${API_BASE}/api/auth/saved`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ schemeId })
  }).then(handle);
}

// AI Assistant Chat RAG API method
export function askAIAssistant(message, profile) {
  return fetch(`${API_BASE}/api/schemes/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, profile })
  }).then(handle);
}

// Admin CMS Control API methods
export function verifyScheme(token, id, status) {
  return fetch(`${API_BASE}/api/schemes/${id}/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  }).then(handle);
}

export function createScheme(token, schemeData) {
  return fetch(`${API_BASE}/api/schemes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(schemeData)
  }).then(handle);
}

export function triggerCrawler(token) {
  return fetch(`${API_BASE}/api/schemes/crawler/trigger`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(handle);
}
