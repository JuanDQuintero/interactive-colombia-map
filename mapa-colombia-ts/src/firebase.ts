// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAXvKCbXieChfsoqF_4TIGjP0lgwMKdeac",
    authDomain: "colombia-regions.firebaseapp.com",
    projectId: "colombia-regions",
    storageBucket: "colombia-regions.firebasestorage.app",
    messagingSenderId: "873437406314",
    appId: "1:873437406314:web:8f937a30f29c7de2ff5613",
    measurementId: "G-YETD7750VB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);