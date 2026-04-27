import React from "react";
import { Outlet } from "react-router-dom";
import { GlobalSidebar } from "./GlobalSidebar";

export const GlobalLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-brand-bg-page overflow-hidden">
      <GlobalSidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
