import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './styles.css';
import './vars.css';

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 서비스 워커 등록 + 푸시 알림 초기화
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // 전역 등록 (로컬 알림에서 사용됨)
      window.swRegistration = registration;

      // 메시징 모듈 import 및 실행
      const { requestNotificationPermission, retrieveToken } = await import('./messaging');
      await requestNotificationPermission();
      await retrieveToken(registration);
    } catch (err) {
      console.log('Service worker registration failed', err);
    }
  });
}
