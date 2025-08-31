import { NavLink } from "react-router-dom";
import "./TabBar.css";

// Tab bar navigation updated by ChatGPT agent
export const TabBar = () => {
  const tabs = [
    { key: "home", path: "/", icon: { active: "home1.svg", inactive: "home0.svg" }, label: "홈" },
    { key: "week", path: "/week", icon: { active: "calendar1.svg", inactive: "calendar0.svg" }, label: "급식표" },
    { key: "feedback", path: "/feedback", icon: { active: "message-square-blue.svg", inactive: "message-square-gray.svg" }, label: "피드백" },
    { key: "settings", path: "/settings", icon: { active: "settings1.svg", inactive: "settings0.svg" }, label: "설정" },
    { key: "frame", path: "/frame", icon: { active: "user1.svg", inactive: "user0.svg" }, label: "내정보" },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(({ key, path, icon, label }) => (
        <NavLink
          key={key}
          to={path}
          end
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          {({ isActive }) => (
            <>
              <img src={isActive ? icon.active : icon.inactive} alt={label} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

