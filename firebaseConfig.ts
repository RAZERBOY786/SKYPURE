import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence,
  getAuth 
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyADvnDEeMtn_RT9_kTgU2VH3Q5pnQV-97U",
  authDomain: "aqi3-28c7d.firebaseapp.com",
  projectId: "aqi3-28c7d",
  storageBucket: "aqi3-28c7d.firebasestorage.app",
  messagingSenderId: "479875399952",
  appId: "1:479875399952:web:707cd367177993dec16595",
  measurementId: "G-JKLRM9RQJ3"
};

// 1. Initialize Firebase App (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth with Persistence
// We use a check here as well to prevent re-initialization errors during hot reloads
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  // If initializeAuth fails because it's already initialized, just get the existing instance
  auth = getAuth(app);
}

export { auth };
export default app;