/**
 * JATC database service module - database.ts
 * Integrates Cloud Firestore with LocalStorage browser cache for bulletproof recovery.
 * Acts as the centralized API layer for JATC database transactions.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// Helper to save data to local storage
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage for key ${key}:`, error);
  }
}

// Helper to load data from local storage
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Failed to parse localStorage for key ${key}:`, error);
    return defaultValue;
  }
}

// Fetch all collections from Firestore once to ensure state is initialized properly before subscribing (races prevention)
export async function fetchAllDbData(): Promise<{
  siteConfig: any | null;
  members: any[];
  sessions: any[];
  articles: any[];
  gallery: any[];
  lmsModules: any[];
}> {
  const resultObj = {
    siteConfig: null as any | null,
    members: [] as any[],
    sessions: [] as any[],
    articles: [] as any[],
    gallery: [] as any[],
    lmsModules: [] as any[]
  };

  try {
    // 1. Fetch site config
    const configDoc = await getDoc(doc(db, 'config', 'site'));
    if (configDoc.exists()) {
      const siteConfig = configDoc.data()?.siteConfig || null;
      if (siteConfig) {
        // Fetch institutions separately to bypass Firestore 1MB document size limit
        const instDoc = await getDoc(doc(db, 'config', 'institutions'));
        if (instDoc.exists()) {
          siteConfig.institutions = instDoc.data()?.institutions || [];
        } else {
          siteConfig.institutions = siteConfig.institutions || [];
        }
      }
      resultObj.siteConfig = siteConfig;
    }

    // 2. Fetch members
    const membersSnap = await getDocs(collection(db, 'members'));
    membersSnap.forEach((doc) => {
      resultObj.members.push(doc.data());
    });

    // 3. Fetch sessions
    const sessionsSnap = await getDocs(collection(db, 'sessions'));
    sessionsSnap.forEach((doc) => {
      resultObj.sessions.push(doc.data());
    });

    // 4. Fetch articles
    const articlesSnap = await getDocs(collection(db, 'articles'));
    articlesSnap.forEach((doc) => {
      resultObj.articles.push(doc.data());
    });

    // 5. Fetch gallery
    const gallerySnap = await getDocs(collection(db, 'gallery'));
    gallerySnap.forEach((doc) => {
      resultObj.gallery.push(doc.data());
    });

    // 6. Fetch LMS modules
    const lmsSnap = await getDocs(collection(db, 'lmsModules'));
    lmsSnap.forEach((doc) => {
      resultObj.lmsModules.push(doc.data());
    });

  } catch (error) {
    console.error("Failed to perform initial bulk load of DB entities:", error);
  }

  return resultObj;
}
