import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "твій_ключ",
  authDomain: "твій_проект.firebaseapp.com",
  projectId: "твій_проект",
  storageBucket: "твій_проект.appspot.com",
  messagingSenderId: "1234567890",
  appId: "твій_app_id"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
