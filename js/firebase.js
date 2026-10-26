// Single place that initialises Firebase and re-exports what the pages use.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit,
  onSnapshot, runTransaction, serverTimestamp, writeBatch, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configMissing = firebaseConfig.apiKey.startsWith("PASTE_");

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // default persistence (IndexedDB) keeps you signed in across pages and restarts
auth.useDeviceLanguage();
export const db = getFirestore(app);

export {
  onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  RecaptchaVerifier, signInWithPhoneNumber,
  doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot,
  runTransaction, serverTimestamp, writeBatch, getDocs
};

/** Wait for Firebase to report the signed-in user (or null) once. */
export async function currentUser() {
  await auth.authStateReady();       // waits until Firebase has restored any saved sign-in
  return auth.currentUser;
}

/** The user's Firestore profile, or null if they haven't finished registering. */
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/** "+91 98765 43210" / "9876543210" → "+919876543210" (defaults to India). */
export function toE164(raw) {
  const s = (raw || "").trim();
  const d = s.replace(/\D/g, "");
  if (s.startsWith("+")) return "+" + d;
  if (d.length === 10) return "+91" + d;
  if (d.length === 12 && d.startsWith("91")) return "+" + d;
  return "+" + d;
}
export const validPhone = e164 => /^\+\d{10,15}$/.test(e164);
export const normDevice = s => (s || "").trim().toUpperCase().replace(/\s+/g, "");
export const validDevice = id => /^ALRT-\d{3,}$/.test(id);
