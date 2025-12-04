// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWiiI9Pry30RzK_c4gggd29vWmJx49L5Y",
  authDomain: "sgtask-b21fe.firebaseapp.com",
  projectId: "sgtask-b21fe",
  storageBucket: "sgtask-b21fe.firebasestorage.app",
  messagingSenderId: "913711953990",
  appId: "1:913711953990:web:59d56a8ec3f69e959e3247",
  measurementId: "G-560FFJGHFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);