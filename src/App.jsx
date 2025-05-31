import "./styles.css";

import { HomeScreen } from "./HomeScreen/HomeScreen";
import { FeedbackScreen } from "./FeedbackScreen/FeedbackScreen";
import { SettingsScreen } from "./SettingsScreen/SettingsScreen";
import { Frame } from "./Frame/Frame";
import { Week } from "./Week/Week";
import { useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("home");

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen onNavigate={setScreen} />;
      case "settings":
        return <SettingsScreen onNavigate={setScreen} />;
      case "feedback":
        return <FeedbackScreen onNavigate={setScreen} />;
      case "week":
        return <Week onNavigate={setScreen} />;
      case "frame":
        return <Frame onNavigate={setScreen} />;
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  };

  return <div>{renderScreen()}</div>;
}
