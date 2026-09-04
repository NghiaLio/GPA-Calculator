import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwTmUEXunDrQNckm8pKb-EiI4nCkp3iTk",
  authDomain: "exam-scores-2a86c.firebaseapp.com",
  projectId: "exam-scores-2a86c",
  storageBucket: "exam-scores-2a86c.firebasestorage.app",
  messagingSenderId: "144161897073",
  appId: "1:144161897073:web:da49bb905d67955c8679d0",
  measurementId: "G-FYD7VC23MX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
