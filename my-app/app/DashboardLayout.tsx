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
    <div className="flex w-full">
      <SideBar />
      <div className="h-full w-full">
        <Header />
        <div className="w-full h-full flex flex-col relative">
          <main className="flex justify-center items-center w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
