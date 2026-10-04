import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { 
  getCategories, 
  loginUser, 
  registerUser, 
  getAuthProfile, 
  updateAuthProfile, 
  getAuthSaved, 
  toggleAuthSaved 
} from "../api";

const SchemeContext = createContext(null);

const SAVED_KEY = "yojanasetu_saved";
const PROFILE_KEY = "yojanasetu_profile";
const TOKEN_KEY = "yojanasetu_token";
const USER_KEY = "yojanasetu_user";

export function SchemeProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [profile, setProfileState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [matched, setMatched] = useState(null); // null until onboarding runs a match
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to YojanaSetu! Check matches to start scanning benefits.", time: "Just now", unread: true }
  ]);

  const addNotification = useCallback((text) => {
    setNotifications((prev) => [
      { id: Date.now(), text, time: "Just now", unread: true },
      ...prev
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Fetch logged-in user profile & saved schemes from database if authenticated
  useEffect(() => {
    if (token) {
      getAuthProfile(token)
        .then((data) => {
          setProfileState(data.profile || {});
          localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile || {}));
        })
        .catch(() => console.warn("Failed to sync profile from db, using cache."));

      getAuthSaved(token)
        .then((ids) => {
          setSaved(ids || []);
          localStorage.setItem(SAVED_KEY, JSON.stringify(ids || []));
        })
        .catch(() => console.warn("Failed to sync bookmarks from db, using cache."));
    }
  }, [token]);

  const setProfile = useCallback((updater) => {
    setProfileState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      if (token) {
        updateAuthProfile(token, next).catch(e => console.error("Database profile sync failed:", e));
      }
      return next;
    });
  }, [token]);

  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      if (token) {
        toggleAuthSaved(token, id).catch(e => console.error("Database saved sync failed:", e));
      }
      return next;
    });
  }, [token]);

  // Auth Operations
  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    setTokenState(data.token);
    setUser({ name: data.name, email: data.email, role: data.role });
    setProfileState(data.profile || {});
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email, role: data.role }));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile || {}));
    return data;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const data = await registerUser(email, password, name);
    setTokenState(data.token);
    setUser({ name, email, role: data.role });
    setProfileState(data.profile || {});
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ name, email, role: data.role }));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile || {}));
    return data;
  }, []);

  const logout = useCallback(() => {
    setTokenState("");
    setUser(null);
    setProfileState({});
    setSaved([]);
    setMatched(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SAVED_KEY);
  }, []);

  return (
    <SchemeContext.Provider
      value={{ 
        profile, 
        setProfile, 
        saved, 
        toggleSave, 
        matched, 
        setMatched, 
        categories,
        token,
        user,
        login,
        register,
        logout,
        notifications,
        addNotification,
        markAllNotificationsRead
      }}
    >
      {children}
    </SchemeContext.Provider>
  );
}

export function useSchemeContext() {
  const ctx = useContext(SchemeContext);
  if (!ctx) throw new Error("useSchemeContext must be used within SchemeProvider");
  return ctx;
}
