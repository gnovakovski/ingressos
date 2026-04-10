import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAvX7_zwsTOvaHCqze9GbDmt5OmiyyRPiI",
  authDomain: "ingressos-cfa85.firebaseapp.com",
  projectId: "ingressos-cfa85",
  storageBucket: "ingressos-cfa85.firebasestorage.app",
  messagingSenderId: "674243579015",
  appId: "1:674243579015:web:9ead6517f03e9062263c22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar persistência LOCAL (mantém login após reload)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase Auth: Persistência LOCAL configurada');
  })
  .catch((error) => {
    console.error('❌ Erro ao configurar persistência:', error);
  });
