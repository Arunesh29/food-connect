import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCbvq3HpKt0Q4toqkkMq999SSFaZWfwDz0",
  authDomain: "food-connect-7a28f.firebaseapp.com",
  projectId: "food-connect-7a28f",
  storageBucket: "food-connect-7a28f.firebasestorage.app",
  messagingSenderId: "1049715117090",
  appId: "1:1049715117090:web:db76a21cef93fd57fb4e7b",
  measurementId: "G-2TB5EN2GP3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
