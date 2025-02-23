// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

// Import the functions you need from the SDKs you need


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth for authentication
import { getAnalytics } from "firebase/analytics"; // Optional: For analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjB16IY1HDHajR4YEbXuVGreNoEzlluoA",
  authDomain: "website-karabubi.firebaseapp.com",
  projectId: "website-karabubi",
  storageBucket: "website-karabubi.firebasestorage.app",
  messagingSenderId: "78709230696",
  appId: "1:78709230696:web:459e5771035601cd5effdd",
  measurementId: "G-TWJ8Z3YXG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Initialize auth
const analytics = getAnalytics(app); // Optional: Initialize analytics

// Export the services you need
export { auth, analytics }; // Export auth and analytics