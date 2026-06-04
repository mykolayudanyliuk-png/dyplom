import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbxE5RGU8E0VUdnHcBmEwOjZg089YoBhg",
  authDomain: "shortnews-96e93.firebaseapp.com",
  projectId: "shortnews-96e93",
  storageBucket: "shortnews-96e93.firebasestorage.app",
  messagingSenderId: "711200978225",
  appId: "1:711200978225:web:aee27598daf1fc39c06c10",
  measurementId: "G-DYDBB6D18M",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USER_ID = "default_user";

export const addBookmark = async (newsItem) => {
  const ref = doc(db, "users", USER_ID, "bookmarks", newsItem.id);
  await setDoc(ref, newsItem);
};

export const removeBookmark = async (id) => {
  const ref = doc(db, "users", USER_ID, "bookmarks", id);
  await deleteDoc(ref);
};

export const loadBookmarks = async () => {
  const snap = await getDocs(collection(db, "users", USER_ID, "bookmarks"));
  const result = {};
  snap.forEach((d) => { result[d.id] = d.data(); });
  return result;
};

export const addLike = async (id) => {
  const ref = doc(db, "users", USER_ID, "likes", id);
  await setDoc(ref, { liked: true });
};

export const removeLike = async (id) => {
  const ref = doc(db, "users", USER_ID, "likes", id);
  await deleteDoc(ref);
};

export const loadLikes = async () => {
  const snap = await getDocs(collection(db, "users", USER_ID, "likes"));
  const result = {};
  snap.forEach((d) => { result[d.id] = true; });
  return result;
};