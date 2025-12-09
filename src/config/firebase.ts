// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Thay thế bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAc7v-xzqesms0P43noy0Zqrq9ebK24_jU",
  authDomain: "noteapp-notification.firebaseapp.com",
  projectId: "noteapp-notification",
  storageBucket: "noteapp-notification.firebasestorage.app",
  messagingSenderId: "995112479194",
  appId: "1:995112479194:web:aea4aa433059740dd4b8e3"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();