import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYdqDoP7PneiNHPlbHCBt-UzDncYnaJOY",
  authDomain: "test-compta-pie.firebaseapp.com",
  projectId: "test-compta-pie",
  storageBucket: "test-compta-pie.firebasestorage.app",
  messagingSenderId: "878464893702",
  appId: "1:878464893702:web:ca60403eb4ab8713a41487",
  measurementId: "G-HYRS4TKCXQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
