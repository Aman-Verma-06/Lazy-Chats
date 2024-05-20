import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "lazy-chat-94ccd.firebaseapp.com",
  projectId: "lazy-chat-94ccd",
  storageBucket: "lazy-chat-94ccd.appspot.com",
  messagingSenderId: "70759327041",
  appId: "1:70759327041:web:c14a0c95ffb022ff152dc0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
