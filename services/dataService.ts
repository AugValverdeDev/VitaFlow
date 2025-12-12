import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { UserProfile, JournalEntry, RoutineItem } from "../types";

// NOTE: Replace these with your actual Firebase configuration
// For this demo, we will gracefully degrade to LocalStorage if keys are missing
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let auth: any;
let db: any;
let isMock = false;

// Initialize Firebase only if config is present
if (firebaseConfig.apiKey) {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn("Firebase config missing. Using LocalStorage Mock Mode.");
  isMock = true;
}

// --- Auth Services ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (isMock) {
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) callback(JSON.parse(storedUser));
    else callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const loginWithGoogle = async () => {
  if (isMock) {
    const user = { uid: 'mock-123', displayName: 'Demo User', email: 'demo@example.com', photoURL: 'https://picsum.photos/200' };
    localStorage.setItem('mock_user', JSON.stringify(user));
    window.location.reload();
    return user;
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logoutUser = async () => {
  if (isMock) {
    localStorage.removeItem('mock_user');
    window.location.reload();
    return;
  }
  await signOut(auth);
};

// --- Data Services ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (isMock) {
    const data = localStorage.getItem(`profile_${uid}`);
    return data ? JSON.parse(data) : null;
  }
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  if (isMock) {
    localStorage.setItem(`profile_${profile.uid}`, JSON.stringify(profile));
    return;
  }
  await setDoc(doc(db, "users", profile.uid), profile, { merge: true });
};

export const saveRoutine = async (uid: string, routines: RoutineItem[]): Promise<void> => {
   if (isMock) {
    localStorage.setItem(`routines_${uid}`, JSON.stringify(routines));
    return;
   }
   await setDoc(doc(db, "routines", uid), { items: routines });
};

export const getRoutines = async (uid: string): Promise<RoutineItem[] | null> => {
  if (isMock) {
    const data = localStorage.getItem(`routines_${uid}`);
    return data ? JSON.parse(data) : null;
  }
  const docRef = doc(db, "routines", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().items : null;
};

export const saveJournalEntry = async (uid: string, entry: JournalEntry): Promise<void> => {
    // Ideally use a subcollection, simplified here for demo
    if (isMock) {
        const key = `journal_${uid}_${entry.date}`;
        localStorage.setItem(key, JSON.stringify(entry));
        return;
    }
    const docRef = doc(db, "users", uid, "journal", entry.date);
    await setDoc(docRef, entry);
}

export const getJournalEntry = async (uid: string, date: string): Promise<JournalEntry | null> => {
    if (isMock) {
        const data = localStorage.getItem(`journal_${uid}_${date}`);
        return data ? JSON.parse(data) : null;
    }
    const docRef = doc(db, "users", uid, "journal", date);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as JournalEntry : null;
}
