import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseConfig() {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_apiKey') : '');
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_authDomain') : '');
  const projectId = env.VITE_FIREBASE_PROJECT_ID || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_projectId') : '');
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_storageBucket') : '');
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_messagingSenderId') : '');
  const appId = env.VITE_FIREBASE_APP_ID || (typeof window !== 'undefined' ? localStorage.getItem('custom_fb_appId') : '');

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId: messagingSenderId || '',
      appId: appId || '',
    };
  }
  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    return null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const auth = firebaseAuth;
  const currentUser = auth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || false,
      isAnonymous: currentUser?.isAnonymous || false,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Security / Operation Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loginWithGoogle() {
  if (!firebaseAuth) {
    initFirebase();
  }
  if (!firebaseAuth) {
    throw new Error('Firebase Authentication is not configured yet.');
  }

  const provider = new GoogleAuthProvider();
  return await signInWithPopup(firebaseAuth, provider);
}

export async function logoutFirebase() {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}
