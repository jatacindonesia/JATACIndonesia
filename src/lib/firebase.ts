import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

// Initialize Firebase App
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firestore with Database ID (Critical step)
export const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
export const auth = getAuth();

// Verification helper for startup connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test-connection-probe', 'probe'));
    console.log("Firebase Firestore Connection Probe Succeeded.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client appears to be offline. Connection probe failed.");
    } else {
      console.log("Firebase probe returned expected response or warning. Ready.");
    }
  }
}

// Security Audit Error Format Required by firestore-skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ------------------- Live Sync State CRUD Helpers -------------------

// 1. Site Configuration
export async function fetchSiteConfig(): Promise<any | null> {
  const path = 'config/site';
  try {
    const dRef = doc(db, 'config', 'site');
    const snap = await getDoc(dRef);
    if (snap.exists()) {
      return snap.data()?.siteConfig || null;
    }
    return null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
    return null;
  }
}

export async function saveSiteConfig(siteConfig: any): Promise<void> {
  const path = 'config/site';
  try {
    const dRef = doc(db, 'config', 'site');
    await setDoc(dRef, { siteConfig, lastUpdated: new Date().toISOString() }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

// Helper to batch update all master data arrays to Firestore (useful for seeding / general sync)
export async function uploadFullAppDb(payload: {
  siteConfig?: any;
  members?: any[];
  sessions?: any[];
  articles?: any[];
  gallery?: any[];
  lmsModules?: any[];
}): Promise<void> {
  try {
    if (payload.siteConfig) {
      await saveSiteConfig(payload.siteConfig);
    }
    if (payload.members) {
      for (const item of payload.members) {
        if (!item.id) continue;
        await setDoc(doc(db, 'members', item.id), item, { merge: true });
      }
    }
    if (payload.sessions) {
      for (const item of payload.sessions) {
        if (!item.id) continue;
        await setDoc(doc(db, 'sessions', item.id), item, { merge: true });
      }
    }
    if (payload.articles) {
      for (const item of payload.articles) {
        if (!item.id) continue;
        await setDoc(doc(db, 'articles', item.id), item, { merge: true });
      }
    }
    if (payload.gallery) {
      for (const item of payload.gallery) {
        if (!item.id) continue;
        await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
      }
    }
    if (payload.lmsModules) {
      for (const item of payload.lmsModules) {
        if (!item.id) continue;
        await setDoc(doc(db, 'lmsModules', item.id), item, { merge: true });
      }
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'all-collections-batch-upload');
  }
}
