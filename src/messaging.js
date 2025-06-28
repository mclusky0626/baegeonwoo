import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase"; // we will export 'app' from firebase.js

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }
};

export const retrieveToken = async (registration) => {
  const token = await getToken(messaging, {
    vapidKey: 'YOUR_PUBLIC_VAPID_KEY',
    serviceWorkerRegistration: registration,
  });
  console.log('FCM token', token);
  return token;
};

export const subscribeToMessages = (callback) => {
  onMessage(messaging, callback);
};
