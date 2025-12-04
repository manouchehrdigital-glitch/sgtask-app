// --- Firebase Configuration ---
// این قسمت را با مقادیر خودتان از کنسول فایربیس پر کنید
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
// بقیه کد مثل قبل...
const appId = "sgtask-production"; // یک اسم ثابت بگذارید