import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if all required environment variables are present
// const requiredEnvVars = [
//   'NEXT_PUBLIC_FIREBASE_API_KEY',
//   'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
//   'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
//   'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
//   'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
//   'NEXT_PUBLIC_FIREBASE_APP_ID'
// ];

// const missingEnvVars = requiredEnvVars.filter(
//   (envVar) => !process.env[envVar]
// );

// if (missingEnvVars.length > 0) {
//   console.error('Missing required Firebase environment variables:', missingEnvVars);
//   throw new Error('Missing required Firebase environment variables. Please check your .env.local file.');
// }

const firebaseConfig = {
    apiKey: "AIzaSyCKW1nL8OHzmnh_SZzZGzMeA01WjTe001E",
    authDomain: "altf4riends-sc-3fd4a.firebaseapp.com",
    projectId: "altf4riends-sc-3fd4a",
    storageBucket: "altf4riends-sc-3fd4a.firebasestorage.app",
    messagingSenderId: "177795751044",
    appId: "1:177795751044:web:56767645540f7ec325b6d1",
    measurementId: "G-BZZCZ6VYJV"
  };

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

console.log("App" , app);
export { app, auth, db }; 