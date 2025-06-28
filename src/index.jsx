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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const { requestNotificationPermission, retrieveToken } = await import('./messaging');
      await requestNotificationPermission();
      await retrieveToken(registration);
    } catch (err) {
      console.log('Service worker registration failed', err);
    }
  });
}
