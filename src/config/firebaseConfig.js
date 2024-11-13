import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAloMfLyz3EVZxEpbwD-PAtvXUudUYjjCE",
    authDomain: "travel-buddy-vit.firebaseapp.com",
    databaseURL: "https://travel-buddy-vit-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "travel-buddy-vit",
    storageBucket: "travel-buddy-vit.firebasestorage.app",
    messagingSenderId: "653051773627",
    appId: "1:653051773627:web:f945cc8dd21eedceaf5f9e",
    measurementId: "G-KPLSVJQXJX"
};

const firebase = initializeApp(firebaseConfig);


export const auth = getAuth(firebase);
