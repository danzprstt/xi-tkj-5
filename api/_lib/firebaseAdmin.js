import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// FIREBASE_SERVICE_ACCOUNT harus berisi JSON credential service account
// Firebase (Project Settings → Service Accounts → Generate new private key),
// disimpan sebagai SATU baris string di Environment Variable Vercel.
// INI RAHASIA — jangan pernah taruh di kode / commit ke GitHub / kirim di chat.
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT belum di-set di environment variables.');
  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
