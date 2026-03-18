import path from 'path';
import { existsSync } from 'fs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID || 'easy-publishing';

function initAdminApp() {
  if (getApps().length === 0) {
    const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Vercel: seul GOOGLE_APPLICATION_CREDENTIALS_JSON fonctionne (pas de fichier)
    if (credJson) {
      try {
        const cred = typeof credJson === 'string' ? JSON.parse(credJson) : credJson;
        initializeApp({ credential: cert(cred), projectId });
      } catch (e) {
        console.error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
        initializeApp({ projectId });
      }
    } else if (credPath && !process.env.VERCEL) {
      const resolved = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath);
      if (existsSync(resolved)) {
        initializeApp({ credential: cert(resolved), projectId });
      } else {
        initializeApp({ projectId });
      }
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
