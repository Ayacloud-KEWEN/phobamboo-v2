
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc, 
    increment, serverTimestamp, getDocs, query, where, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
    getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDRRMf2xyHyEN9gfXn1kcellNT20oM6RqU",
    authDomain: "phobamboo-app.firebaseapp.com",
    projectId: "phobamboo-app",
    storageBucket: "phobamboo-app.firebasestorage.app",
    messagingSenderId: "174810940117",
    appId: "1:174810940117:web:39a47c88e5f2b638f8585c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


window.db = db;
window.storage = storage;

window.Firestore = { 
    collection, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc, 
    increment, serverTimestamp, getDocs, query, where, orderBy, onSnapshot 
};

window.Storage = { 
    ref, uploadBytes, getDownloadURL 
};

window.auth = getAuth(app); 
window.Auth = { signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail };

console.log("🔥 Firebase initialisé avec succès !");