// components/Layout.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 페이지 체크해서 탭에 active 스타일 적용하려면 아래처럼 사용
  const isActive = (path) => location.pathname === path;

  const icons = {
    home: {
      active: "home0.svg",
      inactive: "home1.svg",
    },
    week: {
      active: "calendar0.svg",
      inactive: "calendar1.svg",
    },
    settings: {
      active: "settings1.svg",
      inactive: "settings0.svg",
    },
    frame: {
      active: "user1.svg",
      inactive: "user0.svg",
    },
  };

  return (
    <div className="layout">
      {children}
      <nav className="tab-bar">
        <button
          className={isActive("/") ? "active" : ""}
          onClick={() => navigate("/")}
        >
          <img
            src={isActive("/") ? icons.home.active : icons.home.inactive}
            alt="홈"
          />
          <span>홈</span>
        </button>
        <button
          className={isActive("/week") ? "active" : ""}
          onClick={() => navigate("/week")}
        >
          <img
            src={isActive("/week") ? icons.week.active : icons.week.inactive}
            alt="급식표"
          />
          <span>급식표</span>
        </button>
        <button
          className={isActive("/settings") ? "active" : ""}
          onClick={() => navigate("/settings")}
        >
          <img
            src={isActive("/settings") ? icons.settings.active : icons.settings.inactive}
            alt="설정"
          />
          <span>설정</span>
        </button>
        <button
          className={isActive("/frame") ? "active" : ""}
          onClick={() => navigate("/frame")}
        >
          <img
            src={isActive("/frame") ? icons.frame.active : icons.frame.inactive}
            alt="내정보"
          />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  );
};
