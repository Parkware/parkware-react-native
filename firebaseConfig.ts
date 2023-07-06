import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import messaging from "@react-native-firebase/messaging"

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAbaNDTkWviU3QwjkUqBYYRYQsA8X31hwU",
    authDomain: "parkware1.firebaseapp.com",
    databaseURL: "https://parkware1-default-rtdb.firebaseio.com",
    projectId: "parkware1",
    storageBucket: "parkware1.appspot.com",
    messagingSenderId: "153016624909",
    appId: "1:153016624909:web:a979b9146fbed76d93b244",
    measurementId: "G-R66F2S5DBX"
};  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
