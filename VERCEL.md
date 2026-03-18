# Configuration Vercel


## Variables d'environnement à configurer

Dans **Vercel** → **Project** → **Settings** → **Environment Variables** :

### Obligatoires

| Variable | Description |
|---------|-------------|
| `AUTH_SECRET` | Secret pour les JWT (32+ caractères aléatoires) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Depuis Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `easy-publishing.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `easy-publishing` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `easy-publishing.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Depuis Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Depuis Firebase Console |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | **Contenu complet** du fichier `*-firebase-adminsdk-*.json` (coller le JSON en une ligne) |
| `FIREBASE_PROJECT_ID` | `easy-publishing` |
| `GCS_BUCKET` | Nom du bucket GCS (ex: `video-uploads-1212`) |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client secret Google OAuth |

### Optionnelles

| Variable | Description |
|---------|-------------|
| `APP_BASE_URL` | URL de prod (ex: `https://ton-domaine.vercel.app`). Sinon Vercel utilise `VERCEL_URL` auto. |
| `BACKEND_URL` | URL du backend Go (pour YouTube, uploads). En prod, ton backend doit être déployé. |

## Firebase Console

1. **Authentication** → **Settings** → **Authorized domains** : ajoute ton domaine Vercel (ex: `easy-publishing-xxx.vercel.app`)

2. **Google Cloud Console** (OAuth) : dans les "Authorized redirect URIs", ajoute :
   - `https://ton-projet.vercel.app/api/oauth/youtube/callback`
   - Ou `https://*.vercel.app/api/oauth/youtube/callback` si tu utilises des previews

## GOOGLE_APPLICATION_CREDENTIALS_JSON

Sur Vercel, pas de fichier : colle le JSON du service account en une seule ligne.

Exemple : `{"type":"service_account","project_id":"easy-publishing",...}`
