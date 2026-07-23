import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Config Firebase — nilai ini diambil dari .env (lihat .env.example).
// Ini BEDA dengan GitHub token: Firebase Web API key memang didesain untuk
// ada di client, keamanannya dijaga lewat Firestore Security Rules (lihat
// README.md di root proyek untuk rules terbaru), bukan dengan menyembunyikan key ini.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
