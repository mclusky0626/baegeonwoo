import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, isFirebaseConfigured } from "./firebase";

const messaging = isFirebaseConfigured ? getMessaging(app) : null;
let currentToken = null;

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  if (Notification.permission === "granted") return;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  }
};

export const retrieveToken = async (registration) => {
  if (!messaging) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  currentToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration
  });

  return currentToken;
};

export const subscribeToMessages = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};

export const getCurrentToken = () => currentToken;

export const showLocalNotification = (title, options = {}) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const registration = window.swRegistration;
  if (registration && typeof registration.showNotification === "function") {
    registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
};
