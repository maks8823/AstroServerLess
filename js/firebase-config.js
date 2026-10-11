import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsMJcI8l1QN5bKj8Dijk3HM2j-5sVmxJk",
  authDomain: "astrodb-753cd.firebaseapp.com",
  projectId: "astrodb-753cd",
  storageBucket: "astrodb-753cd.firebasestorage.app",
  messagingSenderId: "698471288597",
  appId: "1:698471288597:web:5b277c573a2b99c29da31c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);