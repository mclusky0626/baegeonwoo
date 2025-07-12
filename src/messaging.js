// firebase-messaging.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase"; // firebase.js에서 export한 'app'

const messaging = getMessaging(app);

let currentToken = null;

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  }
};

// FCM 토큰 가져오기
export const retrieveToken = async (registration) => {
  currentToken = await getToken(messaging, {
    vapidKey: "973757441582", // 여기에 VAPID 키 입력
    serviceWorkerRegistration: registration,
  });
  console.log("FCM token", currentToken);
  return currentToken;
};

// 메시지 수신시 콜백 처리
export const subscribeToMessages = (callback) => {
  onMessage(messaging, callback);
};

export const getCurrentToken = () => currentToken;

// 로컬 푸시 알림 표시
export const showLocalNotification = (title, options = {}) => {
  const reg = window.swRegistration;
  if (reg && typeof reg.showNotification === "function") {
    reg.showNotification(title, options);
  } else if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
