import { NavLink } from "react-router-dom";
import "./TabBar.css";

export const TabBar = () => {
  const tabs = [
    { key: "home",     path: "/home",     icon: "home0.svg",     label: "홈" },
    { key: "week",     path: "/week",     icon: "calendar0.svg", label: "급식표" },
    { key: "settings", path: "/settings", icon: "settings1.svg", label: "설정" },
    { key: "frame",    path: "/profile",  icon: "user0.svg",     label: "내정보" },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(({ key, path, icon, label }) => (
        <NavLink
          key={key}
          to={path}
          className={({ isActive }) => isActive ? "tab active" : "tab"}
        >
          <img src={icon} alt={label} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
