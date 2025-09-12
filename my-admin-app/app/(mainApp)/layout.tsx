"use client";

import React, { useState, useEffect } from "react";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { Open_Sans } from "next/font/google";
import "../globals.css";
import { initPusherBeams } from "@/lib/pusher-beams";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);



  useEffect(() => {

    if (typeof window !== 'undefined') {
      // Initialize Pusher Beams only once when the app loads
      initPusherBeams()
        .then(() => {
          console.log('Pusher Beams initialized successfully in admin dashboard');
        })
        .catch((error) => {
          console.error('Failed to initialize Pusher Beams:', error);
        });
    }

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
    <div className={`relative min-h-screen bg-dashboard-neutral-50 ${openSans.className}`}>
      {/* Mobile overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 h-full z-50 shadow-lg
        transition-transform duration-300 ease-in-out
        ${!showSidebar ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'w-72 top-0' : 'w-[250px] top-0'}
      `}>
        <SideBar />
      </div>

      {/* Main content */}
      <div className={`
        flex flex-col min-h-screen
        transition-all duration-300 ease-in-out
        ${showSidebar && !isMobile ? 'ml-[250px]' : 'ml-0'}
      `}>
        <Header onMenuClick={toggleSidebar} showMenuButton={true} />
        <main className="flex-grow p-2 md:p-4 overflow-x-hidden">
          {children}
        </main>
        <footer className="py-3 px-4 text-center text-sm text-dashboard-neutral-500 border-t border-dashboard-neutral-200">
          © {new Date().getFullYear()} ITA Luxury Admin - Tous droits réservés
        </footer>
      </div>
    </div>
  );
}