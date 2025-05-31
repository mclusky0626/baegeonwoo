
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDUJoF3I6FTFqB3C6LqDgcFy2TdAjHWQY",
  authDomain: "hinhub.firebaseapp.com",
  projectId: "hinhub",
  storageBucket: "hinhub.firebasestorage.app",
  messagingSenderId: "973757441582",
  appId: "1:973757441582:web:2781b0e8ffd122a86b21bf",
  measurementId: "G-4BSGE1J325"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
