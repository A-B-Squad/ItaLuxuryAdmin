// Import the necessary Firebase modules
import firebase from "firebase/app";
import "firebase/messaging";

// Initialize the Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyARF2t7iRIURZ8kPLIaidkMggfJGmFoVFI",
  authDomain: "ita-luxury.firebaseapp.com",
  projectId: "ita-luxury",
  storageBucket: "ita-luxury.appspot.com",
  messagingSenderId: "442249656633",
  appId: "1:442249656633:web:c92a2b0185a140570f90e8",
  measurementId: "G-GDPGKPJKW1",
};

firebase.initializeApp(firebaseConfig);

// // Get the Firebase Messaging instance
// const messaging = firebase.messaging();

// // Request permission to receive notifications
// messaging
//   .requestPermission()
//   .then(() => {
//     console.log("Notification permission granted.");

//     // Get the token for the user's device
//     messaging
//       .getToken()
//       .then((currentToken) => {
//         if (currentToken) {
//           // Use the token to send notifications to this device
//           console.log("Device token:", currentToken);
//           // Store the token in your server-side database or application state
//         } else {
//           console.log("No device token available.");
//         }
//       })
//       .catch((err) => {
//         console.log("An error occurred while retrieving the token:", err);
//       });
//   })
//   .catch((err) => {
//     console.log("Unable to get permission to notify.", err);
//   });

// // Set up a listener to handle incoming FCM messages
// messaging.onMessage((payload) => {
//   console.log("Received message:", payload);

//   // Display the notification to the user
//   showNotification(payload.notification.title, payload.notification.body);
// });

// // Helper function to display the notification
// function showNotification(title, body) {
//   // Use the browser's built-in notification API to display the notification
//   if (Notification.permission === "granted") {
//     new Notification(title, { body });
//   } else if (Notification.permission !== "denied") {
//     Notification.requestPermission().then((permission) => {
//       if (permission === "granted") {
//         new Notification(title, { body });
//       }
//     });
//   }
// }
