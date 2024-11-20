"use client";

import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className={`relative min-h-screen ${openSans.className}`}>
      {/* Mobile overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed  left-0 h-full z-50
        transition-transform duration-300 ease-in-out
        ${!showSidebar ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'w-64 top-9' : 'w-auto top-0'}
      `}>
        <SideBar />
      </div>

      {/* Main content */}
      <div className={`
        flex flex-col min-h-screen
        
        transition-all duration-300 ease-in-out
        ${showSidebar && !isMobile ? 'ml-[250px] ' : 'ml-0 '}
      `}>
        <Header onMenuClick={toggleSidebar} showMenuButton={isMobile} />
        <main className="flex-grow p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}