importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDDUJoF3I6FTFqB3C6LqDgcFy2TdAjHWQY",
  authDomain: "hinhub.firebaseapp.com",
  projectId: "hinhub",
  storageBucket: "hinhub.firebasestorage.app",
  messagingSenderId: "973757441582",
  appId: "1:973757441582:web:2781b0e8ffd122a86b21bf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/temp/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
