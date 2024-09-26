"use client";

import React from "react";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { Open_Sans } from "next/font/google";
import "../globals.css";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const openSans = Open_Sans({
  subsets: ["cyrillic"],
});
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen overflow-hidden ${openSans.className}`}>
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
