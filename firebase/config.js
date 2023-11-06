import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDgjTU0gqWpNBHYm_aYjmmb5rvDisF68jo",
  authDomain: "shelbro-897b9.firebaseapp.com",
  projectId: "shelbro-897b9",
  storageBucket: "shelbro-897b9.appspot.com",
  messagingSenderId: "242376493390",
  appId: "1:242376493390:web:20861050d45d80db23761f",
  measurementId: "G-3MJHHZN7QR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
