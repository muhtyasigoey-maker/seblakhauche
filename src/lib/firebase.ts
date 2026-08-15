import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBako8Lt7kxqzsAVAZpdAb9s16WBLrrHTA",
  authDomain: "gen-lang-client-0835706842.firebaseapp.com",
  projectId: "gen-lang-client-0835706842",
  storageBucket: "gen-lang-client-0835706842.firebasestorage.app",
  messagingSenderId: "903688979983",
  appId: "1:903688979983:web:631b9b682702f9291e457a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-seblakhauce-9d1a5902-60cf-4c5b-adc3-308261271e85");
