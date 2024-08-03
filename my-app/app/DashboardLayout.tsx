"use client";

import React from "react";
import SideBar from "./components/SideBar";
import Header from "./components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-shrink-0">
        <SideBar />
      </div>
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <main className="flex-grow overflow-y-auto">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
