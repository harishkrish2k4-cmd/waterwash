// Firebase Configuration
// Replace with your Firebase project credentials

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6idJ0s3SLyoROG9Mnd94cSbMGfnEFf6k",
  authDomain: "waterwash-b94c0.firebaseapp.com",
  projectId: "waterwash-b94c0",
  storageBucket: "waterwash-b94c0.firebasestorage.app",
  messagingSenderId: "272358228908",
  appId: "1:272358228908:web:4836c9facc6712ef9d3009",
  measurementId: "G-1M1N84B3SG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app for other uses
export default app;
