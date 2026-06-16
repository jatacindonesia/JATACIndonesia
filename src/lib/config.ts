/**
 * JATC configuration module - config.ts
 * Isolates Firebase connection setup and credentials, allowing easy deployment configuration
 * and safe fallback behaviors for Vercel, Local, and Dev environments.
 */

// Helper to gracefully parse and retrieve environment variables
const getEnv = (key: string, defaultValue: string): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

// Raw configurations mapping
export const FIREBASE_CONFIG = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyAC1ZIfN41YsbTPZAOHoWl7jYjN0K9FVyM"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "gen-lang-client-0785630799.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "gen-lang-client-0785630799"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "gen-lang-client-0785630799.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "172064210491"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:172064210491:web:bc00573327a2c61efe261e"),
  firestoreDatabaseId: getEnv("VITE_FIREBASE_DATABASE_ID", "ai-studio-9c6523bd-1977-49ff-ab75-3c3ed90c2f06")
};

// Check if we are running in local/hybrid sandbox mode
export const IS_OFFLINE_SUPPORTED = true; 
export const LOCAL_STORAGE_KEY_PREFIX = "jatc_";
