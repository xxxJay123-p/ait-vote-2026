// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCypsXRAMzZ1GJRrv6fH_uz6AVt9I4iH04",
    authDomain: "votetest-e53fb.firebaseapp.com",
    projectId: "votetest-e53fb",
    storageBucket: "votetest-e53fb.firebasestorage.app",
    messagingSenderId: "613136322508",
    appId: "1:613136322508:web:0f18175b0255a384de5769",
    measurementId: "G-PKR42CZE9H"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };

