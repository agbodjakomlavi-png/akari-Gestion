// Firebase integration disabled - using local storage + WebSocket
// Firebase was removed to reduce bundle size and simplify deployment

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
}

export function getFirebaseConfig() {
  return null;
}

export function isFirebaseConfigured(): boolean {
  return false;
}

export function initFirebase() {
  console.log('Firebase integration disabled - using local storage');
  return null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  throw new Error(`Operation error: ${error}`);
}

export async function loginWithGoogle() {
  throw new Error('Google login not available - use Akari ID login instead');
}

export async function logoutFirebase() {
  // No-op
}
