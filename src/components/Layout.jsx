// components/Layout.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 페이지 체크해서 탭에 active 스타일 적용하려면 아래처럼 사용
  const getActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <div className="layout">
      {children}
      <nav className="tab-bar">
        <button
          className={getActive("/")}
          onClick={() => navigate("/")}
        >
          <img src="home0.svg" alt="홈" />
          <span>홈</span>
        </button>
        <button
          className={getActive("/week")}
          onClick={() => navigate("/week")}
        >
          <img src="calendar0.svg" alt="급식표" />
          <span>급식표</span>
        </button>
        <button
          className={getActive("/settings")}
          onClick={() => navigate("/settings")}
        >
          <img src="settings1.svg" alt="설정" />
          <span>설정</span>
        </button>
        <button
          className={getActive("/frame")}
          onClick={() => navigate("/frame")}
        >
          <img src="user0.svg" alt="내정보" />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  );
};
