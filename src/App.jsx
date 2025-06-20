import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import i18n from "./i18n";
import { HomeScreen } from "./HomeScreen/HomeScreen";
import { FeedbackScreen } from "./FeedbackScreen/FeedbackScreen";
import { SettingsScreen } from "./SettingsScreen/SettingsScreen";
import { Frame } from "./Frame/Frame";
import { PrivacyPolicy } from "./PrivacyPolicy/PrivacyPolicy";
import { Week } from "./Week/Week";
import { Layout } from "./components/Layout";
// (선택) NotFound 페이지
const NotFound = () => (
  <div style={{ padding: 40, textAlign: "center" }}>
    <h2>404 Not Found</h2>
    <p>없는 페이지입니다.</p>
    <a href="/">홈으로</a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/feedback" element={<FeedbackScreen />} />
        <Route path="/week" element={<Week />} />
        <Route path="/frame" element={<Frame />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        <Route path="" element={<NotFound />} />
      </Routes>
      <Layout/>
    </BrowserRouter>
  );
}