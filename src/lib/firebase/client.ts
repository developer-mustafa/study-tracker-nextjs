import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const authInstance = getFirebaseAuthSafe();
  const currentUser = authInstance?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let initializedApp: ReturnType<typeof initializeApp> | null = null;

export function getFirebaseAppSafe() {
  if (!isFirebaseConfigured) return null;
  if (initializedApp) return initializedApp;
  try {
    initializedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return initializedApp;
  } catch (err) {
    console.warn('Firebase init warning:', err);
    return null;
  }
}

export function getFirebaseAuthSafe() {
  const app = getFirebaseAppSafe();
  return app ? getAuth(app) : null;
}

export function getFirestoreSafe() {
  const app = getFirebaseAppSafe();
  if (!app) return null;
  return firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

// Connection test on boot
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  const db = getFirestoreSafe();
  if (db) {
    getDocFromServer(doc(db, 'test', 'connection'))
      .catch((error) => {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      });
  }
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuthSafe();
  if (!auth) {
    throw new Error('Firebase authentication is not configured in this environment.');
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function signOutFirebase() {
  const auth = getFirebaseAuthSafe();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuthSafe();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
