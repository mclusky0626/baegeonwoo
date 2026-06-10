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

// 서비스 워커 등록. 알림 권한 요청은 로그인 이후에만 진행한다.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      window.swRegistration = registration;
    } catch (err) {
      console.log('Service worker registration failed', err);
    }
  });
}
