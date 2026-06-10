import { CalendarDays, Home, Settings, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./TabBar.css";

export const TabBar = () => {
  const tabs = [
    { key: "home", path: "/", icon: Home, label: "홈", end: true },
    { key: "week", path: "/week", icon: CalendarDays, label: "급식표" },
    { key: "settings", path: "/settings", icon: Settings, label: "설정" },
    { key: "frame", path: "/frame", icon: UserRound, label: "내정보" }
  ];

  return (
    <nav className="tab-bar" aria-label="Primary">
      {tabs.map(({ key, path, icon: Icon, label, end }) => (
        <NavLink
          key={key}
          to={path}
          end={end}
          className={({ isActive }) => isActive ? "tab active" : "tab"}
        >
          <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
