importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

try {
  importScripts("/firebase-config.js");
} catch (error) {
  console.warn("Firebase service worker config was not found.", error);
}

if (self.FIREBASE_CONFIG) {
  firebase.initializeApp(self.FIREBASE_CONFIG);

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload?.notification?.title || "급식 알림";
    const notificationOptions = {
      body: payload?.notification?.body || "",
      icon: "/icon.png"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
