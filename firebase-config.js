import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Configuração do Firebase (Pública para Web App)
const firebaseConfig = {
  apiKey: "AIzaSyCSiGZPSgYQZFL3kr5xiWt9V9NjxzNHkXg",
  authDomain: "sostrattoria.firebaseapp.com",
  projectId: "sostrattoria",
  storageBucket: "sostrattoria.firebasestorage.app",
  messagingSenderId: "979161058099",
  appId: "1:979161058099:web:2b3b448202710ffc8acc46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
