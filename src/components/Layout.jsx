// components/Layout.jsx
import React from "react";
import "./Layout.css"; // Assuming you have a CSS file for styling


export const Layout = ({ children, onNavigate }) => {
  return (
    <div className="layout">
      {children}
      <nav className="tab-bar">
        <button onClick={() => onNavigate("home")}><img src="home0.svg" /><span>홈</span></button>
        <button onClick={() => onNavigate("week")}><img src="calendar0.svg" /><span>급식표</span></button>
        <button onClick={() => onNavigate("settings")}><img src="settings1.svg" /><span>설정</span></button>
        <button onClick={() => onNavigate("frame")}><img src="user0.svg" /><span>내정보</span></button>
      </nav>
    </div>
  );
};
