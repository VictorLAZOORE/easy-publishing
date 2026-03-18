import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID || 'easy-publishing';

function initAdminApp() {
  if (getApps().length === 0) {
    if (credPath) {
      const resolved = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath);
      initializeApp({
        credential: cert(resolved),
        projectId,
      });
    } else {
      initializeApp({ projectId });
    }
  }
}

export const db = (() => {
  initAdminApp();
  return getFirestore();
})();

export const authAdmin = (() => {
  initAdminApp();
  return getAuth();
})();

export const USERS_COLLECTION = 'users';
