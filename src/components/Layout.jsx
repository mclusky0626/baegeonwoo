// components/Layout.jsx
import React from "react";
import { TabBar } from "./TabBar";
import "./Layout.css";

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      {children}
      <TabBar />
    </div>
  );
};
