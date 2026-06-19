import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_CHANNEL_ID = "meal_updates";
const TOKEN_TIMEOUT_MS = 15000;

let listenersReady = false;
let currentToken = null;
let pendingRegistration = null;

export const isNativePushAvailable = () => {
  return Capacitor.isNativePlatform();
};

const createDefaultChannel = async () => {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    await PushNotifications.createChannel({
      id: DEFAULT_CHANNEL_ID,
      name: "급식 알림",
      description: "맞춤 급식 변경과 로그인 알림",
      importance: 4,
      visibility: 1,
      lights: true,
      vibration: true
    });
  } catch (error) {
    console.warn("알림 채널 생성을 건너뜁니다:", error);
  }
};

const ensureListeners = async () => {
  if (listenersReady) return;
  listenersReady = true;

  await PushNotifications.addListener("registration", (token) => {
    currentToken = token.value;
    pendingRegistration?.resolve(token.value);
    pendingRegistration = null;
  });

  await PushNotifications.addListener("registrationError", (error) => {
    pendingRegistration?.reject(new Error(error.error || "Native push registration failed"));
    pendingRegistration = null;
  });

  await PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.info("네이티브 푸시 알림 수신:", notification);
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
    console.info("네이티브 푸시 알림 열림:", event.notification);
  });
};

const waitForRegistrationToken = async () => {
  if (currentToken) return currentToken;
  if (registrationPromise) return registrationPromise;

  registrationPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      if (!pendingRegistration) return;
      pendingRegistration = null;
      registrationPromise = null;
      reject(new Error("Native push token request timed out"));
    }, TOKEN_TIMEOUT_MS);

    pendingRegistration = {
      resolve: (token) => {
        window.clearTimeout(timeout);
        registrationPromise = null;
        resolve(token);
      },
      reject: (error) => {
        window.clearTimeout(timeout);
        registrationPromise = null;
        reject(error);
      }
    };

    PushNotifications.register().catch((error) => {
      window.clearTimeout(timeout);
      pendingRegistration = null;
      registrationPromise = null;
      reject(error);
    });
  });

  return registrationPromise;
};

export const registerNativePushNotifications = async (user) => {
  if (!user || !isNativePushAvailable()) return null;

  await ensureListeners();
  await createDefaultChannel();

  const currentPermission = await PushNotifications.checkPermissions();
  const permission = currentPermission.receive === "granted"
    ? currentPermission
    : await PushNotifications.requestPermissions();

  if (permission.receive !== "granted") {
    return null;
  }

  const token = await waitForRegistrationToken();

  await setDoc(doc(db, "users", user.uid), {
    fcmTokens: arrayUnion(token),
    nativeFcmTokens: arrayUnion(token),
    notificationPlatform: Capacitor.getPlatform(),
    notificationsUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return token;
};
